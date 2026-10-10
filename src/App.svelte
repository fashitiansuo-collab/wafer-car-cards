<script lang="ts">
  import cardsJson from './data/cards.json';
  import type { Card } from './lib/types';
  import { createGame } from './state/game.svelte';
  import Header from './ui/Header.svelte';
  import Home from './screens/Home.svelte';
  import Result from './screens/Result.svelte';
  import Garage from './screens/Garage.svelte';
  import Detail from './screens/Detail.svelte';
  import Records from './screens/Records.svelte';
  import OpenSequence from './open/OpenSequence.svelte';
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
  // ?force=SEC fixes the rarity of the next draws (same switch as on the records screen).
  const force = new URLSearchParams(location.search).get('force');
  if (force && ['C', 'UC', 'R', 'UR', 'SEC'].includes(force)) game.forced = force as Card['rarity'];

  $effect(() => {
    const id = setInterval(() => {
      now = Date.now();
      game.tick();
    }, 1000);
    return () => clearInterval(id);
  });

  // Shown once the card has turned, never before: the header must not give the draw away.
  const secret = $derived(game.screen === 'result' && game.current?.rarity === 'SEC');
</script>

<div class="device">
  {#if debug}
    <DebugGallery {cards} />
  {:else}
    <Header {game} {now} {secret} />
    <main class="main">
      {#if game.screen === 'home'}
        <Home {game} {cards} {now} />
      {:else if game.screen === 'opening' && game.current}
        {#key game.save.eaten}
          <OpenSequence {game} total={cards.length} />
        {/key}
      {:else if game.screen === 'result' && game.current}
        <Result {game} {cards} />
      {:else if game.screen === 'garage'}
        <Garage {game} {cards} />
      {:else if game.screen === 'detail'}
        <Detail {game} {cards} />
      {:else if game.screen === 'records'}
        <Records {game} {cards} />
      {:else}
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
