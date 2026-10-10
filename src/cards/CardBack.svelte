<script lang="ts">
  import type { Card } from '../lib/types';

  type BackInfo = Pick<Card, 'year' | 'country' | 'credit'> & { assets?: Card['credit'][] };
  let { card, firstPulledAt = null }: { card: BackInfo | null; firstPulledAt?: number | null } = $props();

  const fmt = (ms: number) => {
    const d = new Date(ms);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };
</script>

<div class="back">
  <div class="back__mark" aria-hidden="true">
    <svg viewBox="0 0 40 40"><rect x="6" y="6" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" /><path d="M6 15h28M6 25h28M15 6v28M25 6v28" stroke="currentColor" stroke-width=".75" /></svg>
    <span>WAFER<br />CAR CARD</span>
  </div>
  {#if card}
    <dl class="back__spec">
      <dt>年式</dt><dd>{card.year}</dd>
      <dt>国</dt><dd>{card.country}</dd>
      {#if firstPulledAt}<dt>初入手</dt><dd>{fmt(firstPulledAt)}</dd>{/if}
    </dl>
    <dl class="back__credit">
      <dt>撮影</dt><dd>{card.credit.author}</dd>
      <dt>ライセンス</dt>
      <dd><a href={card.credit.licenseUrl} target="_blank" rel="noopener">{card.credit.license}</a></dd>
      <dt>出典</dt>
      <dd><a href={card.credit.sourceUrl} target="_blank" rel="noopener">Wikimedia Commons</a></dd>
      {#if card.credit.modified}<dt>加工</dt><dd>改変あり(切り抜き・色調整)</dd>{/if}
      {#each card.assets ?? [] as a (a.sourceUrl)}
        <dt>素材</dt>
        <dd>{a.author} · <a href={a.licenseUrl} target="_blank" rel="noopener">{a.license}</a> · <a href={a.sourceUrl} target="_blank" rel="noopener">出典</a>(改変あり)</dd>
      {/each}
    </dl>
  {/if}
</div>
