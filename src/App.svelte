<script lang="ts">
  import cardsJson from './data/cards.json';
  import type { Card } from './lib/types';
  import { createGame } from './state/game.svelte';
  import Header from './ui/Header.svelte';
  import Home from './screens/Home.svelte';
  import DebugGallery from './screens/DebugGallery.svelte';

  const cards = cardsJson as Card[];
  const debug = new URLSearchParams(location.search).has('debug');

  function storage(): Storage | null {
    try {
      const s = window.localStorage;
      s.getItem('probe');
      return s;
    } catch {
      return null;
    }
  }

  const game = createGame({ cards, storage: storage(), now: () => Date.now(), rng: Math.random });
  let now = $state(Date.now());

  $effect(() => {
    const id = setInterval(() => {
      now = Date.now();
      game.tick();
    }, 1000);
    return () => clearInterval(id);
  });

  const secret = $derived(
    (game.screen === 'opening' || game.screen === 'result') && game.current?.rarity === 'SEC',
  );
</script>

<div class="device">
  {#if debug}
    <DebugGallery {cards} />
  {:else}
    <Header {game} {now} {secret} />
    <main class="main">
      {#if game.screen === 'home'}
        <Home {game} {cards} {now} />
      {/if}
    </main>
  {/if}
</div>

<style>
  .main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    position: relative;
  }
</style>
