<script lang="ts" module>
  export interface Hint {
    keys: string;
    label: string;
    onclick?: () => void;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  let { hints, dim = false }: { hints: Hint[]; dim?: boolean } = $props();
</script>

<!-- The bottom line of key glyphs and verbs: only what can be done next. -->
<nav class="guide" class:dim>
  {#each hints as hint (hint.label)}
    {#if hint.onclick}
      <button class="item" disabled={hint.disabled} onclick={hint.onclick}>
        <span class="keys">{hint.keys}</span>{hint.label}
      </button>
    {:else}
      <span class="item"><span class="keys">{hint.keys}</span>{hint.label}</span>
    {/if}
  {/each}
</nav>

<style>
  .guide {
    flex: none;
    height: 4.4rem;
    display: flex;
    align-items: center;
    gap: 2.4rem;
    padding: 0 var(--inset);
    background: var(--bar);
    border-top: 1px solid var(--line);
    transition: opacity var(--t-page) var(--ease-standard);
  }
  .guide.dim {
    opacity: .15;
  }
  .item {
    display: inline-flex;
    align-items: center;
    gap: .8rem;
    font: 500 1.15rem/1 var(--latin), var(--jp);
    color: var(--paper-2);
    white-space: nowrap;
  }
  button.item:hover:not(:disabled) {
    color: var(--paper);
  }
  button.item:disabled {
    opacity: .4;
    cursor: default;
  }
  button.item:focus-visible {
    outline: 1px solid var(--sel-frame);
    outline-offset: .4rem;
  }
  .keys {
    font: 500 1.3rem/1 var(--latin);
    color: var(--paper);
  }
</style>
