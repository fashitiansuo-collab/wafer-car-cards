<script lang="ts">
  import type { Card } from '../lib/types';
  import type { Game } from '../state/game.svelte';
  import CardView from '../cards/Card.svelte';
  import BottomStrip from '../ui/BottomStrip.svelte';
  import GuideBar, { type Hint } from '../ui/GuideBar.svelte';
  import TitleLockup from '../ui/TitleLockup.svelte';
  import { isGlobalKey } from '../lib/keys';

  let { game, cards }: { game: Game; cards: Card[] } = $props();
  // RSEC cards are hidden extras, outside the numbered set.
  const total = $derived(cards.filter((c) => c.rarity !== 'RSEC').length);

  const card = $derived(game.current!);
  const count = $derived(game.save.owned[card.id] ?? 1);
  // RSEC: a common until its corner is peeled; then the name and rarity change with it.
  const peeled = $derived(card.rarity !== 'RSEC' || game.isPeeled(card.id));
  const shown = $derived(peeled ? { model: card.model, rarity: card.rarity } : { model: card.stock?.model ?? card.model, rarity: 'C' as const });
  const owned = $derived(game.ownedCount(game.series));
  const empty = $derived(game.save.stock <= 0);

  const hints: Hint[] = $derived([
    { keys: '⏎', label: empty ? '袋がありません' : 'もう一袋', onclick: () => (game.screen = 'home'), disabled: empty },
    { keys: '▦', label: 'ガレージへ', onclick: () => (game.screen = 'garage') },
  ]);

  // Presses meant for the last bite must not dismiss the card before it has been seen.
  const shownAt = performance.now();

  function onkey(e: KeyboardEvent) {
    if (e.key !== 'Enter' || empty || !isGlobalKey(e)) return;
    if (performance.now() - shownAt < 600) return;
    game.screen = 'home';
  }
</script>

<svelte:window onkeydown={onkey} />

<div class="stage">
  <div class="slot">
    <CardView {card} total={total} firstPulledAt={game.save.firstPulledAt[card.id]} moment peeled={game.isPeeled(card.id)} canPeel onPeel={() => game.peel(card.id)} />
  </div>
  <div class="lockup">
    <TitleLockup maker={card.maker} model={shown.model} year={card.year} rarity={shown.rarity} />
    <span class="tag" class:new={game.isNew}>{game.isNew ? 'NEW' : `×${count}`}</span>
  </div>
</div>

<BottomStrip
  cells={[
    { title: `図鑑 ${owned} / ${total}`, value: `${Math.round((owned / total) * 100)}%`, progress: owned / total },
    { title: '食べた数', value: String(game.save.eaten) },
  ]}
/>
<GuideBar {hints} />

<style>
  .stage {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-rows: 1fr auto;
    justify-items: center;
    align-items: center;
  }
  .slot {
    width: 70%;
  }
  .lockup {
    height: 10.4rem;
    width: 100%;
    padding: 0 var(--inset);
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.2rem;
    padding-bottom: 1.4rem;
    animation: rise var(--t-page) var(--ease-standard) both;
  }
  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(var(--shift));
    }
  }
  .tag {
    flex: none;
    font: 600 1.3rem/1 var(--latin-condensed);
    letter-spacing: .12em;
    padding: .5rem .7rem;
    border: 1px solid var(--line-2);
    color: var(--paper-2);
  }
  .tag.new {
    background: var(--sel-fill);
    border-color: var(--sel-fill);
    color: #0e0e0e;
  }
</style>
