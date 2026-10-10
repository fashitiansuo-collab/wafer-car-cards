<script lang="ts">
  import type { Card, Rarity } from '../lib/types';
  import { RARITIES } from '../lib/types';
  import type { Game } from '../state/game.svelte';
  import GuideBar from '../ui/GuideBar.svelte';
  import RarityTag from '../ui/RarityTag.svelte';

  let { game, cards }: { game: Game; cards: Card[] } = $props();

  const byR = $derived(game.countByRarity());
  const totalOf = (r: Rarity) => cards.filter((c) => c.rarity === r).length;
  const forcedOptions: (Rarity | null)[] = [null, ...RARITIES];
</script>

<div class="scroll">
  <section class="block">
    <div class="nums">
      <div><span class="v">{game.save.eaten}</span><span class="l">食べた数</span></div>
      <div><span class="v">{game.ownedCount()}<small>/{cards.length}</small></span><span class="l">図鑑</span></div>
    </div>
    <dl class="rows">
      {#each RARITIES as r (r)}
        <dt><RarityTag rarity={r} /></dt>
        <dd>{byR[r]} / {totalOf(r)}</dd>
      {/each}
    </dl>
  </section>

  <section class="block">
    <h2>レア固定(確認用)</h2>
    <p class="note">次に開ける袋のレアを固定します。</p>
    <div class="seg">
      {#each forcedOptions as r (r ?? 'none')}
        <button class:on={game.forced === r} onclick={() => (game.forced = r)}>{r ?? 'なし'}</button>
      {/each}
    </div>
  </section>

  <section class="block">
    <h2>写真のクレジット</h2>
    <p class="note">写真はすべてウィキメディア・コモンズのもので、切り抜きと色調整をしています(改変あり)。</p>
    <ol class="credits">
      {#each cards as c (c.id)}
        <li>
          <span class="no">{String(c.no).padStart(3, '0')}</span>
          <span class="who">{c.credit.author}</span>
          <a href={c.credit.licenseUrl} target="_blank" rel="noopener">{c.credit.license}</a>
          <a href={c.credit.sourceUrl} target="_blank" rel="noopener">出典</a>
        </li>
      {/each}
    </ol>
  </section>
</div>
<GuideBar hints={[{ keys: '↕', label: 'スクロール' }]} />

<style>
  .scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 1.6rem var(--inset) 2.4rem;
    display: grid;
    gap: 1.2rem;
    align-content: start;
  }
  .block {
    background: var(--ink-2);
    padding: 1.6rem;
  }
  h2 {
    margin: 0 0 .6rem;
    font: 600 1.6rem/1.1 var(--latin-condensed), var(--jp);
    color: var(--paper);
  }
  .note {
    margin: 0 0 1.2rem;
    font: 400 1.1rem/1.5 var(--latin), var(--jp);
    color: var(--paper-2);
  }
  .nums {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-bottom: 1.4rem;
  }
  .nums > div {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }
  .nums > div + div {
    border-left: 1px solid var(--line);
    padding-left: 1.4rem;
  }
  .v {
    font: 400 3.4rem/1 var(--latin);
    font-variant-numeric: tabular-nums;
  }
  .v small {
    font-size: 1.6rem;
    color: var(--paper-2);
  }
  .l {
    font: 500 1.1rem/1 var(--latin), var(--jp);
    color: var(--paper-2);
  }
  .rows {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: .9rem 0;
    margin: 0;
    padding-top: 1.4rem;
    border-top: 1px solid var(--line);
  }
  .rows dd {
    margin: 0;
    font: 500 1.3rem/1 var(--latin);
    font-variant-numeric: tabular-nums;
  }
  .seg {
    display: flex;
    border: 1px solid var(--line-2);
  }
  .seg button {
    flex: 1;
    padding: .9rem 0;
    font: 600 1.2rem/1 var(--latin-condensed), var(--jp);
    letter-spacing: .06em;
    color: var(--paper-2);
    transition: background-color var(--t-focus) var(--ease-standard);
  }
  .seg button + button {
    border-left: 1px solid var(--line);
  }
  .seg button.on {
    background: var(--sel-fill);
    color: #0e0e0e;
  }
  .credits {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: .7rem;
    font: 400 1.05rem/1.4 var(--latin), var(--jp);
    color: var(--paper-2);
  }
  .credits li {
    display: grid;
    grid-template-columns: 3.2rem 1fr auto auto;
    gap: .8rem;
    align-items: baseline;
  }
  .no {
    font-variant-numeric: tabular-nums;
    color: var(--paper-3);
  }
  .who {
    color: var(--paper);
    overflow-wrap: anywhere;
  }
  .credits a {
    color: var(--paper-2);
    text-decoration: underline;
    text-decoration-color: var(--paper-3);
    text-underline-offset: .25em;
  }
</style>
