<script lang="ts">
  // The one mark every SEC / promo card shares, whatever its design: number + gold rarity tag.
  let { no, label, ink = '#141414' }: { no: string; label: string; ink?: string } = $props();
</script>

<div class="sig" style="--sig-ink:{ink}">
  <span class="no">{no}</span>
  <span class="tag"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 0l1.4 3.4L10 5 6.4 6.6 5 10 3.6 6.6 0 5l3.6-1.6z" /></svg>{label}</span>
</div>

<style>
  .sig {
    position: absolute;
    right: 4.5cqw;
    bottom: 4cqw;
    display: flex;
    align-items: center;
    gap: 2cqw;
    z-index: 6;
  }
  .no {
    font: 500 2.8cqw/1 var(--latin);
    font-variant-numeric: tabular-nums;
    letter-spacing: .1em;
    color: var(--sig-ink);
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: .8cqw;
    padding: .9cqw 1.4cqw;
    font: 700 2.6cqw/1 var(--latin-condensed);
    letter-spacing: .14em;
    color: #3b2a07;
    background: linear-gradient(115deg, #8a6516, #f6dc86 30%, #b8902a 55%, #fff1bf 75%, #9c7418);
    background-size: 220% 100%;
    background-position: var(--background-x, 50%) 0;
  }
  svg {
    width: 2.2cqw;
    height: 2.2cqw;
    fill: currentColor;
  }
</style>
