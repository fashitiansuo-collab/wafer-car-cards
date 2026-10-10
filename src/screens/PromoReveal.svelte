<script lang="ts">
  import { untrack } from 'svelte';
  import { promos, specials } from '../cards/special';
  import GuideBar, { type Hint } from '../ui/GuideBar.svelte';
  import { isGlobalKey } from '../lib/keys';

  let { id, isNew, onDone }: { id: string; isNew: boolean; onDone: () => void } = $props();

  // Fixed for the life of this reveal.
  const promo = untrack(() => promos.find((p) => p.id === id)!);
  const Special = specials[promo.id];

  // Shared SEC entrance (black → gold rim → turn), then this card's own moment (the wink).
  type Stage = 'black' | 'rim' | 'flip' | 'done';
  let stage = $state<Stage>('black');
  const timers: ReturnType<typeof setTimeout>[] = [];
  $effect(() => {
    timers.push(setTimeout(() => (stage = 'rim'), 450));
    timers.push(setTimeout(() => (stage = 'flip'), 1350));
    timers.push(setTimeout(() => (stage = 'done'), 2750));
    return () => timers.forEach(clearTimeout);
  });

  const hints: Hint[] = $derived(
    stage === 'done' ? [{ keys: '⏎', label: 'ガレージへ', onclick: onDone }] : [{ keys: '…', label: 'めくっています' }],
  );
  function onkey(e: KeyboardEvent) {
    if (stage === 'done' && e.key === 'Enter' && isGlobalKey(e)) onDone();
  }
</script>

<svelte:window onkeydown={onkey} />

<div class="stage" class:black={stage !== 'done'}>
  <div class="slot" class:rim={stage === 'rim'} class:turning={stage === 'flip'}>
    <Special {promo} flipped={stage === 'black' || stage === 'rim'} wink={stage === 'done'} interactive={stage === 'done'} />
  </div>
  <div class="lockup" class:show={stage === 'done'}>
    <p class="kicker">PROMOTION CARD · {promo.code}</p>
    <h1>{promo.model} <small>({promo.generation})</small></h1>
    <span class="tag" class:new={isNew}>{isNew ? 'NEW' : '受け取り済み'}</span>
  </div>
</div>
<GuideBar {hints} />

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
    width: 72%;
    z-index: 2;
  }
  .slot :global(.card__rotator) {
    transition: none;
  }
  .slot.turning :global(.card__rotator) {
    transition: transform 1400ms cubic-bezier(.2, .7, .2, 1);
  }
  .slot.rim {
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
  .lockup {
    width: 100%;
    height: 10.4rem;
    padding: 0 var(--inset) 1.4rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: .5rem;
    opacity: 0;
    transform: translateY(var(--shift));
    transition: opacity var(--t-page) var(--ease-standard), transform var(--t-page) var(--ease-standard);
  }
  .lockup.show {
    opacity: 1;
    transform: none;
  }
  .kicker {
    margin: 0;
    font: 600 1.3rem/1 var(--latin-condensed);
    letter-spacing: .12em;
    color: var(--yellow);
  }
  h1 {
    margin: 0;
    font: 700 4rem/.95 var(--latin-condensed);
    text-transform: uppercase;
  }
  h1 small {
    font-size: .5em;
    color: var(--paper-2);
  }
  .tag {
    align-self: flex-start;
    font: 600 1.2rem/1 var(--latin-condensed);
    letter-spacing: .12em;
    padding: .5rem .7rem;
    border: 1px solid var(--line-2);
    color: var(--paper-2);
  }
  .tag.new {
    background: var(--sel-fill);
    color: #0e0e0e;
  }
  @media (prefers-reduced-motion: reduce) {
    .slot.turning :global(.card__rotator) {
      transition: none;
    }
  }
</style>
