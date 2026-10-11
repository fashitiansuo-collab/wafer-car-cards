import { describe, expect, it } from 'vitest';
import { addKcal, canPity, KCAL_GOAL, KCAL_PER_WAFER, payKcal } from '../src/lib/kcal';

describe('kcal', () => {
  it('banks a fixed number of calories per wafer', () => {
    expect(KCAL_PER_WAFER[1]).toBe(52);
    expect(KCAL_PER_WAFER[2]).toBe(64);
  });

  it('adds calories for the given series only', () => {
    expect(addKcal(0, 1)).toBe(52);
    expect(addKcal(0, 2)).toBe(64);
    expect(addKcal(100, 2)).toBe(164);
  });

  it('is ready only at or above the goal', () => {
    expect(canPity(KCAL_GOAL[1] - 1, 1)).toBe(false);
    expect(canPity(KCAL_GOAL[1], 1)).toBe(true);
    expect(canPity(KCAL_GOAL[2] + 10, 2)).toBe(true);
  });

  it('carries the remainder over after paying', () => {
    expect(payKcal(KCAL_GOAL[1] + 30, 1)).toBe(30);
    expect(payKcal(KCAL_GOAL[2], 2)).toBe(0);
    expect(payKcal(0, 1)).toBe(0);
  });
});
