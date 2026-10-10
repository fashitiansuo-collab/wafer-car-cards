<script lang="ts" module>
  export interface Cell {
    title: string;
    value: string;
    sub?: string;
    progress?: number;
  }
</script>

<script lang="ts">
  let { cells, dim = false }: { cells: Cell[]; dim?: boolean } = $props();
</script>

<!-- Two cells floating a little inside the screen edges, a hairline between. Value first, label under it. -->
<section class="strip" class:dim>
  {#each cells as cell (cell.title)}
    <div class="cell">
      <span class="value">{cell.value}</span>
      <span class="title">{cell.title}</span>
      {#if cell.sub}<span class="sub">{cell.sub}</span>{/if}
      {#if cell.progress != null}
        <span class="progress" style="--p:{Math.max(0, Math.min(1, cell.progress))}"></span>
      {/if}
    </div>
  {/each}
</section>

<style>
  .strip {
    flex: none;
    margin: 0 var(--inset) 1.2rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    background: var(--ink-2);
    transition: opacity var(--t-page) var(--ease-standard);
  }
  .strip.dim {
    opacity: .1;
  }
  .cell {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    min-width: 0;
    padding: 1.4rem 1.4rem 1.6rem;
  }
  .cell + .cell {
    border-left: 1px solid var(--line);
  }
  .value {
    font: 400 2.6rem/1 var(--latin);
    font-variant-numeric: tabular-nums;
    color: var(--paper);
  }
  .title {
    font: 500 1.1rem/1 var(--latin), var(--jp);
    color: var(--paper-2);
  }
  .sub {
    font: 400 1.05rem/1.3 var(--latin), var(--jp);
    color: var(--paper-3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .progress {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 2px;
    width: 100%;
    background: var(--line);
  }
  .progress::after {
    content: '';
    position: absolute;
    inset: 0;
    width: calc(var(--p) * 100%);
    background: var(--paper);
  }
</style>
