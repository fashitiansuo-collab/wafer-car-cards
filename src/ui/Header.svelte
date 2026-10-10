<script lang="ts">
  import type { Game, Screen } from '../state/game.svelte';
  import { STOCK_MAX, msToNext } from '../lib/refill';
  import Icon from './Icon.svelte';

  let { game, now, secret = false }: { game: Game; now: number; secret?: boolean } = $props();

  const tabs: { screen: Screen; label: string; icon: 'wafer' | 'garage' | 'records' }[] = [
    { screen: 'home', label: '開封', icon: 'wafer' },
    { screen: 'garage', label: 'ガレージ', icon: 'garage' },
    { screen: 'records', label: '記録', icon: 'records' },
  ];
  const tabOf = (s: Screen): Screen =>
    s === 'opening' || s === 'result' ? 'home' : s === 'detail' ? 'garage' : s;

  const left = $derived(msToNext(game.save.stock, game.save.lastRefillAt, now));
  const clock = $derived(left == null ? 'FULL' : formatLeft(left));
  const busy = $derived(game.screen === 'opening');

  function formatLeft(ms: number) {
    const s = Math.ceil(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
</script>

<header class="header">
  <div class="logo"><Icon name="mark" size="2.8rem" /></div>
  <nav class="tabs">
    {#each tabs as tab (tab.screen)}
      <button
        class="tab"
        class:on={tabOf(game.screen) === tab.screen}
        disabled={busy}
        onclick={() => (game.screen = tab.screen)}
      >
        <Icon name={tab.icon} size="2rem" />
        <span>{tab.label}</span>
      </button>
    {/each}
  </nav>
  <div class="status">
    {#if secret}<span class="secret">SECRET</span>{/if}
    <span class="stock"><b>{String(game.save.stock).padStart(2, '0')}</b>/{STOCK_MAX}</span>
    <span class="clock" aria-label="次の袋まで">{clock}</span>
  </div>
</header>

<style>
  .header {
    flex: none;
    height: var(--module);
    display: flex;
    align-items: stretch;
    background: var(--bar);
    border-bottom: 1px solid var(--line);
    position: relative;
    z-index: 5;
  }
  .logo {
    width: var(--module);
    display: grid;
    place-items: center;
    color: var(--paper);
    border-right: 1px solid var(--line);
  }
  .tabs {
    display: flex;
    flex: 1;
    min-width: 0;
  }
  .tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: .4rem;
    color: var(--paper-2);
    font: 500 1rem/1 var(--latin), var(--jp);
    transition:
      background-color var(--t-focus) var(--ease-standard),
      color var(--t-focus) var(--ease-standard);
  }
  .tab.on {
    background: var(--sel-fill);
    color: #0e0e0e;
  }
  .tab:not(.on):hover:not(:disabled) {
    color: var(--paper);
  }
  .tab:disabled {
    cursor: default;
  }
  .tab:focus-visible {
    outline: 1px solid var(--sel-frame);
    outline-offset: -3px;
  }
  .status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: .3rem;
    padding: 0 1.4rem;
    border-left: 1px solid var(--line);
    min-width: 8.4rem;
    position: relative;
  }
  .stock {
    font: 400 1.3rem/1 var(--latin);
    font-variant-numeric: tabular-nums;
    color: var(--paper-2);
  }
  .stock b {
    font: 500 2.1rem/1 var(--latin);
    color: var(--paper);
  }
  .clock {
    font: 500 1.15rem/1 var(--latin);
    font-variant-numeric: tabular-nums;
    color: var(--paper-2);
    letter-spacing: .04em;
  }
  .secret {
    position: absolute;
    right: calc(100% + .8rem);
    top: 50%;
    translate: 0 -50%;
    font: 600 1.1rem/1 var(--latin-condensed);
    letter-spacing: .14em;
    color: #0e0e0e;
    background: var(--yellow);
    padding: .4rem .6rem;
  }
</style>
