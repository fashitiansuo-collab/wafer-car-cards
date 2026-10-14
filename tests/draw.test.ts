import { describe, expect, it } from 'vitest';
import { drawCard, drawHighRare, mulberry32, pickRarity, WEIGHTS } from '../src/lib/draw';
import type { Card, Rarity } from '../src/lib/types';

function makeCard(id: string, no: number, rarity: Rarity): Card {
  return {
    id, no, rarity, maker: 'maker', model: 'model', year: 2000, country: 'JP',
    image: `/cards/${id}.jpg`,
    credit: { author: 'a', license: 'CC0', licenseUrl: 'https://example.com/l', sourceUrl: 'https://example.com/s', modified: false },
  };
}

const cards: Card[] = [
  makeCard('c001', 1, 'C'), makeCard('c002', 2, 'C'),
  makeCard('c003', 3, 'UC'), makeCard('c004', 4, 'UC'),
  makeCard('c005', 5, 'R'), makeCard('c006', 6, 'R'),
  makeCard('c007', 7, 'UR'), makeCard('c008', 8, 'UR'),
  makeCard('c009', 9, 'SEC'), makeCard('c010', 10, 'SEC'),
];

describe('pickRarity', () => {
  it('maps roll boundaries to rarities', () => {
    expect(pickRarity(() => 0)).toBe('C');
    expect(pickRarity(() => 0.992)).toBe('SEC');
    expect(pickRarity(() => 0.999)).toBe('RSEC');
    expect(pickRarity(() => 0.55)).toBe('UC');
  });

  it('matches weights within 1pt over 100000 draws', () => {
    const rng = mulberry32(1);
    const counts: Record<Rarity, number> = { C: 0, UC: 0, R: 0, UR: 0, SEC: 0, RSEC: 0 };
    const n = 100_000;
    for (let i = 0; i < n; i++) counts[pickRarity(rng)] += 1;
    for (const [r, w] of Object.entries(WEIGHTS) as [Rarity, number][]) {
      expect(Math.abs((counts[r] / n) * 100 - w)).toBeLessThanOrEqual(1);
    }
  });
});

describe('drawCard', () => {
  it('returns a SEC card when forced', () => {
    expect(drawCard(cards, () => 0.5, 'SEC').rarity).toBe('SEC');
  });

  it('falls back to UR when no SEC exists', () => {
    const noSec = cards.filter((c) => c.rarity !== 'SEC');
    expect(drawCard(noSec, () => 0.5, 'SEC').rarity).toBe('UR');
  });
});

describe('RSEC', () => {
  const pool = [...cards, makeCard('rsec1', 11, 'RSEC')];

  it('draws the hidden card when RSEC is rolled', () => {
    expect(drawCard(pool, () => 0.999).rarity).toBe('RSEC');
  });

  it('falls back to C when RSEC is rolled but absent', () => {
    expect(drawCard(cards, () => 0.999).rarity).toBe('C');
  });

  it('never yields RSEC from a pity draw', () => {
    for (const roll of [0, 0.2, 0.5, 0.8, 0.999]) {
      expect(drawHighRare(pool, () => roll).rarity).not.toBe('RSEC');
    }
    const noHigh = [makeCard('c1', 1, 'C'), makeCard('rsec1', 11, 'RSEC')];
    expect(drawHighRare(noHigh, () => 0.999).rarity).toBe('C');
  });
});
