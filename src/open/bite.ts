import type { Rarity } from '../lib/types';

export interface Bite {
  /** Centre of the bite, % of the wafer. */
  x: number;
  y: number;
}

/** How many bites eat the whole wafer: 4 to 6. */
export function bitesToFinish(rng: () => number): number {
  return 4 + Math.floor(rng() * 3);
}

/** A crumb sparkles on the last bite: only for UR / SEC, and only half the time. */
export function omen(rarity: Rarity, rng: () => number): boolean {
  return (rarity === 'UR' || rarity === 'SEC') && rng() < 0.5;
}

const R = 17; // bite radius, cqw
const TOOTH = 3.2; // tooth-mark radius, cqw
const TEETH = 5;

const hole = (x: string, y: string, r: number) =>
  `radial-gradient(circle at ${x} ${y}, transparent ${r}cqw, #000 ${r + 0.4}cqw)`;

/**
 * mask-image layers that cut every bite out of the wafer: one round hole plus a row of small
 * scallops along its rim, so the edge reads as teeth. Holes are combined with `intersect`.
 */
export function biteMask(bites: Bite[]): { image: string; composite: string } {
  const layers: string[] = [];
  for (const b of bites) {
    layers.push(hole(`${b.x}%`, `${b.y}%`, R));
    // Scallops face the middle of the wafer.
    const toward = Math.atan2(50 - b.y, 50 - b.x);
    for (let i = 0; i < TEETH; i++) {
      const a = toward + ((i - (TEETH - 1) / 2) * Math.PI) / 7;
      const dx = Math.cos(a) * (R - 1);
      const dy = Math.sin(a) * (R - 1);
      layers.push(hole(`calc(${b.x}% + ${dx.toFixed(2)}cqw)`, `calc(${b.y}% + ${dy.toFixed(2)}cqw)`, TOOTH));
    }
  }
  return { image: layers.join(', '), composite: layers.map(() => 'intersect').join(', ') };
}
