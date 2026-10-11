<script lang="ts">
  import type { Card } from '../lib/types';
  import type { Game } from '../state/game.svelte';
  import { KCAL_GOAL } from '../lib/kcal';
  import { msToNext } from '../lib/refill';
  import BottomStrip from '../ui/BottomStrip.svelte';
  import GuideBar, { type Hint } from '../ui/GuideBar.svelte';
  import Bag from '../open/Bag.svelte';
  import SeriesSwitch from '../ui/SeriesSwitch.svelte';
  import { isGlobalKey } from '../lib/keys';

  let { game, cards, now }: { game: Game; cards: Card[]; now: number } = $props();

  const owned = $derived(game.ownedCount(game.series));
  const byR = $derived(game.countByRarity(game.series));
  const empty = $derived(game.save.stock <= 0);
  const left = $derived(msToNext(game.save.stock, game.save.lastRefillAt, now) ?? 0);
  const leftText = $derived(`${Math.floor(Math.ceil(left / 1000) / 60)}:${String(Math.ceil(left / 1000) % 60).padStart(2, '0')}`);
  const kcal = $derived(game.kcal(game.series));
  const goal = $derived(KCAL_GOAL[game.series]);
  const ready = $derived(game.canPity(game.series));

  let bag: Bag | undefined = $state();
  // The ★ button swaps the normal bag for the high-rare guaranteed pack.
  let premium = $state(false);
  const bagDisabled = $derived(empty && !premium);
  const pityHint: Hint = $derived({
    keys: '★',
    label: premium ? '通常の袋に戻す' : 'ハイレア確定パック',
    onclick: () => (premium = !premium),
  });

  // The pity pack belongs to the selected series: switching series drops back to the normal bag.
  $effect(() => {
    void game.series;
    premium = false;
  });

  const hints: Hint[] = $derived(
    empty && !premium
      ? [
          { keys: '◷', label: `次の袋まで ${leftText}` },
          ...(ready ? [pityHint] : []),
        ]
      : [
          { keys: '⇆', label: '上端をなぞって破る' },
          { keys: '⏎', label: '破る', onclick: () => bag?.autoTear() },
          ...(ready ? [pityHint] : []),
        ],
  );

  function onkey(e: KeyboardEvent) {
    if (!isGlobalKey(e)) return;
    if (e.key === 'Enter' && !bagDisabled) bag?.autoTear();
    // ← → pick the other series' bag.
    const s = e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowRight' ? 2 : null;
    if (s && game.seriesCount(s) > 0) game.series = s;
  }
</script>

<svelte:window onkeydown={onkey} />

<SeriesSwitch {game} />
<div class="stage">
  {#key game.series}
    <Bag
      bind:this={bag}
      series={game.series}
      premium={premium}
      disabled={bagDisabled}
      onTorn={() => {
        if (premium) game.startPity();
        else game.startOpening();
      }}
    />
  {/key}
</div>

<BottomStrip
  cells={[
    {
      title: `図鑑 ${owned} / ${cards.length}`,
      value: `${Math.round((owned / cards.length) * 100)}%`,
      sub: `食べた ${game.save.eaten} ・ UR ${byR.UR} · SEC ${byR.SEC}`,
      progress: owned / cards.length,
    },
    {
      title: 'カロリー',
      value: `${kcal} kcal`,
      sub: ready ? 'ハイレア確定パックをむけます' : `ハイレア確定まで ${Math.max(0, goal - kcal)} kcal`,
      progress: Math.min(1, kcal / goal),
    },
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
</style>
