<script lang="ts">
  import type { Rarity } from '../lib/types';
  let { rarity }: { rarity: Rarity } = $props();
</script>

<span class="tag" data-rarity={rarity}>{rarity}</span>

<style>
  .tag {
    display: inline-block;
    font: 600 1.2rem/1 var(--latin-condensed);
    letter-spacing: .1em;
    color: var(--paper);
    padding-left: .6rem;
    border-left: .3rem solid var(--paper-2);
  }
  .tag[data-rarity='UC'] { border-color: var(--green); }
  .tag[data-rarity='R'] { border-color: var(--blue); }
  .tag[data-rarity='UR'] {
    border-image: var(--rainbow-v) 1;
  }
  .tag[data-rarity='SEC'] { border-color: var(--yellow); }
</style>
