import { describe, expect, it } from 'vitest';
import { clipHalf, peel, reflect } from '../src/cards/rsec/peel';

describe('peel geometry', () => {
  it('leaves the whole card flat when the corner has not moved', () => {
    const p = peel(100, 140, { x: 100, y: 140 });
    expect(p.amount).toBe(0);
    expect(p.flap).toBe('polygon(0 0)');
  });

  it('folds a triangle off the corner for a small diagonal pull', () => {
    const p = peel(100, 140, { x: 80, y: 120 });
    // The flat part loses the corner: five points (a pentagon).
    expect(p.flat.split(',').length).toBe(5);
    // The flap is the corner triangle.
    expect(p.flap.split(',').length).toBe(3);
    expect(p.amount).toBeGreaterThan(0);
    expect(p.amount).toBeLessThan(0.2);
  });

  it('reflects the corner onto the pointer', () => {
    const k = { x: 100, y: 140 };
    const pt = { x: 40, y: 60 };
    const m = { x: 70, y: 100 };
    const d = { x: 60, y: 80 };
    const r = reflect(k, m, d);
    expect(r.x).toBeCloseTo(pt.x);
    expect(r.y).toBeCloseTo(pt.y);
  });

  it('clips a square to a half plane', () => {
    const sq = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    const half = clipHalf(sq, { x: 5, y: 5 }, { x: 1, y: 0 });
    expect(half.every((q) => q.x <= 5 + 1e-9)).toBe(true);
    expect(half.length).toBe(4);
  });

  it('reaches amount 1 when pulled to the far corner', () => {
    expect(peel(100, 140, { x: 0, y: 0 }).amount).toBeCloseTo(1);
  });
});
