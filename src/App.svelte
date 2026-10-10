<script lang="ts">
  import cardsJson from './data/cards.json';
  import type { Card } from './lib/types';
  import DebugGallery from './screens/DebugGallery.svelte';

  const cards = cardsJson as Card[];
  const debug = new URLSearchParams(location.search).has('debug');
</script>

<div class="device">
  {#if debug}
    <DebugGallery {cards} />
  {/if}
</div>
