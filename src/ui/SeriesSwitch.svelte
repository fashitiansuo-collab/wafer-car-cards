<script lang="ts">
  import type { Game } from '../state/game.svelte';
  import { SERIES, type SeriesId } from '../lib/types';

  let { game }: { game: Game } = $props();

  const NAMES: Record<SeriesId, string> = { 1: 'VANILLA', 2: 'CHOCOLATE' };

  function pick(s: SeriesId) {
    if (s !== game.series && game.seriesCount(s) > 0) game.series = s;
  }
</script>

<!-- Which bag is on the table: series 1 (vanilla) or 2 (chocolate). Bags in stock are shared. -->
<nav class="series" aria-label="弾">
  {#each SERIES as s (s)}
    <button
      class="tab"
      class:on={game.series === s}
      data-series={s}
      disabled={game.seriesCount(s) === 0}
      aria-pressed={game.series === s}
      onclick={() => pick(s)}
    >
      <span class="no">0{s}</span>{NAMES[s]}
    </button>
  {/each}
</nav>

<style>
  .series {
    flex: none;
    display: flex;
    padding: 1.2rem var(--inset) 0;
  }
  .tab {
    flex: 1;
    display: inline-flex;
    justify-content: center;
    align-items: baseline;
    gap: .8rem;
    padding: 1rem 0 .9rem;
    font: 600 1.3rem/1 var(--latin-condensed);
    letter-spacing: .1em;
    color: var(--paper-2);
    border-bottom: 2px solid var(--line);
    transition: color var(--t-focus) var(--ease-standard);
  }
  .no {
    font: 500 1.1rem/1 var(--mono);
    letter-spacing: 0;
    opacity: .7;
  }
  .tab.on {
    color: var(--paper);
    border-bottom-color: #e8cf9c;
  }
  .tab.on[data-series='2'] {
    border-bottom-color: #a8673d;
  }
  .tab:disabled {
    opacity: .35;
    cursor: default;
  }
  .tab:focus-visible {
    outline: 1px solid var(--sel-frame);
    outline-offset: -2px;
  }
</style>
