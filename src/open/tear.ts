import { mulberry32 } from '../lib/draw';

/** Height of the tear line, as % of the bag from the top. */
export const TEAR_Y = 12;
const TEETH = 28;
const AMP = 1.4;

/**
 * clip-path for the strip above the tear line ('top') or the bag below it ('body'). The shared edge is
 * jagged from the left up to `progress` (0..1) of the width, and still a straight crease beyond it.
 */
export function tearPath(progress: number, seed: number, part: 'top' | 'body' = 'top'): string {
  const p = Math.min(1, Math.max(0, progress));
  const rng = mulberry32(seed);
  const jag: number[] = Array.from({ length: TEETH + 1 }, () => (rng() * 2 - 1) * AMP);
  const torn = Math.round(p * TEETH);

  const pts: string[] = part === 'top' ? ['0% 0%', '100% 0%'] : ['0% 100%', '100% 100%'];
  if (torn < TEETH) pts.push(`100% ${TEAR_Y}%`);
  // Walk the edge right-to-left; only the torn part has teeth.
  for (let i = torn; i >= 0; i--) {
    const x = (i / TEETH) * 100;
    pts.push(`${x.toFixed(2)}% ${(TEAR_Y + jag[i]).toFixed(2)}%`);
  }
  if (torn === 0) pts.push(`0% ${TEAR_Y}%`);
  return `polygon(${pts.join(', ')})`;
}
