<script lang="ts">
  import type { Card } from '../lib/types';
  import type { Game } from '../state/game.svelte';
  import { msToNext } from '../lib/refill';
  import BottomStrip from '../ui/BottomStrip.svelte';
  import GuideBar, { type Hint } from '../ui/GuideBar.svelte';

  let { game, cards, now }: { game: Game; cards: Card[]; now: number } = $props();

  const owned = $derived(game.ownedCount());
  const byR = $derived(game.countByRarity());
  const empty = $derived(game.save.stock <= 0);
  const left = $derived(msToNext(game.save.stock, game.save.lastRefillAt, now) ?? 0);
  const leftText = $derived(`${Math.floor(Math.ceil(left / 1000) / 60)}:${String(Math.ceil(left / 1000) % 60).padStart(2, '0')}`);

  const hints: Hint[] = $derived(
    empty
      ? [{ keys: '◷', label: `次の袋まで ${leftText}` }]
      : [{ keys: '⏎', label: '袋を開ける', onclick: () => game.startOpening() }],
  );

  function onkey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !empty) game.startOpening();
  }
</script>

<svelte:window onkeydown={onkey} />

<div class="stage">
  <button class="bag" class:empty disabled={empty} onclick={() => game.startOpening()} aria-label="袋を開ける">
    <span class="bag__ph">WAFER</span>
  </button>
</div>

<BottomStrip
  cells={[
    { title: `図鑑 ${owned} / ${cards.length}`, value: `${Math.round((owned / cards.length) * 100)}%`, progress: owned / cards.length },
    { title: '食べた数', value: String(game.save.eaten), sub: `UR ${byR.UR} · SEC ${byR.SEC}` },
  ]}
/>
<GuideBar {hints} />

<style>
  .stage {
    flex: 1;
    min-height: 0;
    display: grid;
    place-items: center;
  }
  .bag {
    width: 58%;
    aspect-ratio: 5 / 8;
    background: #9aa0a8;
  }
  .bag.empty {
    filter: brightness(.35);
  }
  .bag__ph {
    font: 700 3rem/1 var(--latin-condensed);
    color: #0e0e0e;
  }
</style>
