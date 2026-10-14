"""Emboss textures for etched cards (series 3 SEC and RSEC), after the "etched" full-art foils of
poke-holo (simeydotme/pokemon-cards-css): a raised geometric relief whose highlights move with the light.

Draws a height map (the wafer's diamond lattice with a four-point star in every diamond), then lights
it from the left and from the right. CSS cross-fades the two as the card tilts.
Writes public/fx/emboss-l.png, public/fx/emboss-r.png (seamless 256px greyscale tiles, 50% grey = flat).
"""
import numpy as np
from PIL import Image, ImageFilter

N = 256
y, x = np.mgrid[0:N, 0:N].astype(float) / N
# Diamond lattice: two families of diagonal ridges, 4 periods per tile.
u = (x + y) * 4
v = (x - y) * 4
ridge = lambda t: np.clip(1 - np.abs((t % 1) - .5) * 12, 0, 1)
h = np.maximum(ridge(u), ridge(v)) * .8
# A small four-point star in the middle of every diamond.
cu = (u % 1) - .5
cv = (v % 1) - .5
r = np.hypot(cu, cv)
ang = np.arctan2(cv, cu)
star = np.clip(1 - r / (.1 + .22 * np.abs(np.cos(2 * ang)) ** 8), 0, 1) * .9
h = np.maximum(h, star)
img = Image.fromarray((h * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
h = np.asarray(img).astype(float) / 255
gy, gx = np.gradient(h)
for name, lx in (('l', -1), ('r', 1)):
    light = (gx * lx + gy * -.6) * 9
    out = np.clip(128 + light * 128, 0, 255).astype(np.uint8)
    Image.fromarray(out, 'L').save(f'public/fx/emboss-{name}.png', optimize=True)
    print(name, out.min(), out.max())
