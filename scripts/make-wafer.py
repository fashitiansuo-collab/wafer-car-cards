"""Build the wafer textures from two public-domain photos by Paolo Neo on Wikimedia Commons.

  top:     File:Biscuit with chocolate.jpg      (lattice surface, seen from above)
  section: File:Biscuit with jam and chocolate.jpg (side cut: wafer / filling / wafer)

Writes public/wafer/{vanilla,choco,matcha}-{top,side}.webp. The top is a seamless tile (whole lattice
periods, lighting flattened so the card's own CSS light can sit on it); chocolate is the same
photo gradient-mapped to cocoa brown.
Usage: python scripts/make-wafer.py <top.jpg> <section.jpg>
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

top_src, side_src = sys.argv[1], sys.argv[2]
OUT = 'public/wafer'

def flatten(a, r):
    """Divide out slow lighting changes, keep texture."""
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    blur = np.asarray(im.filter(ImageFilter.GaussianBlur(r))).astype(float) + 1
    return a / blur * blur.mean(axis=(0, 1))

def seamless(a, pad):
    """Cross-fade the tile's wrap edges so it repeats without a seam."""
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.minimum.reduce([xx, w - 1 - xx, yy, h - 1 - yy]).astype(float)
    t = np.clip(d / pad, 0, 1)[..., None]
    # The half-rolled copy has its own wrap seam in the middle, where t = 1 hides it.
    return a * t + np.roll(np.roll(a, w // 2, 1), h // 2, 0) * (1 - t)

def gradient_map(a, stops):
    """Map luminance through colour stops [(pos 0..1, (r,g,b)), ...]."""
    lum = (a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114) / 255
    lo, hi = np.percentile(lum, 1), np.percentile(lum, 99.5)
    lum = np.clip((lum - lo) / (hi - lo), 0, 1)
    pos = np.array([s[0] for s in stops])
    out = np.zeros(a.shape[:2] + (3,))
    for c in range(3):
        out[..., c] = np.interp(lum, pos, [s[1][c] for s in stops])
    return out

def save(a, name, size=None):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    if size: im = im.resize(size, Image.LANCZOS)
    im.save(f'{OUT}/{name}.webp', quality=86, method=6)
    print(name, im.size)

# --- top: whole lattice periods (measured 117.5 px across, 117 px down) ---
src = np.asarray(Image.open(top_src).convert('RGB')).astype(float)
P = 117.5
x0, y0 = 376, 300
tile = src[y0:y0 + round(117 * 6), x0:x0 + round(P * 10)]
tile = flatten(tile, 90)
# The periods are not exact; wrap the edges so the tile repeats cleanly.
tile = seamless(tile, 40)
# 10 x 6 diamonds; keep it modest, CSS scales it.
size = (600, 358)
# The photo's light is cool; map it to a baked, golden wafer.
VANILLA = [(0, (150, 104, 56)), (.45, (212, 168, 106)), (.8, (234, 204, 152)), (1, (247, 229, 194))]
COCOA = [(0, (50, 27, 16)), (.45, (90, 55, 35)), (.8, (122, 81, 55)), (1, (150, 106, 76))]
save(gradient_map(tile, VANILLA), 'vanilla-top', size)
save(gradient_map(tile, COCOA), 'choco-top', size)
# Series 3: a matcha-dusted wafer.
MATCHA = [(0, (52, 62, 22)), (.45, (112, 134, 52)), (.8, (168, 186, 104)), (1, (214, 224, 168))]
save(gradient_map(tile, MATCHA), 'matcha-top', size)

# --- side: the cut face, a strip across the whole wafer height ---
s = np.asarray(Image.open(side_src).convert('RGB')).astype(float)
strip = s[415:885, 240:2040]
r, g, b = strip[..., 0], strip[..., 1], strip[..., 2]
# The filling is the red-brown jam; it becomes cream (vanilla) or stays dark against cocoa wafer.
jam = (g / (r + 1) < .72).astype(np.uint8) * 255
jam = np.asarray(Image.fromarray(jam).filter(ImageFilter.GaussianBlur(3))).astype(float)[..., None] / 255
m = jam[..., 0] > .5
shade = ((g - g[m].mean()) / 255 * .5)[..., None]
cream = np.array([248, 238, 214]) * (1 + shade)
save(gradient_map(strip, VANILLA) * (1 - jam) + cream * jam, 'vanilla-side', (900, 235))
# Series 2 is a single layer: wafer, one cream, wafer (the photo's top half).
half = slice(0, 265)
save((gradient_map(strip, COCOA) * (1 - jam) + cream * jam)[half], 'choco-side', (900, 132))
# Matcha: one layer of green cream between pale wafer.
cream_m = np.array([150, 178, 82]) * (1 + shade)
save((gradient_map(strip, VANILLA) * (1 - jam) + cream_m * jam)[half], 'matcha-side', (900, 132))
