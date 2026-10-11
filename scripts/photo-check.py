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

    return {'file': str(path), 'verdict': verdict, 'why': why, 'car_share': round(share, 3),
            'headlights': len(head), 'taillights': len(tail), 'cars': len(cars)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('files', nargs='*')
    ap.add_argument('--cards', action='store_true', help='check every card image in src/data/cards.json')
    ap.add_argument('--json', help='also write the full results to this file')
    ap.add_argument('--boxes', help='write copies with the detected car / lights drawn into this folder')
    a = ap.parse_args()

    root = Path(__file__).resolve().parent.parent
    files = []
    if a.cards:
        cards = json.loads((root / 'src/data/cards.json').read_text(encoding='utf-8'))
        files += [root / 'public' / c['image'].removeprefix('./') for c in cards]
    for f in a.files:
        files += [Path(p) for p in glob.glob(f)] or [Path(f)]
    if not files:
        ap.error('no images given')

    proc, model, torch = load()
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


if __name__ == '__main__':
    main()
