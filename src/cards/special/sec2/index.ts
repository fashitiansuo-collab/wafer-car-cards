// Series-2 and later SEC cards: each has its own front, drawn on its photograph (docs/sec/README.md).
import type { Component } from 'svelte';
import SecD043 from './SecD043.svelte';
import SecD044 from './SecD044.svelte';
import SecD045 from './SecD045.svelte';
import SecE043 from '../sec3/SecE043.svelte';
import SecE044 from '../sec3/SecE044.svelte';
import SecE045 from '../sec3/SecE045.svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const secFronts: Record<string, Component<any>> = {
  d043: SecD043,
  d044: SecD044,
  d045: SecD045,
  e043: SecE043,
  e044: SecE044,
  e045: SecE045,
};
