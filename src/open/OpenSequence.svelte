<script lang="ts">
  import { untrack } from 'svelte';
  import type { Game } from '../state/game.svelte';
  import { createTilt } from '../lib/tilt.svelte';
  import CardView from '../cards/Card.svelte';
  import BottomStrip from '../ui/BottomStrip.svelte';
  import GuideBar, { type Hint } from '../ui/GuideBar.svelte';
  import Wafer from './Wafer.svelte';
  import { omen } from './bite';
  import { isGlobalKey } from '../lib/keys';

  let { game, total }: { game: Game; total: number } = $props();

  type Stage = 'bag' | 'wafer' | 'black' | 'flip' | 'done';
  // The card is fixed for the life of this sequence.
  const card = untrack(() => game.current!);
  const rarity = card.rarity;
  const sparkle = untrack(() => game.pity) || omen(rarity, Math.random);
  const FLIP_MS: Record<string, number> = { C: 500, UC: 500, R: 700, UR: 1200, SEC: 1400 };

  const tilt = createTilt();
  let stage = $state<Stage>('bag');
  let flipped = $state(true);
  let wafer: Wafer | undefined = $state();
  const timers: ReturnType<typeof setTimeout>[] = [];
  const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

  $effect(() => {
    later(520, () => {
      if (stage === 'bag') stage = 'wafer';
    });
    return () => timers.forEach(clearTimeout);
  });

  /** A sweep of light across the card: drives the tilt from one side to the other. */
  function sweep(ms: number) {
    tilt.set(0.05, 0.35, 1);
    later(60, () => tilt.set(0.95, 0.65, 1));
    later(ms, () => tilt.release());
  }

  function reveal() {
    if (stage === 'flip' || stage === 'black' || stage === 'done') return;
    if (rarity === 'SEC') {
      stage = 'black';
      later(900, flip);
    } else {
      flip();
    }
  }

  function flip() {
    stage = 'flip';
    flipped = false;
    const ms = FLIP_MS[rarity];
    if (rarity !== 'C' && rarity !== 'UC') later(ms * 0.6, () => sweep(ms));
    later(ms + (rarity === 'C' || rarity === 'UC' ? 150 : 700), () => {
      stage = 'done';
      game.finishOpening();
    });
  }

  function onkey(e: KeyboardEvent) {
    if (stage !== 'wafer' || !isGlobalKey(e)) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      wafer?.bite();
    }
  }

  // Counted before this card, so the strip does not give the draw away either.
  const owned = untrack(() => game.ownedCount(game.series) - (game.isNew ? 1 : 0));
  const dim = $derived((rarity === 'UR' || rarity === 'SEC') && (stage === 'flip' || stage === 'black'));
  const hints: Hint[] = $derived(
    stage === 'wafer' || stage === 'bag'
      ? [
          { keys: '⏎', label: 'タップしてかじる' },
          { keys: '»', label: 'スキップ', onclick: reveal },
        ]
      : [{ keys: '…', label: 'めくっています' }],
  );
</script>

<svelte:window onkeydown={onkey} />

<div class="stage" class:black={stage === 'black' || (stage === 'flip' && rarity === 'SEC')}>
  <div class="slot" style="--flip-ms:{FLIP_MS[rarity]}ms">
    <div class="card-holder" class:flipping={stage === 'flip'} class:edge={stage === 'black'}>
      <CardView {card} {total} {flipped} {tilt} interactive={false} plainBack />
    </div>
    {#if stage === 'bag'}
      <div class="bag-out" aria-hidden="true"></div>
    {/if}
    {#if stage === 'bag' || stage === 'wafer'}
      <Wafer bind:this={wafer} flavor={card.series === 2 ? 'choco' : 'vanilla'} {sparkle} onEaten={reveal} />
    {/if}
  </div>
  <div class="lockup-space"></div>
</div>

<BottomStrip
  {dim}
  cells={[
    { title: `図鑑 ${owned} / ${total}`, value: `${Math.round((owned / total) * 100)}%`, progress: owned / total },
    { title: '食べた数', value: String(game.save.eaten) },
  ]}
/>
<GuideBar {hints} {dim} />

<style>
  .stage {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-rows: 1fr auto;
    justify-items: center;
    align-items: center;
    position: relative;
  }
  /* SEC: the room goes almost black before the card turns. */
  .stage::before {
    content: '';
    position: fixed;
    inset: 0;
    background: #000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 400ms var(--ease-standard);
    z-index: 1;
  }
  .stage.black::before {
    opacity: .92;
  }
  .slot {
    position: relative;
    width: 70%;
    z-index: 2;
  }
  .card-holder :global(.card__rotator) {
    transition: none;
  }
  .card-holder.flipping :global(.card__rotator) {
    transition: transform var(--flip-ms) cubic-bezier(.2, .7, .2, 1);
  }
  /* SEC: only the gold rim shows first. */
  .card-holder.edge {
    outline: 2px solid #e3c063;
    outline-offset: -1px;
    border-radius: 2.4cqw;
    animation: rim 900ms ease-in-out;
  }
  @keyframes rim {
    from {
      outline-color: transparent;
    }
  }
  .bag-out {
    position: absolute;
    inset: -6% -8% -40%;
    background: linear-gradient(100deg, #9aa0a8, #e7eaee 40%, #8d939c 70%, #c9ced6);
    animation: bag-out 520ms cubic-bezier(.4, 0, 1, 1) forwards;
    z-index: 3;
  }
  @keyframes bag-out {
    to {
      transform: translateY(120%);
      opacity: 0;
    }
  }
  .lockup-space {
    height: 10.4rem;
  }
  @media (prefers-reduced-motion: reduce) {
    .bag-out {
      animation-duration: 1ms;
    }
  }
</style>
