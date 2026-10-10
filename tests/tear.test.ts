import { describe, expect, it } from 'vitest';
import { tearPath } from '../src/open/tear';

const count = (p: string) => p.split(',').length;

describe('tearPath', () => {
  it('returns a polygon at both ends of the tear', () => {
    expect(tearPath(0, 1).startsWith('polygon(')).toBe(true);
    expect(tearPath(1, 1).startsWith('polygon(')).toBe(true);
  });

  it('is stable for the same seed', () => {
    expect(tearPath(0.5, 7)).toBe(tearPath(0.5, 7));
  });

  it('gains points as the tear runs across', () => {
    expect(count(tearPath(0.5, 1))).toBeGreaterThan(count(tearPath(0, 1)));
    expect(count(tearPath(1, 1))).toBeGreaterThan(count(tearPath(0.5, 1)));
  });

  it('clamps progress', () => {
    expect(tearPath(2, 3)).toBe(tearPath(1, 3));
    expect(tearPath(-1, 3)).toBe(tearPath(0, 3));
  });
});

describe('tearPath body', () => {
  it('shares the torn edge with the strip above it', () => {
    const top = tearPath(0.6, 5, 'top').split(', ').slice(2);
    const body = tearPath(0.6, 5, 'body').split(', ').slice(2);
    expect(body).toEqual(top);
    expect(tearPath(0.6, 5, 'body').startsWith('polygon(0% 100%, 100% 100%')).toBe(true);
  });
});
