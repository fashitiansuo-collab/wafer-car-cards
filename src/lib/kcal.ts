import type { SeriesId } from './types';

/** Calories in one wafer of each series. */
export const KCAL_PER_WAFER: Record<SeriesId, number> = { 1: 52, 2: 64, 3: 58 };

/** Calories at which a series can open a high-rare guaranteed pack. */
export const KCAL_GOAL: Record<SeriesId, number> = { 1: 2000, 2: 2000, 3: 2000 };

/** Calories after eating one more wafer of series `s`. */
export function addKcal(kcal: number, s: SeriesId): number {
  return kcal + KCAL_PER_WAFER[s];
}

/** Whether series `s` has banked enough calories for a pity pack. */
export function canPity(kcal: number, s: SeriesId): boolean {
  return kcal >= KCAL_GOAL[s];
}

/** Calories left after paying for a pity pack; the remainder carries over. */
export function payKcal(kcal: number, s: SeriesId): number {
  return Math.max(0, kcal - KCAL_GOAL[s]);
}
