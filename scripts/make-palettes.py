"""Add a 5-colour palette to each card from its image.

Run after fetch-commons.mjs:  python scripts/make-palettes.py
"""
import argparse
import json
from pathlib import Path

from PIL import Image

ap = argparse.ArgumentParser(description=__doc__)
ap.add_argument('--series', type=int, default=1, help='series to read (2 uses src/data/cards-s2.json)')
a = ap.parse_args()

root = Path(__file__).resolve().parent.parent
suffix = '' if a.series == 1 else f'-s{a.series}'
cards_path = root / f'src/data/cards{suffix}.json'
cards = json.loads(cards_path.read_text(encoding='utf-8'))

for card in cards:
    src = root / 'public' / card['image'].removeprefix('./')
    small = Image.open(src).convert('RGB').resize((64, 64))
    q = small.quantize(colors=5, method=Image.Quantize.MEDIANCUT)
    raw = q.getpalette()
    counts = q.getcolors(64 * 64) or []
    counts.sort(key=lambda t: t[0], reverse=True)
    palette = ['#%02x%02x%02x' % tuple(raw[i * 3:i * 3 + 3]) for _, i in counts]
    while len(palette) < 5:
        palette.append(palette[-1] if palette else '#000000')
    card['palette'] = palette[:5]

cards_path.write_text(json.dumps(cards, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'palettes: {len(cards)} cards')
