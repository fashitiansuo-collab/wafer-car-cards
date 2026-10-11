# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- The author, who builds and plays this as a CSS-expression study, mostly on an iPhone (portrait) and sometimes on a PC.
- Acquaintances the author gives the public URL or a promo code to. They open it on their own phones, play a few bags, and look at the cards.

## Product Purpose

A wafer-snack card collection toy: tear the bag, bite the wafer, flip a holo card of a real car photographed on Wikimedia Commons, and fill the garage. It exists to show off card-making craft in CSS: holo layers, per-photo frames, and from series 2 onwards, one-off bespoke SEC / promo cards. Success means each card feels made with care and is a pleasure to tilt and hand to someone.

## Positioning

Every card is a real Commons photograph with its real camera data, framed and treated per photo, and the special cards are individually designed pieces, not templates on top of the set.

## Operating Context

- Vertical phone UI in a Gran Turismo SPORT–like frame (header, bottom strip, guide bar). It is static web on GitHub Pages: https://fashitiansuo-collab.github.io/wafer-car-cards/
- A bag refills every minute, up to 10. The collection is saved per browser (localStorage).
- Promo cards are claimed by code (`?promo=` or the records screen). The app holds only hashes of the codes.
- SEC series 2 and promos follow `docs/sec/README.md` (signature, reveal entrance, orientation, process).

## Capabilities and Constraints

- Svelte 5 + Vite + TypeScript, Vitest. Effects and motion are CSS. `prefers-reduced-motion` must be honoured.
- Photos: Wikimedia Commons, CC0 / public domain / CC BY / CC BY-SA only. Credit is required everywhere the card is shown (card back, records, CREDITS.md), marked "modified" when cropped or graded. Cut-outs (rembg) are allowed.
- No logos or assets of real brands: Gran Turismo / Polyphony / Sony, car makers' emblems, snack brands. Car names as text are fine.
- No runtime calls to outside services. Fonts and images are bundled.
- The 45-card series 1 lineup is kept secret from the author. Do not name cars in commits or messages.

## Brand Commitments

These are binding rules the author set for card design:

- **Design skills are mandatory** for any card design work.
- **Award references are mandatory, never skipped.** Every bespoke card starts from real works on award galleries (Awwwards, CSS Design Awards, FWA, Behance, CodePen picks…) that were actually opened and studied. If the built-in browser is blocked, use Playwright or Chrome. Designing from memory is forbidden. The visited URLs and the techniques taken go in `docs/sec/`.
- **References lead strongly.** Take strong influence from the reference sites (layout grammar, type treatment, motion, colour logic). Keep original deviations restrained. Never lift their assets, logos, copy, or characters.
- **Type:** prefer fonts that resemble the reference's type, or free fonts popular with designers (Google Fonts / GitHub, SIL OFL or similar). Bundled app fonts (Barlow etc.) are the last choice, used only when they are genuinely the best fit. No paid fonts.
- **Japanese text on a card only when the reference site is Japanese.**

## Evidence on Hand

- Series 1: 45 cards in `src/data/cards.json`, photos in `public/cards/`, credits in `CREDITS.md`. Real EXIF exists for 38 of them.
- Promo PR-01: two designs, A (`src/cards/special/PromoPR01.svelte`) and B (`PromoPR01B.svelte`), with cut-outs in `public/promo/`.
- Research notes: `docs/sec/pr01.md`. There are no testimonials, user counts, or press. Do not invent any.

## Product Principles

1. The photograph is the subject. Every treatment serves the car in the picture.
2. Each special card is its own piece, with only the signature (number, gold mark, back) shared.
3. Honour the sources: licences, credits, and references are visible and respected.
4. Delight in the hand: tilt, light, and the reveal are the payoff, so they get the craft.

## Accessibility & Inclusion

Target WCAG 2.1 AA: text contrast on cards and UI, keyboard path through every flow, visible focus, reduced motion respected, and no information carried by colour alone.
