import { describe, expect, it } from 'vitest';
import { pointerToVars } from '../src/lib/tilt.svelte';

describe('pointerToVars', () => {
  it('is neutral at the centre', () => {
    const v = pointerToVars(0.5, 0.5);
    expect(v['--pointer-from-center']).toBe('0');
    expect(v['--rotate-x']).toBe('0deg');
    expect(v['--rotate-y']).toBe('0deg');
    expect(v['--pointer-x']).toBe('50%');
    expect(v['--background-x']).toBe('50%');
  });

  it('reaches the edge values at a corner', () => {
    const v = pointerToVars(1, 0);
    expect(v['--pointer-from-center']).toBe('1');
    expect(v['--background-x']).toBe('63%');
    expect(v['--background-y']).toBe('37%');
    expect(Math.abs(parseFloat(v['--rotate-x']))).toBe(14);
    expect(Math.abs(parseFloat(v['--rotate-y']))).toBe(14);
    expect(v['--pointer-from-left']).toBe('1');
    expect(v['--pointer-from-top']).toBe('0');
  });

  it('clamps input outside 0..1', () => {
    expect(pointerToVars(2, -1)).toEqual(pointerToVars(1, 0));
  });
});
