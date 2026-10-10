// Bespoke cards (SEC series 2 onwards, promos): one component per card id.
// Every component takes { promo, interactive, flipped, tilt, wink, firstPulledAt }.
import type { Component } from 'svelte';
import PromoPR01 from './PromoPR01.svelte';
import promosJson from '../../data/promos.json';
import type { Promo } from '../../lib/types';

export const promos = promosJson as unknown as Promo[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const specials: Record<string, Component<any>> = {
  pr01: PromoPR01,
};
