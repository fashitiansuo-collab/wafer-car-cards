import { describe, expect, it } from 'vitest';
import { biteMask, bitesToFinish, omen } from '../src/open/bite';
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
