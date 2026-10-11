---
name: car-photo-pick
description: Use whenever choosing or replacing a car photograph for a card in this project (series lineups, SEC, promo cards) — searching Wikimedia Commons, picking from contact sheets, or judging whether a photo "shows the car". Enforces checking that the car's face (front / front three-quarter, headlights) is the subject, that the car fills the frame, and that the photo stands on its own without cutting out, before a photo is accepted.
---

# Picking a car photo for a card

Thumbnails lie. At 300px a rear three-quarter, a car hidden behind a bus, a car that is a speck on a
mountain road and a proper front three-quarter all read as "a red car". Past lineups shipped rear
views and far-away cars this way. Do not pick from a contact sheet alone.

## The bar a photo must clear

1. **The car's face is visible**: front or front three-quarter, with the headlights. Rear views are out
   unless the card is explicitly about the rear (and then say so to the author).
2. **One car is the subject**: it fills roughly a quarter of the frame or more and nothing (bus, crowd,
   other cars) competes with it.
3. **It stands on its own uncut** (SEC / promo, from 2026-10-11): no cut-out. The photo's own setting,
   light and era must fit the card's design idea (PR-02: a 2005 motor-show photo → film grade, minimal type).
4. **Licence**: CC0 / public domain / CC BY / CC BY-SA only. Record author, licence, source.
5. **No readable plates or identifiable faces** where avoidable.

## Process

1. Search Commons (`scripts/fetch-commons.mjs` for the lineup, or the contact-sheet helper used for
   candidates) and download candidates at ≥900px into a scratch folder.
2. **Run the checker on every candidate before looking at them as a set:**

   ```bash
   PYTHONPATH=.superpowers/pf/clip HF_HOME=.superpowers/pf/hf python scripts/photo-check.py --boxes .superpowers/pf/boxes <files...>
   ```

   It finds the subject car and the headlights / taillights on it (OWLv2, local) and prints
   `OK` / `CHECK` / `REJECT` with the reason. The dependencies live in the git-ignored
   `.superpowers/pf/clip`; if that folder is missing, reinstall with
   `python -m pip install --target .superpowers/pf/clip torch transformers --index-url https://download.pytorch.org/whl/cpu --extra-index-url https://pypi.org/simple`.
3. **REJECT**: drop it. **CHECK**: open the `--boxes` copy at full size and decide: the yellow box is the
   car it judged, cyan are headlights, red are taillights. **OK**: still open it once at full size.
4. Only then compare the survivors for mood, light and fit with the card design.
5. When you report the choice, say what the checker said and what you saw at full size.

## Known limits of the checker

- Side profiles with lamps at both ends come out as CHECK (correct; they have no "face").
- A rear three-quarter where one headlight edge is visible can come out CHECK rather than REJECT.
  Treat any CHECK that mentions taillights as a probable rear view.
- Night shots, motion blur and heavy dust lower detection; check those by eye.
- It does not judge composition, sharpness or mood. That part is still yours.
