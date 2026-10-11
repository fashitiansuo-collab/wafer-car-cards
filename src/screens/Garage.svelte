<script lang="ts">
  import type { Card, Rarity } from '../lib/types';
  import { RARITIES } from '../lib/types';
  import type { Game } from '../state/game.svelte';
  import BottomStrip from '../ui/BottomStrip.svelte';
  import GuideBar, { type Hint } from '../ui/GuideBar.svelte';
  import Brackets from '../ui/Brackets.svelte';
  import { promos } from '../cards/special';

  let { game, cards }: { game: Game; cards: Card[] } = $props();

  let filter = $state<Rarity | 'ALL'>('ALL');
  let focus = $state<string | null>(null);

  const shown = $derived(filter === 'ALL' ? cards : cards.filter((c) => c.rarity === filter));
  const has = (c: Card) => (game.save.owned[c.id] ?? 0) > 0;
  const owned = $derived(game.ownedCount(game.series));
  const byR = $derived(game.countByRarity(game.series));
  const totalOf = (r: Rarity) => cards.filter((c) => c.rarity === r).length;
  const focused = $derived(cards.find((c) => c.id === focus) ?? null);

  // Touch: first tap focuses (the guide line says what it is), second tap opens.
  function pick(c: Card) {
    if (!has(c)) {
      focus = c.id;
      return;
    }
    if (focus === c.id) open(c);
    else focus = c.id;
  }
  function open(c: Card) {
    game.detailId = c.id;
    game.screen = 'detail';
  }

  const hints: Hint[] = $derived(
    focused && has(focused)
      ? [{ keys: '⏎', label: '開く', onclick: () => open(focused) }]
      : focused
        ? [{ keys: '·', label: `No.${String(focused.no).padStart(3, '0')} はまだ出ていません` }]
        : [{ keys: '⇥', label: 'カードを選ぶ' }],
  );
  const ownedPromos = $derived(promos.filter((p) => (game.save.owned[p.id] ?? 0) > 0));
</script>

<nav class="filters">
  {#each ['ALL', ...RARITIES] as r (r)}
    <button class="filter" class:on={filter === r} data-rarity={r} onclick={() => (filter = r as Rarity | 'ALL')}>
      {r}
    </button>
  {/each}
</nav>

<div class="grid-wrap">
  {#if ownedPromos.length && filter === 'ALL'}
    <p class="row-label">PROMO</p>
    <div class="grid promo-row">
      {#each ownedPromos as p (p.id)}
        <button
          class="tile promo"
          onclick={() => {
            game.detailId = p.id;
            game.screen = 'detail';
          }}
        >
          <img src={p.image} alt="" />
          <span class="name">{p.model}</span>
          <span class="no">{p.code}</span>
        </button>
      {/each}
    </div>
    <p class="row-label">SERIES {game.series}</p>
  {/if}
  <div class="grid">
    {#each shown as c (c.id)}
      <button class="tile" class:locked={!has(c)} data-rarity={c.rarity} onclick={() => pick(c)} onfocus={(e) => {
          if (e.currentTarget.matches(':focus-visible')) focus = c.id;
        }}>
        {#if has(c)}
          <img src={c.image} alt="" style="object-position:{c.focus ?? '50% 50%'}" loading="lazy" />
          <span class="name">{c.model}</span>
          {#if (game.save.owned[c.id] ?? 0) > 1}<span class="count">×{game.save.owned[c.id]}</span>{/if}
        {:else}
          <span class="unknown">???</span>
        {/if}
        <span class="no">{String(c.no).padStart(3, '0')}</span>
        {#if focus === c.id}<Brackets />{/if}
      </button>
    {/each}
  </div>
</div>

<BottomStrip
  cells={[
    { title: `図鑑 ${owned} / ${cards.length}`, value: `${Math.round((owned / cards.length) * 100)}%`, progress: owned / cards.length },
    {
      title: filter === 'ALL' ? 'レア別' : `${filter} の所持`,
      value: filter === 'ALL' ? `${byR.UR + byR.SEC}` : `${byR[filter]} / ${totalOf(filter)}`,
      sub: filter === 'ALL' ? `UR+SEC · R ${byR.R} · UC ${byR.UC} · C ${byR.C}` : undefined,
    },
  ]}
/>
<GuideBar {hints} />

<style>
  .filters {
    flex: none;
    display: flex;
    gap: 0;
    padding: 1.2rem var(--inset) 0;
  }
  .filter {
    flex: 1;
    padding: 1rem 0 .9rem;
    font: 600 1.3rem/1 var(--latin-condensed);
    letter-spacing: .1em;
    color: var(--paper-2);
    border-bottom: 2px solid var(--line);
    transition: color var(--t-focus) var(--ease-standard);
  }
  .filter.on {
    color: var(--paper);
    border-bottom-color: var(--paper);
  }
  .filter.on[data-rarity='UC'] { border-bottom-color: var(--green); }
  .filter.on[data-rarity='R'] { border-bottom-color: var(--blue); }
  .filter.on[data-rarity='UR'] { border-image: var(--rainbow) 1; }
  .filter.on[data-rarity='SEC'] { border-bottom-color: var(--yellow); }
  .filter:focus-visible {
    outline: 1px solid var(--sel-frame);
    outline-offset: -2px;
  }

  .grid-wrap {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 1.6rem var(--inset);
    scrollbar-width: thin;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.2rem;
  }
  .row-label {
    margin: 0 0 .8rem;
    font: 600 1.2rem/1 var(--latin-condensed);
    letter-spacing: .14em;
    color: var(--paper-2);
  }
  .promo-row {
    margin-bottom: 1.8rem;
  }
  .tile.promo {
    background: #f1ebdf;
    border-left-color: var(--yellow);
  }
  .tile.promo img {
    object-fit: contain;
    object-position: 30% 60%;
    transform: scale(1.5) translateX(-8%);
  }
  .tile.promo .name {
    color: #151515;
  }
  .tile.promo .no {
    color: rgba(21, 21, 21, .6);
  }
  .tile {
    position: relative;
    aspect-ratio: 63 / 88;
    background: var(--ink-2);
    border-left: .3rem solid var(--paper-3);
    overflow: visible;
    text-align: left;
  }
  .tile[data-rarity='UC'] { border-left-color: var(--green); }
  .tile[data-rarity='R'] { border-left-color: var(--blue); }
  .tile[data-rarity='UR']:not(.locked) { border-image: var(--rainbow-v) 1; }
  .tile[data-rarity='SEC'] { border-left-color: var(--yellow); }
  .tile.locked {
    border-left-color: var(--line-2);
    background: var(--ink-0);
  }
  .tile:focus-visible {
    outline: none;
  }
  .tile img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 72%;
    object-fit: cover;
    transition: filter var(--t-focus) var(--ease-standard);
  }
  .tile:hover img {
    filter: brightness(1.08);
  }
  .name {
    position: absolute;
    left: .8rem;
    right: .6rem;
    bottom: 2.6rem;
    font: 700 1.3rem/1 var(--latin-condensed), var(--jp);
    text-transform: uppercase;
    color: var(--paper);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .no {
    position: absolute;
    left: .8rem;
    bottom: .9rem;
    font: 400 1rem/1 var(--latin);
    font-variant-numeric: tabular-nums;
    letter-spacing: .08em;
    color: var(--paper-2);
  }
  .count {
    position: absolute;
    right: .6rem;
    bottom: .9rem;
    font: 500 1rem/1 var(--latin);
    color: var(--paper-2);
  }
  .unknown {
    position: absolute;
    inset: 0 0 30%;
    display: grid;
    place-items: center;
    font: 700 2rem/1 var(--latin-condensed);
    letter-spacing: .1em;
    color: var(--line-2);
  }
</style>
