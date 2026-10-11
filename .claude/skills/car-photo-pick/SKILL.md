---
name: car-photo-pick
description: Use whenever choosing, replacing or re-cropping a car photograph for a card in this project (series lineups, SEC, promo cards) — searching Wikimedia Commons, picking from contact sheets, setting a card's focus, or judging whether a card "shows the car". The test is the card's crop, not the photo: the end of the car the photo shows (front or rear) must not be cut off by the card's photo window.
---

# Picking and cropping a car photo for a card

## What actually goes wrong

The problem is almost never the photo; it is the **crop**. Card photo windows are roughly square
(frames: gallery 91×92, watermark 100×104, litt 84×84, palette 86×78, window 84.8×76). A wide photo
of a car filling the frame, cropped to a square around its middle, loses the car's face — the
headlights and grille fall outside the card. Judge what the card shows, never the full photo.

What the author likes and dislikes (2026-10-11):
- Rear-only shots are **welcome** (e.g. a car shot from behind in a car park). Do not "fix" them.
- A small car in a big scene is fine when it is clearly the subject (e.g. a rally car in a forest).
- Bad: the card crop cuts off the end of the car the photo is showing (front of a front shot,
  rear of a rear shot), or shows only the car's middle.
- Do not replace photos on your own judgement; ask first, and only after looking at the card render.

## The bar a card must clear

1. **The shown end is whole in the card crop**: the end whose lamps face the camera (headlights → front,
   taillights → rear), out to that end's bumper, sits inside the photo window.
2. As much of the rest of the car as the window allows.
3. For SEC / promo cards (from 2026-10-11): no cut-out; the photo stands on its own and the design idea
   fits the car and that photo.
4. Licence: CC0 / public domain / CC BY / CC BY-SA only; record author, licence, source.

## Process

1. **Fit the crop with the tool**, then look:

   ```bash
   PYTHONPATH=.superpowers/pf/clip HF_HOME=.superpowers/pf/hf python scripts/photo-check.py --cards --fit --boxes .superpowers/pf/crops
   ```

   It finds the subject car and its lamps (OWLv2, local), decides which end the photo shows, and
   writes `focus` (CSS object-position) into `src/data/cards.json` and `scripts/lineup.json` so that
   end stays in the frame's window. The `--boxes` images show the crop (bright) over the photo.
   Cards with `focusManual: true` are left alone. Missing deps: reinstall into the git-ignored
   folder with `python -m pip install --target .superpowers/pf/clip torch transformers --index-url https://download.pytorch.org/whl/cpu --extra-index-url https://pypi.org/simple`.
2. **Render the cards and look at every flagged one** (CHECK / REPLACE?), plus a sample of OK ones:
   `http://localhost:5173/?debug&ids=c001,c002&px=0.5&py=0.5`. The tool can mistake a taillight for a
   headlight and cannot tell which end matters on a lampless side profile.
3. Where the tool is wrong, set `focus` by hand in both JSON files and add `"focusManual": true`.
4. For a new photo, run the tool on the candidate first (`python scripts/photo-check.py <file>`) to
   catch a car that is not the subject, then fit and render as above.

## Known limits

- Side profiles: front end found from headlights, or as the end away from the taillights; with no
  lamps found it centres the car — set those by hand.
- It sometimes labels a rear lamp as a headlight (seen on a side-on rally car).
- It does not judge composition, light or mood. That part is still yours, and the author's.
