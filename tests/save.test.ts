import { describe, expect, it } from 'vitest';
import { initialSave, loadSave, parseSave, writeSave } from '../src/lib/save';
import type { Save } from '../src/lib/types';

const base = { v: 1, stock: 5, lastRefillAt: 100, eaten: 2, owned: {}, firstPulledAt: {}, pending: null };

describe('parseSave', () => {
  it('returns initial on null', () => {
    expect(parseSave(null, 5)).toEqual(initialSave(5));
  });

  it('returns initial on broken json', () => {
    expect(parseSave('{bad', 5)).toEqual(initialSave(5));
  });

  it('returns initial on unknown version', () => {
    expect(parseSave(JSON.stringify({ ...base, v: 2 }), 5)).toEqual(initialSave(5));
  });

  it('repairs each bad value with its default', () => {
    expect(parseSave(JSON.stringify({ ...base, stock: 99 }), 7).stock).toBe(10);
    expect(parseSave(JSON.stringify({ ...base, stock: NaN }), 7).stock).toBe(10);
    expect(parseSave(JSON.stringify({ ...base, owned: [] }), 7).owned).toEqual({});
    expect(parseSave(JSON.stringify({ ...base, owned: { a: -1, b: 2 } }), 7).owned).toEqual({ b: 2 });
  });

  it('round-trips a valid save', () => {
    const s: Save = { v: 1, stock: 4, lastRefillAt: 60_000, eaten: 3, owned: { c001: 2 }, firstPulledAt: { c001: 50_000 }, pending: 'c001' };
    expect(parseSave(JSON.stringify(s), 0)).toEqual(s);
  });
});

describe('loadSave / writeSave', () => {
  it('handles missing or throwing storage', () => {
    const s = initialSave(0);
    expect(writeSave({ setItem() { throw new Error('no storage'); } }, s)).toBe(false);
    expect(loadSave(null, 5)).toEqual(initialSave(5));
  });
});
