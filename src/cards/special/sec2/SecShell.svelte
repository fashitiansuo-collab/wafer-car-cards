<script lang="ts">
  // The frame every series-2 SEC shares: tilt, the flip, the common back, the signature.
  // Each card draws only its own front (the children) on top of its photograph.
  import type { Snippet } from 'svelte';
  import type { Card } from '../../../lib/types';
  import { createTilt, type Tilt } from '../../../lib/tilt.svelte';
  import CardBack from '../../CardBack.svelte';
  import Signature from '../Signature.svelte';
  import '../../rarity/base.css';
  import '../../rarity/holo.css';

  interface Props {
    card: Card;
    /** Class that scopes the card's own styles. */
    name: string;
    interactive?: boolean;
    flipped?: boolean;
    tilt?: Tilt;
    moment?: boolean;
    firstPulledAt?: number | null;
    plainBack?: boolean;
    ink?: string;
    /** Holo foil over the whole card (series 3 onwards). */
    holo?: 'rainbow' | 'secret';
    children: Snippet;
  }
  let {
    card,
    name,
    interactive = true,
    flipped = false,
    tilt,
    moment = false,
    firstPulledAt = null,
    plainBack = false,
    ink = '#f4f1ea',
    holo,
    children,
  }: Props = $props();

  const own = createTilt();
  const t = $derived(tilt ?? own);
  let el: HTMLElement;
  $effect(() => (interactive && el ? t.attach(el) : undefined));
  const no = $derived(`${card.series ?? 1}-${String(card.no).padStart(3, '0')}`);
</script>

<div
  class="card sec2 {name}"
  class:card--active={t.active}
  class:card--flipped={flipped}
  class:moment
  style={t.style}
  bind:this={el}
>
  <div class="card__rotator">
    <div class="card__front">
      {@render children()}
      {#if holo}<div class="card__holo holo--{holo}" aria-hidden="true"></div>{/if}
      <Signature {no} label="SEC" {ink} />
      <div class="card__glare"></div>
    </div>
    <div class="card__back">
      <CardBack card={plainBack ? null : card} {firstPulledAt} />
    </div>
  </div>
</div>

<style>
  .sec2 :global(.card__front) {
    box-shadow: none;
  }
</style>
