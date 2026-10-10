<script lang="ts">
  import type { Card } from '../lib/types';
  import { createTilt, type Tilt } from '../lib/tilt.svelte';
  import CardBack from './CardBack.svelte';
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
  }

  let { card, total = 45, interactive = true, flipped = false, tilt, firstPulledAt = null }: Props = $props();

  const own = createTilt();
  const t = $derived(tilt ?? own);
  let el: HTMLElement;

  $effect(() => {
    if (!interactive || !el) return;
    return t.attach(el);
  });

  const full = $derived(card.rarity === 'UR' || card.rarity === 'SEC');
  const no = $derived(String(card.no).padStart(3, '0'));
  const vars = $derived(
    `${t.style};--photo:url("${card.image}");--focus:${card.focus ?? '50% 50%'}` +
      (card.rarity === 'SEC' ? `;--photo-dark:url("${card.image.replace(/\.jpg$/, '-dark.jpg')}")` : ''),
  );
</script>

<div
  class="card"
  class:card--full={full}
  class:card--active={t.active}
  class:card--flipped={flipped}
  data-rarity={card.rarity}
  style={vars}
  bind:this={el}
>
  <div class="card__rotator">
    <div class="card__front">
      <div class="card__photo"><img src={card.image} alt="" draggable="false" /></div>
      <div class="card__face">
        <header class="card__head">
          <span class="card__maker">{card.maker}</span>
          <span class="card__model">{card.model}</span>
        </header>
        <footer class="card__foot">
          <span class="card__meta">{card.year} · {card.country}</span>
          <span class="card__no">No.{no} / {String(total).padStart(3, '0')}</span>
          <span class="card__rarity">{card.rarity}</span>
        </footer>
      </div>
      <div class="card__shine"></div>
      <div class="card__shine card__shine--2"></div>
      <div class="card__glare"></div>
    </div>
    <div class="card__back">
      <CardBack {card} {firstPulledAt} />
    </div>
  </div>
</div>
