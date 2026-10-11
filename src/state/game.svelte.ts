import { drawCard } from '../lib/draw';
import { refill, STOCK_MAX } from '../lib/refill';
import { loadSave, writeSave } from '../lib/save';
import { cardsOf } from '../lib/series';
import type { Card, Rarity, Save, SeriesId } from '../lib/types';

export type Screen = 'home' | 'opening' | 'result' | 'garage' | 'detail' | 'records' | 'debug';

export interface Game {
  readonly save: Save;
  screen: Screen;
  detailId: string | null;
  forced: Rarity | null;
  /** The bag currently selected on Home. */
  series: SeriesId;
  readonly current: Card | null;
  readonly isNew: boolean;
  tick(): void;
  /** Re-read the save (another tab may have changed it). */
  reload(): void;
  startOpening(): boolean;
  finishOpening(): void;
  /** Add a promo card (no bag spent, not part of the collection count). False if already owned. */
  grantPromo(id: string): boolean;
  ownedCount(s?: SeriesId): number;
  countByRarity(s?: SeriesId): Record<Rarity, number>;
  seriesCount(s: SeriesId): number;
}

export interface CreateGameOpts {
  cards: Card[];
  storage: Storage | null;
  now: () => number;
  rng: () => number;
}

export function createGame(opts: CreateGameOpts): Game {
  const { cards, storage, now, rng } = opts;
  const byId = new Map(cards.map((c) => [c.id, c]));

  let save = $state<Save>(loadSave(storage, now()));
  let screen = $state<Screen>('home');
  let detailId = $state<string | null>(null);
  let forced = $state<Rarity | null>(null);
  let series = $state<SeriesId>(save.series ?? 1);
  let current = $state<Card | null>(null);
  let isNew = $state(false);

  // Resume an interrupted opening without double counting.
  if (save.pending != null) {
    const card = byId.get(save.pending);
    if (card) {
      current = card;
      isNew = (save.owned[card.id] ?? 0) <= 1;
      screen = 'opening';
    } else {
      save.pending = null;
    }
  }

  function persist(): void {
    writeSave(storage, save);
  }

  function tick(): void {
    const r = refill(save.stock, save.lastRefillAt, now());
    // Write only when a bag is actually added, and on top of the latest save, so an idle tab
    // does not overwrite another tab's progress every second.
    if (r.stock === save.stock) {
      save.lastRefillAt = r.lastRefillAt;
      return;
    }
    reload();
    const fresh = refill(save.stock, save.lastRefillAt, now());
    save.stock = fresh.stock;
    save.lastRefillAt = fresh.lastRefillAt;
    persist();
  }

  function reload(): void {
    if (storage) save = loadSave(storage, now());
  }

  function startOpening(): boolean {
    reload();
    const pool = cardsOf(cards, series);
    // An empty set has nothing to draw; do not spend a bag on it.
    if (pool.length === 0) return false;
    tick();
    if (save.stock <= 0) return false;
    if (save.stock >= STOCK_MAX) save.lastRefillAt = now();
    save.stock -= 1;
    save.eaten += 1;
    const card = drawCard(pool, rng, forced ?? undefined);
    const had = save.owned[card.id] ?? 0;
    save.owned[card.id] = had + 1;
    if (save.firstPulledAt[card.id] === undefined) save.firstPulledAt[card.id] = now();
    isNew = had <= 0;
    save.pending = card.id;
    current = card;
    persist();
    screen = 'opening';
    return true;
  }

  function finishOpening(): void {
    save.pending = null;
    persist();
    screen = 'result';
  }

  function grantPromo(id: string): boolean {
    reload();
    if ((save.owned[id] ?? 0) > 0) return false;
    save.owned[id] = 1;
    save.firstPulledAt[id] = now();
    persist();
    return true;
  }

  function ownedCount(s?: SeriesId): number {
    let n = 0;
    for (const c of s == null ? cards : cardsOf(cards, s)) if ((save.owned[c.id] ?? 0) > 0) n += 1;
    return n;
  }

  function countByRarity(s?: SeriesId): Record<Rarity, number> {
    const out: Record<Rarity, number> = { C: 0, UC: 0, R: 0, UR: 0, SEC: 0 };
    for (const c of s == null ? cards : cardsOf(cards, s)) if ((save.owned[c.id] ?? 0) > 0) out[c.rarity] += 1;
    return out;
  }

  function seriesCount(s: SeriesId): number {
    return cardsOf(cards, s).length;
  }

  return {
    get save() { return save; },
    get screen() { return screen; },
    set screen(v: Screen) { screen = v; },
    get detailId() { return detailId; },
    set detailId(v: string | null) { detailId = v; },
    get forced() { return forced; },
    set forced(v: Rarity | null) { forced = v; },
    get series() { return series; },
    set series(v: SeriesId) {
      reload();
      series = v;
      save.series = v;
      persist();
    },
    get current() { return current; },
    get isNew() { return isNew; },
    tick,
    reload,
    startOpening,
    finishOpening,
    grantPromo,
    ownedCount,
    countByRarity,
    seriesCount,
  };
}
