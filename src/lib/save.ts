import { STOCK_MAX } from './refill';
import type { Save } from './types';

export const SAVE_KEY = 'wafer-cards:v1';

export function initialSave(now: number): Save {
  return { v: 1, stock: STOCK_MAX, lastRefillAt: now, eaten: 0, owned: {}, firstPulledAt: {}, pending: null };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function toTimestamp(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null;
}

export function parseSave(raw: string | null, now: number): Save {
  const fallback = initialSave(now);
  if (raw == null) return fallback;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return fallback;
  }
  if (!isRecord(data) || data.v !== 1) return fallback;
  const owned: Record<string, number> = {};
  if (isRecord(data.owned)) {
    for (const [k, v] of Object.entries(data.owned)) {
      if (typeof v === 'number' && Number.isInteger(v) && v >= 1) owned[k] = v;
    }
  }
  const firstPulledAt: Record<string, number> = {};
  if (isRecord(data.firstPulledAt)) {
    for (const [k, v] of Object.entries(data.firstPulledAt)) {
      const t = toTimestamp(v);
      if (t != null) firstPulledAt[k] = t;
    }
  }
  const stock = data.stock;
  const eaten = data.eaten;
  return {
    v: 1,
    stock: typeof stock === 'number' && Number.isInteger(stock) && stock >= 0 && stock <= STOCK_MAX ? stock : STOCK_MAX,
    lastRefillAt: toTimestamp(data.lastRefillAt) ?? now,
    eaten: typeof eaten === 'number' && Number.isInteger(eaten) && eaten >= 0 ? eaten : 0,
    owned,
    firstPulledAt,
    pending: typeof data.pending === 'string' || data.pending === null ? data.pending : null,
  };
}

export function loadSave(storage: Pick<Storage, 'getItem'> | null, now: number): Save {
  if (storage == null) return initialSave(now);
  try {
    return parseSave(storage.getItem(SAVE_KEY), now);
  } catch {
    return initialSave(now);
  }
}

export function writeSave(storage: Pick<Storage, 'setItem'> | null, s: Save): boolean {
  if (storage == null) return false;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}
