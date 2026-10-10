import { describe, expect, it } from 'vitest';
import { normalizeCode, redeem } from '../src/lib/promo';
import { createGame } from '../src/state/game.svelte';
import type { Card } from '../src/lib/types';

// sha256('TESTCODE')
const promos = [{ id: 'pr01', codeHash: 'a8d0ca1d3e3e5b4d2c10f3e1ba4c0ec5c2a1b5e8f0d6b6b0f1c0f6a6a3b1c2d4' }];

describe('normalizeCode', () => {
  it('ignores case, spaces and hyphens', () => {
    expect(normalizeCode(' wink-19 89 ')).toBe('WINK1989');
  });
});

describe('redeem', () => {
  it('matches a code by its hash', async () => {
    const { createHash } = await import('node:crypto');
    const list = [{ id: 'pr01', codeHash: createHash('sha256').update('TESTCODE').digest('hex') }];
    expect(await redeem('test-code', list)).toBe('pr01');
  });
  it('returns null for an unknown code', async () => {
    expect(await redeem('nope', promos)).toBeNull();
    expect(await redeem('', promos)).toBeNull();
  });
});

describe('grantPromo', () => {
  const mem = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) } as Storage;
  };
  it('adds the promo once without spending a bag or counting it in the collection', () => {
    const game = createGame({ cards: [] as Card[], storage: mem(), now: () => 5, rng: () => 0 });
    expect(game.grantPromo('pr01')).toBe(true);
    expect(game.save.owned.pr01).toBe(1);
    expect(game.save.firstPulledAt.pr01).toBe(5);
    expect(game.save.stock).toBe(10);
    expect(game.save.eaten).toBe(0);
    expect(game.ownedCount()).toBe(0);
    expect(game.grantPromo('pr01')).toBe(false);
    expect(game.save.owned.pr01).toBe(1);
  });
});
