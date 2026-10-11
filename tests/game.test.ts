import { describe, expect, it } from 'vitest';
import { parseSave, SAVE_KEY } from '../src/lib/save';
import { createGame } from '../src/state/game.svelte.ts';
import type { Card, Rarity, Save, SeriesId } from '../src/lib/types';

function makeCard(id: string, no: number, rarity: Rarity, series?: SeriesId): Card {
  const card: Card = {
    id, no, rarity, maker: 'maker', model: 'model', year: 2000, country: 'JP',
    image: `/cards/${id}.jpg`,
    credit: { author: 'a', license: 'CC0', licenseUrl: 'https://example.com/l', sourceUrl: 'https://example.com/s', modified: false },
  };
  if (series !== undefined) card.series = series;
  return card;
}

function makeCards(series?: SeriesId): Card[] {
  const out: Card[] = [];
  const rarities: Rarity[] = ['C', 'UC', 'R', 'UR', 'SEC'];
  const prefix = series === 2 ? 's2-' : '';
  let no = 1;
  for (const r of rarities) for (let i = 1; i <= 2; i++) out.push(makeCard(`${prefix}${r.toLowerCase()}${i}`, no++, r, series));
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

  it('does not overwrite another tab with an unchanged tick', () => {
    let t = 1_000_000;
    const storage = memStorage(blank(t));
    const a = createGame({ cards: makeCards(), storage, now: () => t, rng: () => 0 });
    const b = createGame({ cards: makeCards(), storage, now: () => t, rng: () => 0 });
    b.startOpening();
    t += 1000;
    a.tick();
    const again = createGame({ cards: makeCards(), storage, now: () => t, rng: () => 0 });
    expect(Object.keys(again.save.owned)).toHaveLength(1);
  });

  it('picks up progress made in another tab on reload()', () => {
    const t = 1_000_000;
    const storage = memStorage(blank(t));
    const a = createGame({ cards: makeCards(), storage, now: () => t, rng: () => 0 });
    const b = createGame({ cards: makeCards(), storage, now: () => t, rng: () => 0 });
    b.startOpening();
    b.finishOpening();
    a.reload();
    expect(a.save.eaten).toBe(1);
    expect(a.ownedCount()).toBe(1);
  });

  it('draws only from the selected series', () => {
    const t = 1_000_000;
    const storage = memStorage(blank(t));
    const cards = [...makeCards(1), ...makeCards(2)];
    const game = createGame({ cards, storage, now: () => t, rng: () => 0 });
    game.series = 2;
    expect(game.startOpening()).toBe(true);
    expect(game.current?.series).toBe(2);
    expect(game.ownedCount(2)).toBe(1);
    expect(game.ownedCount(1)).toBe(0);
  });

  it('refuses an empty series without spending a bag', () => {
    const t = 1_000_000;
    const storage = memStorage(blank(t));
    const game = createGame({ cards: makeCards(), storage, now: () => t, rng: () => 0 });
    game.series = 2;
    expect(game.startOpening()).toBe(false);
    expect(game.screen).toBe('home');
    expect(game.save.stock).toBe(10);
    expect(game.save.eaten).toBe(0);
  });

  it('counts owned cards and rarities per series', () => {
    const t = 1_000_000;
    const storage = memStorage({ ...blank(t), owned: { c1: 1, 's2-c1': 1, 's2-uc1': 1 } });
    const cards = [...makeCards(1), ...makeCards(2)];
    const game = createGame({ cards, storage, now: () => t, rng: () => 0 });
    expect(game.ownedCount()).toBe(3);
    expect(game.ownedCount(1)).toBe(1);
    expect(game.ownedCount(2)).toBe(2);
    expect(game.countByRarity(1).C).toBe(1);
    expect(game.countByRarity(2).C).toBe(1);
    expect(game.countByRarity(2).UC).toBe(1);
    expect(game.countByRarity().C).toBe(2);
  });

  it('reports the size of each series', () => {
    const cards = [...makeCards(1), ...makeCards(2)];
    const game = createGame({ cards, storage: memStorage(1_000_000), now: () => 1_000_000, rng: () => 0 });
    expect(game.seriesCount(1)).toBe(10);
    expect(game.seriesCount(2)).toBe(10);
  });

  it('remembers the selected series across a reload', () => {
    const t = 1_000_000;
    const storage = memStorage(blank(t));
    const cards = [...makeCards(1), ...makeCards(2)];
    const game = createGame({ cards, storage, now: () => t, rng: () => 0 });
    game.series = 2;
    expect(JSON.parse(storage.getItem(SAVE_KEY)!).series).toBe(2);
    const again = createGame({ cards, storage, now: () => t, rng: () => 0 });
    expect(again.series).toBe(2);
  });
});

describe('calories', () => {
  it('banks calories per series, separately', () => {
    const t = 1_000_000;
    const storage = memStorage(blank(t));
    const cards = [...makeCards(1), ...makeCards(2)];
    const game = createGame({ cards, storage, now: () => t, rng: () => 0 });
    game.series = 1;
    game.startOpening();
    expect(game.kcal(1)).toBe(52);
    expect(game.kcal(2)).toBe(0);
    game.finishOpening();
    game.series = 2;
    game.startOpening();
    expect(game.kcal(1)).toBe(52);
    expect(game.kcal(2)).toBe(64);
  });

  it('keeps calories across a reload', () => {
    const t = 1_000_000;
    const storage = memStorage(blank(t));
    const cards = makeCards(1);
    const game = createGame({ cards, storage, now: () => t, rng: () => 0 });
    game.startOpening();
    game.finishOpening();
    const again = createGame({ cards, storage, now: () => t, rng: () => 0 });
    expect(again.kcal(1)).toBe(52);
    expect(again.canPity(1)).toBe(false);
  });

  it('loads an old save without calories', () => {
    const t = 1_000_000;
    const storage = memStorage(blank(t));
    const game = createGame({ cards: makeCards(1), storage, now: () => t, rng: () => 0 });
    expect(game.kcal(1)).toBe(0);
    expect(game.kcal(2)).toBe(0);
    expect(game.canPity(1)).toBe(false);
    expect(game.startOpening()).toBe(true);
  });

  it('drops junk calories when parsing a save', () => {
    const t = 1_000_000;
    expect(parseSave(JSON.stringify({ ...blank(t), kcal: { '1': 100, '2': -5 } }), t).kcal).toEqual({ '1': 100 });
    expect(parseSave(JSON.stringify({ ...blank(t), kcal: { '1': 'x', '2': 2 } }), t).kcal).toEqual({ '2': 2 });
    expect(parseSave(JSON.stringify({ ...blank(t), kcal: [] }), t).kcal).toBeUndefined();
    expect(parseSave(JSON.stringify(blank(t)), t).kcal).toBeUndefined();
  });
});

describe('pity pack', () => {
  it('is unavailable below the goal', () => {
    const t = 1_000_000;
    const storage = memStorage({ ...blank(t), kcal: { '1': 1999 } });
    const game = createGame({ cards: makeCards(1), storage, now: () => t, rng: () => 0 });
    expect(game.canPity(1)).toBe(false);
    expect(game.startPity()).toBe(false);
    expect(game.screen).toBe('home');
  });

  it('draws only a UR or SEC from the selected series', () => {
    const t = 1_000_000;
    const cards = [...makeCards(1), ...makeCards(2)];
    const storage = memStorage({ ...blank(t), kcal: { '1': 2000 } });
    const game = createGame({ cards, storage, now: () => t, rng: () => 0 });
    expect(game.startPity()).toBe(true);
    expect(game.current?.rarity).toBe('UR');
    expect(game.current?.series).toBe(1);
    expect(game.screen).toBe('opening');
  });

  it('rolls the rarity first, so the SEC tail is reachable', () => {
    const t = 1_000_000;
    const storage = memStorage({ ...blank(t), kcal: { '1': 2000 } });
    const rolls = [0.99, 0];
    let i = 0;
    const game = createGame({ cards: makeCards(1), storage, now: () => t, rng: () => rolls[Math.min(i++, rolls.length - 1)] });
    expect(game.startPity()).toBe(true);
    expect(game.current?.rarity).toBe('SEC');
  });

  it('leaves the bag stock untouched and works at zero stock', () => {
    const t = 1_000_000;
    const storage = memStorage({ ...blank(t, 0), kcal: { '1': 2000 } });
    const game = createGame({ cards: makeCards(1), storage, now: () => t, rng: () => 0 });
    expect(game.save.stock).toBe(0);
    expect(game.startPity()).toBe(true);
    expect(game.save.stock).toBe(0);
  });

  it('counts in eaten and owned, pays the goal and carries the remainder', () => {
    const t = 1_000_000;
    const storage = memStorage({ ...blank(t), kcal: { '1': 2050 } });
    const game = createGame({ cards: makeCards(1), storage, now: () => t, rng: () => 0 });
    expect(game.startPity()).toBe(true);
    expect(game.save.eaten).toBe(1);
    expect(game.ownedCount(1)).toBe(1);
    expect(game.kcal(1)).toBe(50);
  });

  it('keeps the pity flag on a resumed opening and clears it on finish', () => {
    const t = 1_000_000;
    const storage = memStorage({ ...blank(t), kcal: { '1': 2000 } });
    const game = createGame({ cards: makeCards(1), storage, now: () => t, rng: () => 0 });
    expect(game.pity).toBe(false);
    game.startPity();
    expect(game.pity).toBe(true);
    const again = createGame({ cards: makeCards(1), storage, now: () => t, rng: () => 0 });
    expect(again.screen).toBe('opening');
    expect(again.pity).toBe(true);
    again.finishOpening();
    const third = createGame({ cards: makeCards(1), storage, now: () => t, rng: () => 0 });
    expect(third.pity).toBe(false);
    expect(third.screen).toBe('home');
  });
});
