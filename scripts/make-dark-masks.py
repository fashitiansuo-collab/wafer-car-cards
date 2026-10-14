"""Write an inverted-luminance mask (<id>-dark.jpg) for every SEC card.

CSS cannot invert a luminance mask reliably, so the cosmos layer uses these files.
Run after fetch-commons.mjs:  python scripts/make-dark-masks.py
"""
import json
from pathlib import Path

from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent
# Series 1 and 3 SEC use the framed SEC treatment (series 2 SEC cards are bespoke).
cards = [c for f in ('cards.json', 'cards-s3.json') for c in json.loads((root / 'src/data' / f).read_text(encoding='utf-8'))]
for card in cards:
    if card['rarity'] != 'SEC':
        continue
    src = root / 'public' / card['image'].lstrip('./')
    out = src.with_name(src.stem + '-dark.jpg')
    im = ImageOps.autocontrast(ImageOps.invert(Image.open(src).convert('L')), cutoff=2)
    im.save(out, quality=80)
    print(out.relative_to(root))
