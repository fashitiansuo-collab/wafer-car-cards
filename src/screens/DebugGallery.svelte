<script lang="ts">
  import Card from '../cards/Card.svelte';
  import type { Card as CardT, Frame, Rarity } from '../lib/types';
  import { RARITIES } from '../lib/types';
  import { createTilt } from '../lib/tilt.svelte';

  let { cards }: { cards: CardT[] } = $props();

  const params = new URLSearchParams(location.search);
  const only = params.get('rarity') as Rarity | null;
  // ?px=.2&py=.2 freezes every card at that tilt, for screenshots.
  const fixed = params.has('px') ? createTilt() : undefined;
  if (fixed) fixed.set(Number(params.get('px')), Number(params.get('py') ?? 0.5), 1);
  const pick = (r: Rarity) => cards.filter((c) => c.rarity === r);
  const id = params.get('id');
  // ?frame=litt shows every card in that frame, to compare tones.
  const frame = params.get('frame') as Frame | null;
  const shown = $derived(
    id ? cards.filter((c) => c.id === id) : only ? pick(only) : RARITIES.map((r) => pick(r)[Number(params.get('i') ?? 0) % pick(r).length]),
  );
</script>

<div class="gallery">
  {#each shown as card (card.id)}
    <div class="cell"><Card card={frame ? { ...card, frame } : card} tilt={fixed} interactive={!fixed} /></div>
  {/each}
</div>

<style>
  .gallery {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    padding: 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-content: start;
  }
</style>
