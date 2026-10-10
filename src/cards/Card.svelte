<script lang="ts">
  import type { Card } from '../lib/types';
  import { createTilt, type Tilt } from '../lib/tilt.svelte';
  import CardBack from './CardBack.svelte';
  import Frame from './Frame.svelte';
  import './frames.css';
  import './rarity/base.css';
  import './rarity/c.css';
  import './rarity/uc.css';
  import './rarity/r.css';
  import './rarity/ur.css';
  import './rarity/sec.css';

  interface Props {
    card: Card;
    total?: number;
    interactive?: boolean;
    flipped?: boolean;
    /** Pass a tilt to drive the card from outside (reveal sweeps). */
    tilt?: Tilt;
    firstPulledAt?: number | null;
    /** A plain back with no details, for a card that has not been revealed yet. */
    plainBack?: boolean;
  }

  let { card, total = 45, interactive = true, flipped = false, tilt, firstPulledAt = null, plainBack = false }: Props =
    $props();

  const own = createTilt();
  const t = $derived(tilt ?? own);
  let el: HTMLElement;

  $effect(() => {
    if (!interactive || !el) return;
    return t.attach(el);
  });

  // C–R sit in dark frames; UR turns them white, SEC patterned.
  const tone = $derived(card.rarity === 'SEC' ? 'pattern' : card.rarity === 'UR' ? 'light' : 'dark');
  const vars = $derived(
    `${t.style};--photo:url("${card.image}");--focus:${card.focus ?? '50% 50%'}` +
      (card.rarity === 'SEC' ? `;--photo-dark:url("${card.image.replace(/\.jpg$/, '-dark.jpg')}")` : ''),
  );
</script>

<div
  class="card"
  class:card--active={t.active}
  class:card--flipped={flipped}
  data-rarity={card.rarity}
  data-frame={card.frame ?? 'gallery'}
  data-tone={tone}
  style={vars}
  bind:this={el}
>
  <div class="card__rotator">
    <div class="card__front">
      <Frame {card} {total} />
      <div class="card__photo"><img src={card.image} alt="" draggable="false" /></div>
      <div class="card__shine"></div>
      <div class="card__shine card__shine--2"></div>
      <div class="card__glare"></div>
    </div>
    <div class="card__back">
      <CardBack card={plainBack ? null : card} {firstPulledAt} />
    </div>
  </div>
</div>
