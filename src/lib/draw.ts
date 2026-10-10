import type { Card, Rarity } from './types';

export const WEIGHTS: Record<Rarity, number> = { C: 55, UC: 25, R: 13, UR: 6, SEC: 1 };

const ORDER: Rarity[] = ['C', 'UC', 'R', 'UR', 'SEC'];

export function pickRarity(rng: () => number, forced?: Rarity): Rarity {
  if (forced) return forced;
  const total = ORDER.reduce((sum, r) => sum + WEIGHTS[r], 0);
  const roll = rng() * total;
  let acc = 0;
  for (const r of ORDER) {
    acc += WEIGHTS[r];
    if (roll < acc) return r;
  }
  return 'SEC';
}

export function drawCard(cards: Card[], rng: () => number, forced?: Rarity): Card {
  const start = forced ?? pickRarity(rng);
  for (let i = ORDER.indexOf(start); i >= 0; i--) {
    const pool = cards.filter((c) => c.rarity === ORDER[i]);
    if (pool.length > 0) return pool[Math.floor(rng() * pool.length)];
  }
  throw new Error('drawCard: no cards to draw');
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
