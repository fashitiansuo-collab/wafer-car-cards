<script lang="ts">
  import cardsJson from './data/cards.json';
  import type { Card } from './lib/types';
  import { createGame } from './state/game.svelte';
  import { SAVE_KEY } from './lib/save';
  import Header from './ui/Header.svelte';
  import Home from './screens/Home.svelte';
  import Result from './screens/Result.svelte';
  import Garage from './screens/Garage.svelte';
  import Detail from './screens/Detail.svelte';
  import Records from './screens/Records.svelte';
  import OpenSequence from './open/OpenSequence.svelte';
  import DebugGallery from './screens/DebugGallery.svelte';
  import PromoReveal from './screens/PromoReveal.svelte';
  import { promos } from './cards/special';
  import { redeem } from './lib/promo';

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

  // Promo cards: ?promo=<code> or the code box on the records screen.
  let reveal = $state<{ id: string; isNew: boolean } | null>(null);

  async function claim(code: string): Promise<boolean> {
    const id = await redeem(code, promos);
    if (!id) return false;
    reveal = { id, isNew: game.grantPromo(id) };
    return true;
  }

  const urlCode = new URLSearchParams(location.search).get('promo');
  if (urlCode && !debug) {
    // Drop the code from the address bar so a reload or a shared screenshot does not carry it.
    const u = new URL(location.href);
    u.searchParams.delete('promo');
    history.replaceState(null, '', u);
    if (game.screen !== 'opening') void claim(urlCode);
  }

  // Another tab saved: take its progress instead of overwriting it later.
  function onStorage(e: StorageEvent) {
    if (e.key === SAVE_KEY && game.screen !== 'opening') game.reload();
  }

  // Shown once the card has turned, never before: the header must not give the draw away.
  const secret = $derived(game.screen === 'result' && game.current?.rarity === 'SEC');
</script>

<svelte:window onstorage={onStorage} />

<div class="device">
  {#if debug}
    <DebugGallery {cards} />
  {:else}
    <Header {game} {now} {secret} />
    <main class="main">
      {#if reveal}
        <PromoReveal
          id={reveal.id}
          isNew={reveal.isNew}
          onDone={() => {
            reveal = null;
            game.screen = 'garage';
          }}
        />
      {:else if game.screen === 'home'}
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
        <Records {game} {cards} {claim} />
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
