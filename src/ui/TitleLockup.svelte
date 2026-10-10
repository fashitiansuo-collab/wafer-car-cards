<script lang="ts">
  import type { Rarity } from '../lib/types';
  import RarityTag from './RarityTag.svelte';

  let { maker, model, year, rarity }: { maker: string; model: string; year: number; rarity: Rarity } = $props();
</script>

<!-- Maker small, name huge, year small. -->
<hgroup class="lockup">
  <p class="maker">{maker}</p>
  <h1 class="model">{model}</h1>
  <p class="meta"><span>{year}</span><RarityTag {rarity} /></p>
</hgroup>

<style>
  .lockup {
    margin: 0;
    display: grid;
    gap: .4rem;
    min-width: 0;
  }
  p,
  h1 {
    margin: 0;
  }
  .maker {
    font: 600 1.5rem/1.1 var(--latin-condensed);
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--paper-2);
  }
  .model {
    font: 700 4.4rem/.95 var(--latin-condensed), var(--jp);
    text-transform: uppercase;
    letter-spacing: .02em;
    color: var(--paper);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .meta {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    font: 600 1.5rem/1 var(--latin-condensed);
    color: var(--paper-2);
  }
</style>
