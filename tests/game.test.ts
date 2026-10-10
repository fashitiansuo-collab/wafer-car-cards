import { describe, expect, it } from 'vitest';
import { SAVE_KEY } from '../src/lib/save';
import { createGame } from '../src/state/game.svelte.ts';
import type { Card, Rarity, Save } from '../src/lib/types';

function makeCard(id: string, no: number, rarity: Rarity): Card {
  return {
    id, no, rarity, maker: 'maker', model: 'model', year: 2000, country: 'JP',
    image: `/cards/${id}.jpg`,
    credit: { author: 'a', license: 'CC0', licenseUrl: 'https://example.com/l', sourceUrl: 'https://example.com/s', modified: false },
  };
}

function makeCards(): Card[] {
  const out: Card[] = [];
  const rarities: Rarity[] = ['C', 'UC', 'R', 'UR', 'SEC'];
  let no = 1;
  for (const r of rarities) for (let i = 1; i <= 2; i++) out.push(makeCard(`${r.toLowerCase()}${i}`, no++, r));
  return out;
}

function memStorage(seed?: Save): Storage {
  const data: Record<string, string> = {};
  if (seed) data[SAVE_KEY] = JSON.stringify(seed);
  return {
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => { data[k] = String(v); },
    removeItem: (k: string) => { delete data[k]; },
    clear: () => { for (const k of Object.keys(data)) delete data[k]; },
    key: (i: number) => Object.keys(data)[i] ?? null,
    get length() { return Object.keys(data).length; },
  } as unknown as Storage;
}

function blank(t: number, stock = 10): Save {
  return { v: 1, stock, lastRefillAt: t, eaten: 0, owned: {}, firstPulledAt: {}, pending: null };
}

describe('game', () => {
  it('refuses to open at stock 0', () => {
    let t = 1_000_000;
    const storage = memStorage({ ...blank(t), stock: 0, eaten: 5 });
    const game = createGame({ cards: makeCards(), storage, now: () => t, rng: () => 0 });
    expect(game.startOpening()).toBe(false);
    expect(game.screen).toBe('home');
    expect(game.save.eaten).toBe(5);
  });

  it('draws, counts and persists pending when opening from full', () => {
    let t = 1_000_000;
    const storage = memStorage(blank(t));
    const game = createGame({ cards: makeCards(), storage, now: () => t, rng: () => 0 });
    expect(game.startOpening()).toBe(true);
    expect(game.save.stock).toBe(9);
    expect(game.save.lastRefillAt).toBe(t);
    expect(Object.keys(game.save.owned)).toHaveLength(1);
    expect(game.save.pending).not.toBeNull();
    expect(JSON.parse(storage.getItem(SAVE_KEY)!).pending).toBe(game.save.pending);
  });

  it('restores pending on reload without double counting', () => {
    let t = 1_000_000;
    const storage = memStorage(blank(t));
    const game = createGame({ cards: makeCards(), storage, now: () => t, rng: () => 0 });
    game.startOpening();
    const again = createGame({ cards: makeCards(), storage, now: () => t, rng: () => 0 });
    expect(again.screen).toBe('opening');
    expect(again.current?.id).toBe(game.save.pending);
    expect(Object.keys(again.save.owned)).toHaveLength(1);
  });

  it('clears pending on finishOpening', () => {
    let t = 1_000_000;
    const storage = memStorage(blank(t));
    const game = createGame({ cards: makeCards(), storage, now: () => t, rng: () => 0 });
    game.startOpening();
    game.finishOpening();
    expect(game.save.pending).toBeNull();
  });

  it('ignores unknown card ids in ownedCount', () => {
    let t = 1_000_000;
    const storage = memStorage({ ...blank(t), owned: { zzz: 3 } });
    const game = createGame({ cards: makeCards(), storage, now: () => t, rng: () => 0 });
    expect(game.ownedCount()).toBe(0);
  });

  it('refills one after 60s via tick', () => {
    let t = 1_000_000;
    const storage = memStorage(blank(t));
    const game = createGame({ cards: makeCards(), storage, now: () => t, rng: () => 0 });
    game.startOpening();
    t += 60_000;
    game.tick();
    expect(game.save.stock).toBe(10);
  });

  it('drops a pending id that is not in the card list', () => {
    const t = 1_000_000;
    const storage = memStorage({ ...blank(t), pending: 'gone' });
    const game = createGame({ cards: makeCards(), storage, now: () => t, rng: () => 0 });
    expect(game.screen).toBe('home');
    expect(game.current).toBeNull();
    expect(game.save.pending).toBeNull();
  });
});
