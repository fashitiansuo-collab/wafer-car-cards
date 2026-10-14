import { describe, expect, it } from 'vitest';
import { anomaly, biteMask, bitesToFinish, EXTRA_BITES, omen } from '../src/open/bite';
import { mulberry32 } from '../src/lib/draw';

describe('omen', () => {
  it('never shows for low rarities', () => {
    expect(omen('C', () => 0)).toBe(false);
    expect(omen('R', () => 0)).toBe(false);
  });
  it('shows for UR / SEC half of the time', () => {
    expect(omen('UR', () => 0.4)).toBe(true);
    expect(omen('SEC', () => 0.6)).toBe(false);
  });
});

describe('anomaly', () => {
  it('never happens on C or UC', () => {
    expect(anomaly('C', () => 0)).toEqual({ extraBite: false, upsideDown: false });
    expect(anomaly('UC', () => 0)).toEqual({ extraBite: false, upsideDown: false });
  });
  it('can happen on high rares, and rarely on R as a false alarm', () => {
    expect(anomaly('SEC', () => 0.1)).toEqual({ extraBite: true, upsideDown: true });
    expect(anomaly('UR', () => 0.25)).toEqual({ extraBite: true, upsideDown: false });
    expect(anomaly('R', () => 0.035)).toEqual({ extraBite: true, upsideDown: false });
    expect(anomaly('R', () => 0.5)).toEqual({ extraBite: false, upsideDown: false });
  });
  it('asks for one bite more than a normal wafer can take', () => {
    let max = 0;
    let s = 1;
    for (let i = 0; i < 500; i++) max = Math.max(max, bitesToFinish(() => ((s = (s * 9301 + 49297) % 233280) / 233280)));
    expect(EXTRA_BITES).toBe(max + 1);
  });
});

describe('bitesToFinish', () => {
  it('is 4 to 6', () => {
    const rng = mulberry32(3);
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) seen.add(bitesToFinish(rng));
    expect([...seen].sort()).toEqual([4, 5, 6]);
  });
});

describe('biteMask', () => {
  it('is empty with no bites', () => {
    expect(biteMask([])).toEqual({ image: '', composite: '' });
  });
  it('has one hole plus teeth per bite and composites them all', () => {
    const m = biteMask([{ x: 10, y: 20 }, { x: 80, y: 50 }]);
    const layers = m.image.split('radial-gradient(').length - 1;
    expect(layers).toBe(12);
    expect(m.composite.split(',').length).toBe(12);
    expect(m.image).toContain('at 10% 20%');
  });
});
