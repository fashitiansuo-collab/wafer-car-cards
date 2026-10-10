<script lang="ts">
  // PR-02 — one photograph, done well, after 1367 Studio: full-bleed image with a warm film grade
  // and grain, a small wordmark top-left, a two-tone headline bottom-left, nothing else.
  // Tilting eases the photo in toward the headlamp; on reveal it settles in from a wider frame.
  import '@fontsource/geist-sans/500.css';
  import '@fontsource/geist-sans/700.css';
  import '@fontsource/geist-mono/400.css';
  import type { Promo } from '../../lib/types';
  import { createTilt, type Tilt } from '../../lib/tilt.svelte';
  import CardBack from '../CardBack.svelte';
  import Signature from './Signature.svelte';
  import '../rarity/base.css';

  interface Props {
    promo: Promo;
    interactive?: boolean;
    flipped?: boolean;
    tilt?: Tilt;
    /** Play this card's one-off moment (on reveal): the slow settle into frame. */
    moment?: boolean;
    firstPulledAt?: number | null;
  }
  let { promo, interactive = true, flipped = false, tilt, moment = false, firstPulledAt = null }: Props = $props();

  const own = createTilt();
  const t = $derived(tilt ?? own);
  let el: HTMLElement;
  $effect(() => (interactive && el ? t.attach(el) : undefined));
</script>

<div class="card card--landscape pr02" class:card--flipped={flipped} class:settle={moment} style={t.style} bind:this={el}>
  <div class="card__rotator">
    <div class="card__front">
      <div class="photo"><img src={promo.image} alt="" draggable="false" /></div>
      <div class="grade"></div>
      <div class="grain"></div>

      <span class="mark">Wafer</span>
      <h2 class="title">
        <span>{promo.model}.</span>
        <span class="dim">Tokyo, 2005.</span>
      </h2>
      <span class="exif">{promo.exif.camera} · {promo.exif.settings}</span>

      <Signature no={promo.code} label="PROMO" ink="#f4f1ea" />
      <div class="card__glare"></div>
    </div>
    <div class="card__back">
      <CardBack card={promo} {firstPulledAt} />
    </div>
  </div>
</div>

<style>
  .pr02 .card__front {
    background: #141414;
    box-shadow: none;
    color: #f4f1ea;
  }

  /* The photograph fills the card; tilting eases it in toward the headlamp. */
  .photo {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 64% 55%;
    transform-origin: 70% 48%;
    scale: calc(1.04 + var(--pointer-from-center, 0) * var(--card-opacity, 0) * .07);
    filter: sepia(.16) saturate(.86) contrast(1.08) brightness(1.03);
    transition: scale 600ms cubic-bezier(.16, 1, .3, 1);
  }

  /* Warm film grade: a soft cream cast, grain, and a low vignette so the type sits on shadow. */
  .grade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to top, rgba(12, 11, 10, .78), rgba(12, 11, 10, 0) 46%),
      radial-gradient(120% 90% at 60% 40%, transparent 55%, rgba(12, 11, 10, .45)),
      linear-gradient(rgba(239, 226, 200, .14), rgba(239, 226, 200, .14));
    pointer-events: none;
  }
  .grain {
    position: absolute;
    inset: 0;
    background: url('/fx/noise.png') 0 0 / 160px;
    mix-blend-mode: overlay;
    opacity: .22;
    pointer-events: none;
  }

  .mark {
    position: absolute;
    left: 4.5cqw;
    top: 4cqw;
    font: 700 3.6cqw/1 'Geist Sans', var(--latin);
    letter-spacing: -.02em;
    color: #f4f1ea;
    text-shadow: 0 .2cqw 1.2cqw rgba(12, 11, 10, .5);
  }
  .title {
    position: absolute;
    left: 4.5cqw;
    bottom: 8.5cqw;
    margin: 0;
    display: flex;
    flex-direction: column;
    font: 500 5.4cqw/1.04 'Geist Sans', var(--latin);
    letter-spacing: -.03em;
    color: #f4f1ea;
  }
  .title .dim {
    color: rgba(244, 241, 234, .55);
  }
  .exif {
    position: absolute;
    left: 4.5cqw;
    bottom: 4.2cqw;
    font: 400 1.7cqw/1 'Geist Mono', var(--mono);
    letter-spacing: .02em;
    text-transform: uppercase;
    color: rgba(244, 241, 234, .7);
  }

  /* The moment: the photo settles in from a wider, darker frame. */
  .settle .photo img {
    animation: settle 1600ms cubic-bezier(.16, 1, .3, 1) both;
  }
  .settle .title,
  .settle .exif {
    animation: lift 700ms cubic-bezier(.16, 1, .3, 1) 700ms both;
  }
  @keyframes settle {
    from {
      scale: 1.22;
      filter: sepia(.16) saturate(.86) contrast(1.08) brightness(.35);
    }
  }
  @keyframes lift {
    from {
      opacity: 0;
      translate: 0 2cqw;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .photo img {
      transition: none;
    }
    .settle .photo img,
    .settle .title,
    .settle .exif {
      animation: none;
    }
  }
</style>
