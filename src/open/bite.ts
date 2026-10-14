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

/**
 * Small wrongnesses that hint at a high rare, like the late fireworks of a slot machine:
 * one bite more than a wafer ever takes, or the wafer lying upside down (cut face at the top).
 * Mostly on UR / SEC / RSEC; now and then on an R as a false alarm, so they never quite prove it.
 */
export interface Anomaly {
  extraBite: boolean;
  upsideDown: boolean;
}
const HIGH = new Set<string>(['UR', 'SEC', 'RSEC']);
export function anomaly(rarity: Rarity, rng: () => number): Anomaly {
  const high = HIGH.has(rarity);
  const p = high ? [0.3, 0.2] : rarity === 'R' ? [0.04, 0.03] : [0, 0];
  return { extraBite: rng() < p[0], upsideDown: rng() < p[1] };
}
/** With an extra bite the wafer needs 7: one more than it can otherwise take. */
export const EXTRA_BITES = 7;

/** A crumb sparkles on the last bite: only for UR / SEC, and only half the time. */
export function omen(rarity: Rarity, rng: () => number): boolean {
  return (rarity === 'UR' || rarity === 'SEC') && rng() < 0.5;
}

const R = 17; // bite radius, cqw
const TOOTH = 3.2; // tooth-mark radius, cqw
const TEETH = 5;

const hole = (x: string, y: string, r: number) =>
  `radial-gradient(circle at ${x} ${y}, transparent ${r}cqw, #000 ${r + 0.4}cqw)`;

/** How far the wafer's top surface is bitten back past the hole, so the cut face shows as a rim. */
export const RIM = 2;

/**
 * mask-image layers that cut every bite out of the wafer: one round hole plus a row of small
 * scallops along its rim, so the edge reads as teeth. Holes are combined with `intersect`.
 * `grow` widens every hole (cqw), for the top surface that sits back from the cut.
 */
export function biteMask(bites: Bite[], grow = 0): { image: string; composite: string } {
  const layers: string[] = [];
  for (const b of bites) {
    layers.push(hole(`${b.x}%`, `${b.y}%`, R + grow));
    // Scallops face the middle of the wafer.
    const toward = Math.atan2(50 - b.y, 50 - b.x);
    for (let i = 0; i < TEETH; i++) {
      const a = toward + ((i - (TEETH - 1) / 2) * Math.PI) / 7;
      const dx = Math.cos(a) * (R - 1);
      const dy = Math.sin(a) * (R - 1);
      layers.push(hole(`calc(${b.x}% + ${dx.toFixed(2)}cqw)`, `calc(${b.y}% + ${dy.toFixed(2)}cqw)`, TOOTH + grow));
    }
  }
  return { image: layers.join(', '), composite: layers.map(() => 'intersect').join(', ') };
}
