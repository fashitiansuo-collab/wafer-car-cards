"""Check what a car photo actually shows, before choosing it for a card.

Thumbnails hide the obvious: a rear three-quarter, a car half hidden behind another, or a car
that is a speck in a landscape all look like "a car" at 300px. This finds the evidence in the
frame with an open-vocabulary detector (OWLv2, runs locally on the CPU):

- the largest car, and how much of the photo it fills;
- headlights and taillights that sit on that car.

From that it decides whether the car's face is what the photo is about.

    python scripts/photo-check.py public/cards/*.jpg          # files
    python scripts/photo-check.py --cards                      # every card in src/data/cards.json
    python scripts/photo-check.py --json out.json img1.jpg ...
    python scripts/photo-check.py --boxes outdir img.jpg       # also draw what was found

Needs torch (CPU) + transformers. In this repo they live in .superpowers/pf/clip (git-ignored):
    PYTHONPATH=.superpowers/pf/clip python scripts/photo-check.py --cards
The first run downloads the model weights (~600 MB) into the Hugging Face cache.

Verdicts:
    OK      one car is the subject and its headlights face the camera
    CHECK   probably fine but something is weak (side view, small car, lights unclear): look full size
    REJECT  rear view, or no car big enough to be the subject
"""

import argparse
import glob
import json
import sys
from pathlib import Path

MODEL = 'google/owlv2-base-patch16-ensemble'
# OWLv2 scores "a car" low on race cars and kei trucks, so any of these counts as the vehicle.
VEHICLE = ['a car', 'a sports car', 'a race car', 'a truck', 'a vehicle']
QUERIES = VEHICLE + ['a car headlight', 'a car taillight', 'a bus']
CAR_MIN = 0.25      # a car's box must cover this share of the frame to be "the subject"
CAR_SMALL = 0.08    # below this the car is a detail of a landscape


def load():
    try:
        import torch
        from transformers import Owlv2ForObjectDetection, Owlv2Processor
    except ImportError:
        sys.exit('torch / transformers not found. Set PYTHONPATH to the folder they are installed in.')
    proc = Owlv2Processor.from_pretrained(MODEL)
    model = Owlv2ForObjectDetection.from_pretrained(MODEL).eval()
    return proc, model, torch


def inside(box, car, pad=0.08):
    x0, y0, x1, y1 = car
    w, h = x1 - x0, y1 - y0
    cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
    return x0 - w * pad <= cx <= x1 + w * pad and y0 - h * pad <= cy <= y1 + h * pad


def check(path, proc, model, torch, boxes_dir=None):
    from PIL import Image

    img = Image.open(path).convert('RGB')
    W, H = img.size
    with torch.no_grad():
        inputs = proc(text=[QUERIES], images=img, return_tensors='pt')
        out = model(**inputs)
    # OWLv2 pads to a square; boxes come back in the padded frame.
    side = max(W, H)
    res = proc.post_process_grounded_object_detection(out, threshold=0.12, target_sizes=torch.tensor([[side, side]]))[0]
    found = {q: [] for q in QUERIES}
    for s, l, b in zip(res['scores'].tolist(), res['labels'].tolist(), res['boxes'].tolist()):
        b = [max(0, b[0]), max(0, b[1]), min(W, b[2]), min(H, b[3])]
        found[QUERIES[l]].append((s, b))

    def iou(a, b):
        ix = max(0, min(a[2], b[2]) - max(a[0], b[0]))
        iy = max(0, min(a[3], b[3]) - max(a[1], b[1]))
        u = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - ix * iy
        return ix * iy / u if u else 0

    # A bus or coach behind the car is not the subject.
    buses = [b for s, b in found['a bus'] if s >= 0.3]
    cars = [(s, b) for q in VEHICLE for s, b in found[q]
            if s >= 0.2 and not any(iou(b, bb) > 0.6 for bb in buses)]
    area = lambda b: (b[2] - b[0]) * (b[3] - b[1]) / (W * H)
    car = max(cars, key=lambda c: area(c[1]))[1] if cars else None
    share = area(car) if car else 0.0
    # Lights count only when they sit on the subject car (tight margin, so a car behind it does not lend its lamps).
    def lamps(q):
        kept = []
        for s, b in sorted(found[q], reverse=True):
            # Clearly inside the car (not on its edge, where a neighbour's lamps sit), one box per lamp.
            if car and s >= 0.15 and inside(b, car, -0.03) and not any(iou(b, k) > 0.3 for _, k in kept):
                kept.append((s, b))
        return [s for s, _ in kept]

    head, tail = lamps('a car headlight'), lamps('a car taillight')
    big = [c for c in cars if area(c[1]) > share * 0.6 and iou(c[1], car) < 0.5] + ([car] if car else [])

    def side_lamps():
        # A long, low box with lamps at both ends is a side profile, not a rear view.
        x0, y0, x1, y1 = car
        w = x1 - x0
        if w / max(1, y1 - y0) < 1.8:
            return False
        xs = [(b[0] + b[2]) / 2 for s, b in found['a car taillight'] + found['a car headlight'] if inside(b, car) and s >= 0.15]
        return any(x < x0 + w * 0.15 for x in xs) and any(x > x1 - w * 0.15 for x in xs)

    why = []
    if not car or share < CAR_SMALL:
        verdict, why = 'REJECT', ['no car big enough to be the subject']
    elif tail and side_lamps():
        verdict, why = 'CHECK', ['flat side view (lamps at both ends)']
    elif tail and not head:
        verdict, why = 'REJECT', ['rear view: taillights but no headlights']
    elif len(tail) > len(head) and max(tail) > max(head, default=0):
        verdict, why = 'REJECT', ['mostly rear: taillights outweigh headlights']
    else:
        if share < CAR_MIN:
            why.append(f'car fills only {share:.0%} of the frame')
        if not head:
            why.append('no headlight found (flat side view or hidden face)')
        if len(big) > 1:
            why.append(f'{len(big)} cars of similar size')
        verdict = 'CHECK' if why else 'OK'

    if boxes_dir:
        from PIL import ImageDraw

        d = ImageDraw.Draw(img)
        if car:
            d.rectangle(car, outline='yellow', width=4)
        for q, colour in (('a car headlight', 'cyan'), ('a car taillight', 'red')):
            for s, b in found[q]:
                if car and inside(b, car) and s >= 0.15:
                    d.rectangle(b, outline=colour, width=3)
        Path(boxes_dir).mkdir(parents=True, exist_ok=True)
        img.save(Path(boxes_dir) / Path(path).name)

    heads = [b for s_, b in found['a car headlight'] if car and s_ >= 0.15 and inside(b, car, -0.03)]
    tails_b = [b for s_, b in found['a car taillight'] if car and s_ >= 0.15 and inside(b, car, -0.03)]
    return {'file': str(path), 'verdict': verdict, 'why': why, 'car_share': round(share, 3),
            'headlights': len(head), 'taillights': len(tail), 'cars': len(cars),
            '_size': (W, H), '_car': car, '_heads': heads, '_tails': tails_b}


# Photo window of each frame (width / height), from src/cards/frames.css.
WINDOW = {'gallery': 91 / 92, 'watermark': 100 / 104, 'litt': 1.0, 'palette': 86 / 78, 'window': 84.8 / 76}


def fit(r, aspect):
    """Pick object-position so the card's crop keeps the car's face in view.

    With object-fit: cover only one axis is cropped. The crop is centred on the car when the whole
    car fits; otherwise it slides toward the headlights so they sit inside with a margin. Returns
    the focus string and what the crop shows."""
    W, H = r['_size']
    car, heads = r['_car'], r['_heads']
    if not car:
        return '50% 50%', {'face_in': False, 'car_in': 0.0, 'note': 'no car found'}
    horizontal = W / H > aspect
    span = W if horizontal else H
    cw = H * aspect if horizontal else W / aspect          # crop length along the cropped axis
    lo, hi = (0, 2) if horizontal else (1, 3)
    c0, c1 = car[lo], car[hi]
    # The "face" is the whole front end: from the headlights out to the car's front edge (bumper,
    # grille). Which end is the front: the end nearer the headlights, or failing that the end away
    # from the taillights. A headlight alone inside the crop is not enough (the grille can be cut).
    face = None
    mid = (c0 + c1) / 2
    tails = r.get('_tails') or []
    # A rear shot is as good as a front one: keep whichever end the photo shows (its lamps face
    # the camera), out to that end's edge.
    showing_rear = len(tails) > len(heads)
    if heads and tails:
        hc = sum((x[lo] + x[hi]) / 2 for x in heads) / len(heads)
        tc = sum((x[lo] + x[hi]) / 2 for x in tails) / len(tails)
        if (hc - mid) * (tc - mid) < 0:
            showing_rear = False   # lamps at opposite ends: a side profile, keep the front
    lamps_shown = tails if showing_rear else heads
    if lamps_shown:
        h0, h1 = min(b[lo] for b in lamps_shown), max(b[hi] for b in lamps_shown)
        face = (h0, c1) if (h0 + h1) / 2 > mid else (c0, h1)
    elif tails:
        t = sum((b[lo] + b[hi]) / 2 for b in tails) / len(tails)
        depth = (c1 - c0) * 0.3
        face = (c0, c0 + depth) if t > mid else (c1 - depth, c1)
    start = (c0 + c1) / 2 - cw / 2                         # centre on the car
    if face:
        pad = cw * 0.04
        if face[0] - pad < start:
            start = face[0] - pad
        if face[1] + pad > start + cw:
            start = face[1] + pad - cw
    start = max(0, min(span - cw, start))
    pct = 50 if span - cw < 1 else round(start / (span - cw) * 100)
    focus = f'{pct}% 50%' if horizontal else f'50% {pct}%'
    inter = max(0, min(c1, start + cw) - max(c0, start))
    info = {'car_in': round(inter / max(1, c1 - c0), 2),
            'face_in': bool(face and face[0] >= start - 1 and face[1] <= start + cw + 1),
            'crop': (start, start + cw), 'horizontal': horizontal}
    info['end'] = 'rear' if showing_rear else 'front'
    if not heads and not tails:
        info['note'] = 'no lamps found: which end matters is unknown'
    if face and face[1] - face[0] > cw:
        info['note'] = 'front end wider than the crop'
    return focus, info


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('files', nargs='*')
    ap.add_argument('--cards', action='store_true', help='check every card image in src/data/cards.json')
    ap.add_argument('--series', type=int, default=1, help='series to use (2 reads src/data/cards-s2.json)')
    ap.add_argument('--json', help='also write the full results to this file')
    ap.add_argument('--boxes', help='write copies with the detected car / lights drawn into this folder')
    ap.add_argument('--fit', action='store_true',
                    help='with --cards: judge the crop each card actually shows, set focus so the face stays in it, '
                         'and write focus to src/data/cards.json and scripts/lineup.json')
    a = ap.parse_args()

    root = Path(__file__).resolve().parent.parent
    suffix = '' if a.series == 1 else f'-s{a.series}'
    files = []
    if a.cards:
        cards = json.loads((root / f'src/data/cards{suffix}.json').read_text(encoding='utf-8'))
        files += [root / 'public' / c['image'].removeprefix('./') for c in cards]
    for f in a.files:
        files += [Path(p) for p in glob.glob(f)] or [Path(f)]
    if not files:
        ap.error('no images given')

    proc, model, torch = load()
    if a.fit:
        return fit_cards(root, proc, model, torch, a)
    rows = []
    for f in files:
        r = check(f, proc, model, torch, a.boxes)
        rows.append(r)
        print(f"{r['verdict']:6}  car {r['car_share']:4.0%}  H{r['headlights']} T{r['taillights']}  "
              f"{Path(r['file']).name:<14} {'; '.join(r['why'])}", flush=True)
    n = {v: sum(r['verdict'] == v for r in rows) for v in ('OK', 'CHECK', 'REJECT')}
    print(f"\n{len(rows)} images: {n['OK']} OK, {n['CHECK']} CHECK, {n['REJECT']} REJECT")
    if a.json:
        Path(a.json).write_text(json.dumps(rows, indent=2), encoding='utf-8')


def fit_cards(root, proc, model, torch, a):
    from PIL import Image, ImageDraw

    suffix = '' if a.series == 1 else f'-s{a.series}'
    cards_path = root / f'src/data/cards{suffix}.json'
    cards = json.loads(cards_path.read_text(encoding='utf-8'))
    lineup_path = root / f'scripts/lineup{suffix}.json'
    lineup = json.loads(lineup_path.read_text(encoding='utf-8'))
    rows = []
    for c in cards:
        img = root / 'public' / c['image'].removeprefix('./')
        if c.get('focusManual'):
            print(f"KEPT     {c['id']}  focus {c['focus']:<8} (set by hand)", flush=True)
            rows.append((c['id'], 'OK', c['focus'], {}))
            continue
        r = check(img, proc, model, torch)
        focus, info = fit(r, WINDOW[c.get('frame', 'gallery')])
        c['focus'] = focus
        bad = not info['face_in'] or info['car_in'] < 0.6
        verdict = 'REPLACE?' if bad and info.get('note') else ('CHECK' if bad else 'OK')
        rows.append((c['id'], verdict, focus, info))
        print(f"{verdict:8} {c['id']}  focus {focus:<8} {info.get('end', '?'):5} end {'in ' if info['face_in'] else 'OUT'}  "
              f"car {info['car_in']:.0%} in crop  {info.get('note', '')}", flush=True)
        if a.boxes:
            im = Image.open(img).convert('RGB')
            d = ImageDraw.Draw(im)
            W, H = im.size
            if r['_car']:
                d.rectangle(r['_car'], outline='yellow', width=3)
                for b in r['_heads']:
                    d.rectangle(b, outline='cyan', width=3)
            if 'crop' in info:
                s0, s1 = info['crop']
                box = (s0, 0, s1, H) if info['horizontal'] else (0, s0, W, s1)
                shade = Image.new('L', im.size, 110)
                ImageDraw.Draw(shade).rectangle(box, fill=255)
                im = Image.composite(im, Image.new('RGB', im.size, 'black'), shade)
                ImageDraw.Draw(im).rectangle(box, outline='white', width=3)
            Path(a.boxes).mkdir(parents=True, exist_ok=True)
            im.save(Path(a.boxes) / f"{c['id']}.jpg")
    cards_path.write_text(json.dumps(cards, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    order = {'C': 0, 'UC': 1, 'R': 2, 'UR': 3, 'SEC': 4}
    ranked = sorted(range(len(lineup)), key=lambda i: (order[lineup[i]['rarity']], i))
    for c, i in zip(cards, ranked):
        lineup[i]['focus'] = c['focus']
    lineup_path.write_text(json.dumps(lineup, ensure_ascii=False, indent=2), encoding='utf-8')
    n = {v: sum(r[1] == v for r in rows) for v in ('OK', 'CHECK', 'REPLACE?')}
    print(f"\n{len(rows)} cards: {n['OK']} OK, {n['CHECK']} CHECK, {n['REPLACE?']} REPLACE?  (focus written)")


if __name__ == '__main__':
    main()
