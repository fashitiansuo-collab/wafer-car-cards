// Bespoke cards (SEC series 2 onwards, promos): one component per card id.
// Every component takes { promo, interactive, flipped, tilt, moment, firstPulledAt };
// `moment` plays the card's own one-off animation right after the shared SEC entrance.
import type { Component } from 'svelte';
import PromoPR01 from './PromoPR01.svelte';
import PromoPR01B from './PromoPR01B.svelte';
import PromoPR02 from './PromoPR02.svelte';
import promosJson from '../../data/promos.json';
import type { Promo } from '../../lib/types';

export const promos = promosJson as unknown as Promo[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const specials: Record<string, Component<any>> = {
  pr01: PromoPR01,
  pr01b: PromoPR01B,
  pr02: PromoPR02,
};

/** SEC cards may be landscape (88:63) or portrait (63:88). */
export const landscape = new Set(['pr02']);
