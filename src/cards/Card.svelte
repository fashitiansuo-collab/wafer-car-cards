<script lang="ts">
  import type { Card } from '../lib/types';
  import { createTilt, type Tilt } from '../lib/tilt.svelte';
  import CardBack from './CardBack.svelte';
  import Frame from './Frame.svelte';
  import { secFronts } from './special/sec2';
  import PeelCard from './rsec/PeelCard.svelte';
  import Self from './Card.svelte';
  import './frames.css';
  import './rarity/base.css';
  import './rarity/c.css';
  import './rarity/uc.css';
  import './rarity/r.css';
  import './rarity/ur.css';
  import './rarity/sec.css';
  import './rarity/etched.css';

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
    /** Play a bespoke card's one-off moment (right after its reveal). */
    moment?: boolean;
    /** RSEC: already peeled (show the real card). */
    peeled?: boolean;
    /** RSEC: may be peeled here (result and detail screens). */
    canPeel?: boolean;
    onPeel?: () => void;
  }

  let {
    card,
    total = 45,
    interactive = true,
    flipped = false,
    tilt,
    firstPulledAt = null,
    plainBack = false,
    moment = false,
    peeled = false,
    canPeel = false,
    onPeel,
  }: Props = $props();

  // RSEC: until peeled it is an ordinary common, with its own photo, name and credits.
  const disguise = $derived<Card | null>(
    card.rarity === 'RSEC' && card.stock
      ? {
          ...card,
          rarity: 'C',
          image: card.stock.image,
          focus: card.stock.focus,
          frame: card.stock.frame,
          model: card.stock.model ?? card.model,
          exif: card.stock.exif,
          palette: card.stock.palette,
          credit: card.stock.credit,
          spec: undefined,
          flavor: undefined,
        }
      : null,
  );
  // Series 3 onwards: the secret cards are etched (a raised relief that catches the light).
  const etched = $derived((card.series ?? 1) >= 3 && (card.rarity === 'SEC' || card.rarity === 'RSEC'));

  // Series-2 SEC cards have a front of their own instead of a frame.
  const Bespoke = $derived(secFronts[card.id]);

  const own = createTilt();
  const t = $derived(tilt ?? own);
  let el: HTMLElement | undefined = $state();

  $effect(() => {
    if (!interactive || !el) return;
    return t.attach(el);
  });

  // C–R sit in dark frames; UR and RSEC turn them white, SEC patterned.
  const tone = $derived(card.rarity === 'SEC' ? 'pattern' : card.rarity === 'UR' || card.rarity === 'RSEC' ? 'light' : 'dark');
  const vars = $derived(
    `${t.style};--photo:url("${card.image}");--focus:${card.focus ?? '50% 50%'}` +
      (card.rarity === 'SEC' ? `;--photo-dark:url("${card.image.replace(/\.jpg$/, '-dark.jpg')}")` : ''),
  );
</script>

{#if disguise && !peeled && !canPeel}
  <Self card={disguise} {total} {interactive} {flipped} {tilt} {firstPulledAt} {plainBack} />
{:else if disguise && !peeled}
  <PeelCard {canPeel} {onPeel}>
    {#snippet top()}<Self card={disguise} {total} {interactive} {flipped} {tilt} {firstPulledAt} {plainBack} />{/snippet}
    {#snippet under()}<Self {card} {total} {interactive} {flipped} {tilt} {firstPulledAt} {plainBack} peeled />{/snippet}
  </PeelCard>
{:else if Bespoke}
  <Bespoke {card} {interactive} {flipped} {tilt} {firstPulledAt} {plainBack} {moment} />
{:else}
<div
  class="card"
  class:card--active={t.active}
  class:card--flipped={flipped}
  class:card--etched={etched}
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
{/if}
