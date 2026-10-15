<script lang="ts">
  // e045 — after Design Bomb!!! (Awwwards Honorable Mention): a near-black page, a huge black-italic
  // headline set tight with exclamation marks, a rounded acid-lime panel, and a tilted stack of
  // highlighted words in clashing colours (the date sticker). The photo, a yellow-and-green car
  // flat out at a summer hill climb, sits in the rounded panel. The moment drops the sticker on.
  import '@fontsource-variable/archivo/wdth-italic.css';
  import type { Card } from '../../../lib/types';
  import type { Tilt } from '../../../lib/tilt.svelte';
  import SecShell from '../sec2/SecShell.svelte';

  let props: {
    card: Card;
    interactive?: boolean;
    flipped?: boolean;
    tilt?: Tilt;
    moment?: boolean;
    firstPulledAt?: number | null;
    plainBack?: boolean;
  } = $props();
  const card = $derived(props.card);
  // "2009/07/04" -> ["04", "07", "2009"]
  const date = $derived((card.exif?.date ?? '').split('/').reverse());
</script>

<SecShell {...props} name="e045" ink="#f6f4ea" holo="rainbow">
  <h2 class="title">{card.model}!!!</h2>
  <div class="panel"><img src={card.image} alt="" draggable="false" /></div>
  <p class="sticker" aria-label="Goodwood, {date.join('.')}">
    <span class="g">{date[0]}</span><span class="b">{date[1]}</span><span class="p">{date[2]}</span>
    <span class="y">goodwood</span>
  </p>
</SecShell>

<style>
  :global(.e045 .card__front) {
    background: #141414;
    color: #f6f4ea;
  }
  .title {
    position: absolute;
    left: 4cqw;
    right: 4cqw;
    top: 7cqw;
    margin: 0;
    font-family: 'Archivo Variable', var(--latin);
    font-style: italic;
    font-weight: 900;
    font-stretch: 110%;
    font-size: 20cqw;
    line-height: .85;
    letter-spacing: -.05em;
    text-transform: uppercase;
    text-align: center;
    color: #f6f4ea;
  }
  /* The rounded acid-lime panel, with the photograph inset in it. */
  .panel {
    position: absolute;
    left: 3cqw;
    right: 3cqw;
    top: 42cqw;
    bottom: 3cqw;
    padding: 2.2cqw;
    border-radius: 3cqw;
    background: #d4ff00;
  }
  .panel img {
    width: 100%;
    height: 100%;
    border-radius: 1.6cqw;
    object-fit: cover;
    object-position: 58% 55%;
    scale: calc(1 + var(--pointer-from-center, 0) * var(--card-opacity, 0) * .03);
    transition: scale 600ms cubic-bezier(.16, 1, .3, 1);
  }
  /* The sticker: words on clashing highlight bands, tilted, stacked. */
  .sticker {
    position: absolute;
    right: 2cqw;
    top: 37cqw;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    width: 46cqw;
    rotate: 8deg;
    font-family: 'Archivo Variable', var(--latin);
    font-style: italic;
    font-weight: 900;
    font-size: 6.4cqw;
    line-height: .95;
    letter-spacing: -.03em;
  }
  .sticker span {
    padding: 0 1cqw;
  }
  .g {
    background: #1fa34a;
    color: #d4ff00;
  }
  .b {
    background: #2340ff;
    color: #f6f4ea;
  }
  .p {
    background: #ff3fa4;
    color: #f6f4ea;
  }
  .y {
    background: #d4ff00;
    color: #141414;
  }

  /* The moment: the sticker is slapped on. */
  :global(.moment) .sticker {
    animation: slap 460ms cubic-bezier(.16, 1, .3, 1) 350ms both;
  }
  @keyframes slap {
    from {
      opacity: 0;
      scale: 1.6;
      rotate: -6deg;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .panel img {
      transition: none;
    }
    :global(.moment) .sticker {
      animation: none;
    }
  }
</style>
