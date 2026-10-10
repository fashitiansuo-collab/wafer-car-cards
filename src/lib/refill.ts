export const STOCK_MAX = 10;
export const REFILL_MS = 60000;

export function refill(stock: number, lastRefillAt: number, now: number): { stock: number; lastRefillAt: number } {
  if (stock >= STOCK_MAX) return { stock: STOCK_MAX, lastRefillAt: now };
  if (now < lastRefillAt) return { stock, lastRefillAt: now };
  const n = Math.floor((now - lastRefillAt) / REFILL_MS);
  if (n <= 0) return { stock, lastRefillAt };
  const next = Math.min(STOCK_MAX, stock + n);
  if (next >= STOCK_MAX) return { stock: next, lastRefillAt: now };
  return { stock: next, lastRefillAt: lastRefillAt + n * REFILL_MS };
}

export function msToNext(stock: number, lastRefillAt: number, now: number): number | null {
  if (stock >= STOCK_MAX) return null;
  if (now < lastRefillAt) return REFILL_MS;
  return REFILL_MS - ((now - lastRefillAt) % REFILL_MS);
}
