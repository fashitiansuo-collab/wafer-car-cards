<script lang="ts">
  import type { Card } from '../lib/types';
  import type { Game } from '../state/game.svelte';
  import CardView from '../cards/Card.svelte';
  import GuideBar, { type Hint } from '../ui/GuideBar.svelte';
  import TitleLockup from '../ui/TitleLockup.svelte';
  import { isGlobalKey } from '../lib/keys';
  import { promos, specials } from '../cards/special';

  let { game, cards }: { game: Game; cards: Card[] } = $props();

  const card = $derived(cards.find((c) => c.id === game.detailId && (game.save.owned[c.id] ?? 0) > 0));
  const promo = $derived(promos.find((p) => p.id === game.detailId && (game.save.owned[p.id] ?? 0) > 0));
  const Special = $derived(promo ? specials[promo.id] : null);
  let flipped = $state(false);

  // Never show a card that has not been drawn: send the person back to the garage instead.
  $effect(() => {
    if (!card && !promo) game.screen = 'garage';
  });

  const hints: Hint[] = $derived([
    { keys: '←', label: '戻る', onclick: () => (game.screen = 'garage') },
    { keys: '⇄', label: flipped ? '表を見る' : '裏を見る', onclick: () => (flipped = !flipped) },
  ]);

  function onkey(e: KeyboardEvent) {
    if (e.key === 'Escape') game.screen = 'garage';
    if (!isGlobalKey(e)) return;
    if (e.key === 'Backspace') game.screen = 'garage';
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flipped = !flipped;
    }
  }
</script>

<svelte:window onkeydown={onkey} />

{#if promo && Special}
  <div class="stage">
    <button class="slot" onclick={() => (flipped = !flipped)} aria-label={flipped ? '表を見る' : '裏を見る'}>
      <Special {promo} {flipped} firstPulledAt={game.save.firstPulledAt[promo.id]} />
    </button>
    <div class="lockup">
      <hgroup class="p-lock">
        <p>PROMOTION CARD · {promo.code}</p>
        <h1>{promo.model} <small>({promo.generation})</small></h1>
      </hgroup>
    </div>
  </div>
{:else if card}
  <div class="stage">
    <button class="slot" onclick={() => (flipped = !flipped)} aria-label={flipped ? '表を見る' : '裏を見る'}>
      <CardView {card} total={cards.length} {flipped} firstPulledAt={game.save.firstPulledAt[card.id]} />
    </button>
    <div class="lockup">
      <TitleLockup maker={card.maker} model={card.model} year={card.year} rarity={card.rarity} />
      <span class="count">×{game.save.owned[card.id]}</span>
    </div>
  </div>
{/if}
<GuideBar {hints} />

<style>
  .p-lock {
    margin: 0;
  }
  .p-lock p {
    margin: 0 0 .5rem;
    font: 600 1.3rem/1 var(--latin-condensed);
    letter-spacing: .12em;
    color: var(--yellow);
  }
  .p-lock h1 {
    margin: 0;
    font: 700 4rem/.95 var(--latin-condensed);
    text-transform: uppercase;
  }
  .p-lock small {
    font-size: .5em;
    color: var(--paper-2);
  }
  .stage {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-rows: 1fr auto;
    justify-items: center;
    align-items: center;
  }
  .slot {
    width: 78%;
    display: block;
  }
  .slot:focus-visible {
    outline: 1px solid var(--sel-frame);
    outline-offset: 6px;
  }
  .lockup {
    width: 100%;
    padding: 0 var(--inset) 1.6rem;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }
  .count {
    font: 500 1.3rem/1 var(--latin);
    color: var(--paper-2);
  }
</style>
