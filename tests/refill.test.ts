import { describe, expect, it } from 'vitest';
import { msToNext, refill } from '../src/lib/refill';

describe('refill', () => {
  it('keeps stock before 60s pass', () => {
    expect(refill(3, 0, 59_999)).toEqual({ stock: 3, lastRefillAt: 0 });
  });

  it('adds one at exactly 60s', () => {
    expect(refill(3, 0, 60_000)).toEqual({ stock: 4, lastRefillAt: 60_000 });
  });

  it('adds whole intervals only', () => {
    expect(refill(3, 0, 150_000)).toEqual({ stock: 5, lastRefillAt: 120_000 });
  });

  it('snaps lastRefillAt to now when reaching full', () => {
    expect(refill(9, 0, 600_000)).toEqual({ stock: 10, lastRefillAt: 600_000 });
  });

  it('stays full and follows now', () => {
    expect(refill(10, 0, 999_999)).toEqual({ stock: 10, lastRefillAt: 999_999 });
  });

  it('resyncs on clock rewind', () => {
    expect(refill(3, 500_000, 100)).toEqual({ stock: 3, lastRefillAt: 100 });
  });
});

describe('msToNext', () => {
  it('returns remaining ms when not full', () => {
    expect(msToNext(3, 0, 15_000)).toBe(45_000);
  });

  it('returns null when full', () => {
    expect(msToNext(10, 0, 15_000)).toBeNull();
  });
});
