<script lang="ts">
  // PR-01 "Winking roadster": paper card, giant type behind a cut-out car, pop-up lights that wink.
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
    /** Play this card's one-off moment (on reveal): here, the wink. */
    moment?: boolean;
    firstPulledAt?: number | null;
  }
  let { promo, interactive = true, flipped = false, tilt, moment = false, firstPulledAt = null }: Props = $props();

  const own = createTilt();
  const t = $derived(tilt ?? own);
  let el: HTMLElement;
  $effect(() => (interactive && el ? t.attach(el) : undefined));

  // The car box on the card (cqw): lights are placed from the cut-out's measured %.
  const CAR = { left: -30, top: 39, w: 128, h: 71.4 };
</script>

<div class="card pr01" class:card--flipped={flipped} class:wink={moment} style={t.style} bind:this={el}>
  <div class="card__rotator">
    <div class="card__front">
      <div class="paper"></div>
      <div class="dots"></div>
      <div class="foil"></div>

      <p class="label">PROMOTION CARD<br /><span>WAFER CAR CARD · SERIES 2 PREVIEW</span></p>
      <p class="tate" lang="ja">人馬一体</p>
      <p class="big" aria-hidden="true">MX-5</p>

      <div
        class="carbox"
        style="left:{CAR.left}cqw;top:{CAR.top}cqw;width:{CAR.w}cqw;height:{CAR.h}cqw"
      >
        <img src={promo.image} alt="" draggable="false" />
        {#each promo.lights as [x, y], i (i)}
          <span class="beam beam--{i}" style="left:{x}%;top:{y}%"><i></i></span>
        {/each}
      </div>

      <div class="foot">
        <span class="maker">{promo.maker}</span>
        <span class="model">{promo.model} <small>({promo.generation})</small></span>
        <span class="spec">L 3970 · W 1675 · H 1235 mm · 940 kg · 1.6L DOHC</span>
        <span class="spec">{promo.exif.camera} · {promo.exif.settings}</span>
        <span class="words" lang="ja">軽さ / 笑顔 / 1989</span>
      </div>

      <Signature no={promo.code} label="PROMO" />
      <div class="card__glare"></div>
    </div>
    <div class="card__back">
      <CardBack card={promo} {firstPulledAt} />
    </div>
  </div>
</div>

<style>
  .pr01 .card__front {
    background: #f1ebdf;
    box-shadow: none;
    color: #151515;
  }
  .paper {
    position: absolute;
    inset: 0;
    background: url('/fx/noise.png');
    background-size: 120px;
    mix-blend-mode: multiply;
    opacity: .16;
  }
  /* Red halftone rising from the bottom, drifting slightly with the tilt. */
  .dots {
    position: absolute;
    left: 0;
    right: 0;
    top: 44cqw;
    bottom: 27cqw;
    background: radial-gradient(circle, #d4202c 0 .5cqw, transparent .56cqw) 0 0 / 2.1cqw 2.1cqw;
    background-position: calc(var(--background-x, 50%) * .2) calc(var(--background-y, 50%) * .2);
    mask-image: linear-gradient(to bottom, transparent, #000 55%, #000 80%, transparent);
    opacity: .5;
  }
  /* A faint pastel iridescence over the paper, only while the card is held. */
  .foil {
    position: absolute;
    inset: 0;
    background:
      url('/fx/glitter.png') var(--background-x, 50%) var(--background-y, 50%) / 90px,
      linear-gradient(
        115deg,
        hsl(190, 90%, 75%) 0%,
        hsl(300, 80%, 80%) 25%,
        hsl(50, 95%, 75%) 50%,
        hsl(150, 80%, 72%) 75%,
        hsl(190, 90%, 75%) 100%
      ) var(--background-x, 50%) var(--background-y, 50%) / 300% 300%;
    mix-blend-mode: soft-light;
    opacity: calc(var(--card-opacity, 0) * .9);
  }

  .label {
    position: absolute;
    left: 4.5cqw;
    top: 4.5cqw;
    margin: 0;
    font: 700 3cqw/1.25 var(--latin-condensed);
    letter-spacing: .16em;
  }
  .label span {
    font: 500 2.2cqw/1 var(--latin);
    letter-spacing: .12em;
    color: rgba(21, 21, 21, .55);
  }
  .tate {
    position: absolute;
    right: 4.5cqw;
    top: 4.5cqw;
    margin: 0;
    writing-mode: vertical-rl;
    font: 500 5cqw/1 var(--jp);
    letter-spacing: .32em;
  }
  /* The giant type sits behind the car and moves less than it: depth without a 3D scene. */
  .big {
    position: absolute;
    left: 3cqw;
    top: 13cqw;
    margin: 0;
    font: 700 50cqw/.8 var(--latin-condensed);
    letter-spacing: -.01em;
    color: #d4202c;
    transform: translate(calc((var(--pointer-from-left, .5) - .5) * -5cqw), calc((var(--pointer-from-top, .5) - .5) * -3cqw));
  }
  .carbox {
    position: absolute;
    transform: translate(calc((var(--pointer-from-left, .5) - .5) * 11cqw), calc((var(--pointer-from-top, .5) - .5) * 6cqw));
    z-index: 2;
  }
  .carbox img {
    width: 100%;
    height: 100%;
    display: block;
    /* A thin white rim keeps the red car apart from the red type. */
    filter: drop-shadow(0 0 .35cqw rgba(255, 255, 255, .95)) drop-shadow(0 2.4cqw 2cqw rgba(60, 20, 10, .3));
  }

  /* Pop-up lights: a glow and a lens streak, brighter towards the card's edges. */
  .beam {
    position: absolute;
    width: 0;
    height: 0;
    opacity: calc(.15 + var(--card-opacity, 0) * var(--pointer-from-center, 0) * .85);
    mix-blend-mode: plus-lighter;
  }
  .beam::before,
  .beam i {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    translate: -50% -50%;
  }
  .beam::before {
    width: 26cqw;
    height: 26cqw;
    border-radius: 50%;
    background: radial-gradient(circle, #fff 0 10%, hsla(48, 100%, 70%, .85) 22%, hsla(40, 100%, 60%, .35) 40%, transparent 68%);
  }
  .beam i {
    width: 90cqw;
    height: 1.8cqw;
    background: linear-gradient(90deg, transparent, hsla(200, 100%, 85%, .55) 35%, #fff 50%, hsla(200, 100%, 85%, .55) 65%, transparent);
    border-radius: 50%;
  }
  /* The wink: both lights flash on, the left one blinks twice. Plays once on reveal. */
  .wink .beam {
    animation: on 1600ms ease-out 200ms both;
  }
  .wink .beam--0 {
    animation: blink 1600ms ease-out 200ms both;
  }
  @keyframes on {
    0% { opacity: 0; }
    20%, 70% { opacity: 1; }
    100% { opacity: calc(.15 + var(--card-opacity, 0) * var(--pointer-from-center, 0) * .85); }
  }
  @keyframes blink {
    0% { opacity: 0; }
    20% { opacity: 1; }
    30% { opacity: .05; }
    40% { opacity: 1; }
    48% { opacity: .05; }
    58%, 70% { opacity: 1; }
    100% { opacity: calc(.15 + var(--card-opacity, 0) * var(--pointer-from-center, 0) * .85); }
  }

  .foot {
    position: absolute;
    left: 4.5cqw;
    right: 30cqw;
    bottom: 4cqw;
    display: flex;
    flex-direction: column;
    gap: 1cqw;
    z-index: 3;
  }
  .maker {
    font: 600 2.8cqw/1 var(--latin);
    letter-spacing: .2em;
    color: rgba(21, 21, 21, .6);
  }
  .model {
    font: 700 7.2cqw/1 var(--latin-condensed);
    text-transform: uppercase;
    margin-bottom: .6cqw;
  }
  .model small {
    font-size: .55em;
    color: #d4202c;
  }
  .spec {
    font: 400 2.3cqw/1.3 var(--mono);
    color: rgba(21, 21, 21, .62);
    white-space: nowrap;
  }
  .words {
    margin-top: 1cqw;
    font: 500 3cqw/1 var(--jp);
    letter-spacing: .1em;
  }

  @media (prefers-reduced-motion: reduce) {
    .wink .beam,
    .wink .beam--0 {
      animation: none;
    }
  }
</style>
