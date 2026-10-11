"""Collect candidate photos for the series-2 cars from Wikimedia Commons.

For each car in .superpowers/pf/s2/cars.json it resolves the query to Commons
categories (and a plain file search), keeps files that are freely licensed, big
enough and shaped like a card window, downloads 640px thumbnails and builds a
contact sheet to pick from.

    python scripts/candidates.py                     # every car (resumable)
    python scripts/candidates.py --only civic,s2000  # just a few cars
    python scripts/candidates.py --force             # redo sheets that exist

Results are written to .superpowers/pf/s2/candidates.json as { key: [ ... ] }.
"""

import argparse
import json
import re
import ssl
import time
from html import unescape
from io import BytesIO
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from PIL import Image, ImageDraw, ImageFont

UA = 'WaferCarCards/0.1 (https://github.com/fashitiansuo-collab/wafer-car-cards)'
API = 'https://commons.wikimedia.org/w/api.php'
IIPROP = 'url|size|extmetadata'
THUMB_WIDTH = 640

ROOT = Path(__file__).resolve().parent.parent
S2 = ROOT / '.superpowers/pf/s2'
THUMBS = S2 / 'thumbs'
SHEETS = S2 / 'sheets'
CARS = S2 / 'cars.json'
OUT = S2 / 'candidates.json'

EXT = ('.jpg', '.jpeg', '.png', '.webp')
BAD = ('interior', 'engine', 'dashboard', 'wheel', 'badge', 'logo', 'emblem',
       'detail', 'seat', 'model', 'toy', 'diecast', 'lego', 'scale')
MIN_WIDTH = 1600
MAX_CANDIDATES = 16

COLS, CELL_W, CELL_H = 4, 400, 300
SHEET_BG = (38, 38, 38)

_tls = {'ctx': ssl.create_default_context()}
_last_call = [0.0]


# --- talking to the API, politely -------------------------------------------


def get(url):
    """GET a URL with our User-Agent; retry 429 with 5s, 10s, 20s ... backoff."""
    delay = 5
    while True:
        req = Request(url, headers={'User-Agent': UA})
        try:
            with urlopen(req, timeout=90, context=_tls['ctx']) as res:
                return res.read()
        except HTTPError as e:
            if e.code == 429:
                print(f'  429 from the API, waiting {delay}s')
                time.sleep(delay)
                delay = min(delay * 2, 300)
                continue
            raise
        except URLError as e:
            if 'certificate' in str(e).lower() and _tls['ctx'] is not None:
                print('  TLS certificate check failed, continuing without verification')
                _tls['ctx'] = ssl._create_unverified_context()
                continue
            raise


def api(params):
    """One Commons API call, keeping ~1s between calls."""
    gap = time.monotonic() - _last_call[0]
    if gap < 1.0:
        time.sleep(1.0 - gap)
    data = json.loads(get(API + '?' + urlencode(params)))
    _last_call[0] = time.monotonic()
    return data


def pages_with_imageinfo(data):
    """Pull (title, imageinfo) pairs out of a query response."""
    out = []
    for page in data.get('query', {}).get('pages', {}).values():
        ii = (page.get('imageinfo') or [{}])[0]
        out.append((page.get('title', ''), ii))
    return out


# --- resolving the query to files -------------------------------------------


def words(text):
    return {w for w in re.findall(r'[a-z0-9]+', text.lower()) if len(w) >= 3}


def search_categories(q):
    data = api({'action': 'query', 'format': 'json', 'list': 'search',
                'srsearch': q, 'srnamespace': 14, 'srlimit': 10})
    return [r['title'] for r in data.get('query', {}).get('search', [])]


def rank_categories(q, cats):
    """Score category titles against the query; exact/closest comes first."""
    qt = words(q)
    scored = []
    for cat in cats:
        name = cat.split(':', 1)[-1]
        sc = len(qt & words(name)) / len(qt) if qt else 0.0
        nl, ql = name.lower(), q.lower()
        if nl == ql:
            sc += 1.0
        elif ql in nl or nl in ql:
            sc += 0.5
        scored.append((sc, cat))
    scored.sort(key=lambda t: (-t[0], t[1]))
    return scored


def choose_categories(q):
    ranked = rank_categories(q, search_categories(q))
    if not any(sc > 0 for sc, _ in ranked):
        # a trailing year ("... SS 1980s") can make the category search too narrow
        shorter = re.sub(r'\b(19|20)\d{2}s?\b', ' ', q).strip()
        if shorter and shorter != q:
            ranked = rank_categories(q, search_categories(shorter))
    chosen = [c for sc, c in ranked if sc > 0][:3]
    if not chosen and ranked:
        chosen = [ranked[0][1]]
    return chosen


def category_files(cat):
    data = api({'action': 'query', 'format': 'json', 'generator': 'categorymembers',
                'gcmtitle': cat, 'gcmtype': 'file', 'gcmlimit': 500,
                'prop': 'imageinfo', 'iiprop': IIPROP, 'iiurlwidth': THUMB_WIDTH})
    return pages_with_imageinfo(data)


def subcategories(cat):
    data = api({'action': 'query', 'format': 'json', 'list': 'categorymembers',
                'cmtitle': cat, 'cmtype': 'subcat', 'cmlimit': 500})
    return [m['title'] for m in data.get('query', {}).get('categorymembers', [])]


def search_files(q):
    data = api({'action': 'query', 'format': 'json', 'generator': 'search',
                'gsrsearch': q, 'gsrnamespace': 6, 'gsrlimit': 50,
                'prop': 'imageinfo', 'iiprop': IIPROP, 'iiurlwidth': THUMB_WIDTH})
    return pages_with_imageinfo(data)


# --- filtering ---------------------------------------------------------------


def license_ok(lic):
    l = lic.strip()
    if re.search(r'fair use|non[- ]?commercial|no[- ]?deriv|\bnc\b|\bnd\b', l, re.I):
        return False
    if re.match(r'^(cc0|cc[- ]?zero)\b', l, re.I):
        return True
    if re.match(r'^(public domain|pd)\b', l, re.I):
        return True
    if re.match(r'^cc by(-sa)?\s*[0-9]', l, re.I):
        return True
    return False


def aspect_ok(w, h):
    ar = w / h
    return 1.2 <= ar <= 1.9 or 0.6 <= ar <= 0.85


def clean_author(html):
    s = re.sub(r'<[^>]*>', '', str(html or ''))
    s = unescape(s).replace('\xa0', ' ')
    return re.sub(r'\s+', ' ', s).strip() or 'Unknown'


def collect(q):
    """Resolve q to files and return the ranked candidate entries (n assigned)."""
    qt = words(q)
    files = {}
    for cat in choose_categories(q):
        main = category_files(cat)
        if len(main) < 15:
            subs = [s for s in subcategories(cat) if any(w in s.lower() for w in qt)]
            for sub in subs[:8]:
                main += category_files(sub)
        for title, ii in main:
            files.setdefault(title, ii)
    for title, ii in search_files(q):
        files.setdefault(title, ii)

    kept = []
    for title, ii in files.items():
        if not title.lower().endswith(EXT) or not ii:
            continue
        meta = ii.get('extmetadata') or {}
        lic = str(meta.get('LicenseShortName', {}).get('value', '')).strip()
        w, h = ii.get('width'), ii.get('height')
        thumb = ii.get('thumburl') or ii.get('url')
        if not license_ok(lic) or not w or not h or w < MIN_WIDTH or not aspect_ok(w, h) or not thumb:
            continue
        kept.append({'title': title, 'license': lic, 'width': w, 'height': h, 'url': thumb,
                     'author': clean_author(meta.get('Artist', {}).get('value')),
                     'descriptionurl': ii.get('descriptionurl', ''),
                     '_score': sum(1 for w_ in qt if w_ in title.lower()),
                     '_bad': any(b in title.lower() for b in BAD)})

    good = sorted((f for f in kept if not f['_bad']), key=lambda f: (-f['_score'], f['title']))
    bad = sorted((f for f in kept if f['_bad']), key=lambda f: (-f['_score'], f['title']))
    selected = (good + bad)[:MAX_CANDIDATES]
    return [{'n': i, 'title': f['title'], 'license': f['license'], 'author': f['author'],
             'width': f['width'], 'height': f['height'], 'url': f['url'],
             'descriptionurl': f['descriptionurl']}
            for i, f in enumerate(selected, 1)]


# --- writing thumbnails and the contact sheet --------------------------------


def download(key, entries, force):
    folder = THUMBS / key
    folder.mkdir(parents=True, exist_ok=True)
    for f in entries:
        dest = folder / f"{f['n']}.jpg"
        if dest.exists() and not force:
            continue
        img = Image.open(BytesIO(get(f['url']))).convert('RGB')
        if img.width > THUMB_WIDTH:
            img = img.resize((THUMB_WIDTH, round(img.height * THUMB_WIDTH / img.width)))
        img.save(dest, 'JPEG', quality=88)
        time.sleep(0.3)


def font(size, bold=False):
    names = ('arialbd.ttf', 'arial.ttf') if bold else ('arial.ttf', 'arialbd.ttf')
    dirs = (Path('C:/Windows/Fonts'), Path('/usr/share/fonts/truetype/dejavu'))
    for d in dirs:
        for name in names:
            p = d / name
            if p.exists():
                try:
                    return ImageFont.truetype(str(p), size)
                except OSError:
                    pass
    return ImageFont.load_default()


def build_sheet(key, entries):
    rows = max(1, (len(entries) + COLS - 1) // COLS)
    sheet = Image.new('RGB', (COLS * CELL_W, rows * CELL_H), SHEET_BG)
    d = ImageDraw.Draw(sheet)
    big, small = font(52, bold=True), font(16)
    for f in entries:
        i = f['n'] - 1
        x, y = (i % COLS) * CELL_W, (i // COLS) * CELL_H
        thumb = Image.open(THUMBS / key / f"{f['n']}.jpg").convert('RGB')
        thumb.thumbnail((CELL_W, CELL_H))
        sheet.paste(thumb, (x + (CELL_W - thumb.width) // 2, y + (CELL_H - thumb.height) // 2))
        label = str(f['n'])
        w = d.textlength(label, font=big)
        d.rectangle([x + 6, y + 6, x + 18 + w, y + 68], fill=(0, 0, 0))
        d.text((x + 11, y + 8), label, font=big, fill=(255, 255, 255))
        cap = f"{f['license']} - {f['width']}px"
        w = d.textlength(cap, font=small)
        d.rectangle([x + 6, y + CELL_H - 26, x + 18 + w, y + CELL_H - 6], fill=(0, 0, 0))
        d.text((x + 11, y + CELL_H - 24), cap, font=small, fill=(230, 230, 230))
    SHEETS.mkdir(parents=True, exist_ok=True)
    sheet.save(SHEETS / f'{key}.jpg', 'JPEG', quality=88)


# --- entry point -------------------------------------------------------------


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--only', help='comma-separated car keys to process')
    ap.add_argument('--force', action='store_true', help='redo cars whose sheet already exists')
    a = ap.parse_args()

    cars = json.loads(CARS.read_text(encoding='utf-8'))
    if a.only:
        want = {k.strip() for k in a.only.split(',') if k.strip()}
        cars = [c for c in cars if c['key'] in want]

    results = json.loads(OUT.read_text(encoding='utf-8')) if OUT.exists() else {}
    for car in cars:
        key, q = car['key'], car['q']
        if (SHEETS / f'{key}.jpg').exists() and not a.force and key in results:
            print(f'{key}: sheet exists, skipping')
            continue
        print(f'{key}: {q}')
        entries = collect(q)
        download(key, entries, a.force)
        build_sheet(key, entries)
        results[key] = entries
        OUT.parent.mkdir(parents=True, exist_ok=True)
        OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(f'  {len(entries)} candidates')

    thin = [k for k, v in results.items() if len(v) < 4]
    print('\nfewer than 4 candidates: ' + (', '.join(thin) if thin else 'none'))


if __name__ == '__main__':
    main()
