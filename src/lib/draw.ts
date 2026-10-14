import type { Card, Rarity } from './types';

export const WEIGHTS: Record<Rarity, number> = { C: 55, UC: 25, R: 13, UR: 6, SEC: 1, RSEC: 0.3 };

const ORDER: Rarity[] = ['C', 'UC', 'R', 'UR', 'SEC', 'RSEC'];

export function pickRarity(rng: () => number, forced?: Rarity): Rarity {
  if (forced) return forced;
  const total = ORDER.reduce((sum, r) => sum + WEIGHTS[r], 0);
  const roll = rng() * total;
  let acc = 0;
  for (const r of ORDER) {
    acc += WEIGHTS[r];
    if (roll < acc) return r;
  }
  return 'RSEC';
}

export function drawCard(cards: Card[], rng: () => number, forced?: Rarity): Card {
  const start = forced ?? pickRarity(rng);
  if (start === 'RSEC') {
    const hidden = cards.filter((c) => c.rarity === 'RSEC');
    if (hidden.length > 0) return hidden[Math.floor(rng() * hidden.length)];
    const commons = cards.filter((c) => c.rarity === 'C');
    if (commons.length > 0) return commons[Math.floor(rng() * commons.length)];
    throw new Error('drawCard: no cards to draw');
  }
  for (let i = ORDER.indexOf(start); i >= 0; i--) {
    const pool = cards.filter((c) => c.rarity === ORDER[i]);
    if (pool.length > 0) return pool[Math.floor(rng() * pool.length)];
  }
  throw new Error('drawCard: no cards to draw');
}

/** The rarities a high-rare guaranteed (pity) pack can show. */
const HIGH: Rarity[] = ['UR', 'SEC'];

/**
 * A pity card: the rarity is rolled first (UR vs SEC with WEIGHTS) among the rarities present,
 * then a card is taken uniformly within it, so the odds do not depend on the pool sizes.
 * With no UR/SEC at all, the highest rarity present is drawn instead.
 */
export function drawHighRare(cards: Card[], rng: () => number): Card {
  const present = HIGH.filter((r) => cards.some((c) => c.rarity === r));
  if (present.length > 0) {
    const total = present.reduce((sum, r) => sum + WEIGHTS[r], 0);
    const roll = rng() * total;
    let acc = 0;
    let pick: Rarity = present[present.length - 1];
    for (const r of present) {
      acc += WEIGHTS[r];
      if (roll < acc) {
        pick = r;
        break;
      }
    }
    const pool = cards.filter((c) => c.rarity === pick);
    return pool[Math.floor(rng() * pool.length)];
  }
  for (let i = ORDER.indexOf('SEC'); i >= 0; i--) {
    const pool = cards.filter((c) => c.rarity === ORDER[i]);
    if (pool.length > 0) return pool[Math.floor(rng() * pool.length)];
  }
  throw new Error('drawHighRare: no cards to draw');
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
