<script lang="ts">
  import type { Card } from '../lib/types';

  let { card, total }: { card: Card; total: number } = $props();

  const frame = $derived(card.frame ?? 'gallery');
  const no = $derived(`No.${String(card.no).padStart(3, '0')} / ${String(total).padStart(3, '0')}`);
  const camera = $derived(card.exif?.camera ?? 'Wikimedia Commons');
  const settings = $derived(card.exif?.settings ?? `${card.year} · ${card.country}`);
  const shot = $derived(card.exif?.date ?? String(card.year));
  const palette = $derived(card.palette ?? ['#3a3b3f', '#57585d', '#76787e', '#9a9ca2', '#c4c6cb']);
  const file = $derived(card.image.split('/').pop() ?? '');
</script>

<!-- Everything around the photo: backgrounds, chrome and type. The photo itself sits above this layer. -->
<div class="frame">
  {#if frame === 'gallery'}
    <header class="g-head">
      <span class="f-maker">{card.maker}</span>
      <span class="f-model">{card.model}</span>
    </header>
    <footer class="g-foot">
      <span class="g-meta">{card.year} · {card.country}</span>
      <span class="f-no">{no}</span>
      <span class="f-rarity">{card.rarity}</span>
    </footer>
  {:else if frame === 'watermark'}
    <footer class="w-bar">
      <div class="w-left">
        <span class="f-model">{card.model}</span>
        <span class="f-maker">{card.maker}</span>
      </div>
      <span class="w-rule"></span>
      <div class="w-right">
        <span class="w-camera">{camera}</span>
        <span class="f-small">{settings}</span>
      </div>
      <div class="w-under">
        <span class="f-no">{no}</span>
        <span class="f-small">{shot}</span>
        <span class="f-rarity">{card.rarity}</span>
      </div>
    </footer>
  {:else if frame === 'litt'}
    <div class="l-blur" aria-hidden="true"></div>
    <span class="l-maker f-maker">{card.maker}</span>
    <footer class="l-foot">
      <span class="f-model">{card.model}</span>
      <span class="f-small">{camera}</span>
      <span class="f-small l-settings">{settings}</span>
    </footer>
    <span class="l-no f-no">{no}</span>
    <span class="l-rarity f-rarity">{card.rarity}</span>
  {:else if frame === 'palette'}
    <header class="p-head">
      <span class="f-model">{card.model}</span>
      <span class="f-small">PHOTOGRAPHED IN : {shot} · {card.maker}</span>
    </header>
    <footer class="p-foot">
      <div class="p-swatches">
        {#each palette as c, i (i)}<span style="background:{c}"></span>{/each}
      </div>
      <div class="p-exif">
        <span class="w-camera">{camera}</span>
        <span class="f-small">{settings}</span>
      </div>
      <span class="f-no">{no}</span>
      <span class="f-rarity">{card.rarity}</span>
    </footer>
  {:else}
    <div class="x-window" aria-hidden="true">
      <div class="x-title">
        <span class="x-dots"><i></i><i></i><i></i></span>
        <span class="x-name">{file}</span>
        <span class="x-close">×</span>
      </div>
      <div class="x-media">
        <svg viewBox="0 0 24 24"><path d="M4 12a6 6 0 0 1 10-4.5L16 9M20 12a6 6 0 0 1-10 4.5L8 15M16 5v4h-4M8 19v-4h4" /></svg>
        <span class="x-track"><i></i></span>
        <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.6 12 20 12 20z" /></svg>
        <svg viewBox="0 0 24 24"><path d="M9 6v12M15 6v12" /></svg>
      </div>
    </div>
    <footer class="x-foot">
      <span class="f-maker">{card.maker}</span>
      <span class="f-model">{card.model}</span>
      <span class="x-meta"><span class="f-no">{no}</span><span class="f-rarity">{card.rarity}</span></span>
    </footer>
  {/if}
</div>
