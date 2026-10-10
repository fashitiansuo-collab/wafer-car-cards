<script lang="ts">
  // PR-01 B — a snack-brand hero shot after Henrietta Said: salmon ground, a giant stacked cream
  // headline, the car as the mascot rising through it in sunglasses, wafer pieces drifting at
  // different depths. On reveal the car rises in and the shades drop onto the windscreen.
  import '@fontsource/rubik/900.css';
  import '@fontsource/rubik/700.css';
  import '@fontsource/caveat-brush/400.css';
  import '@fontsource/dm-mono/400.css';
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
    /** Play this card's one-off moment (on reveal): the rise and the shades. */
    moment?: boolean;
    firstPulledAt?: number | null;
  }
  let { promo, interactive = true, flipped = false, tilt, moment = false, firstPulledAt = null }: Props = $props();

  const own = createTilt();
  const t = $derived(tilt ?? own);
  let el: HTMLElement;
  $effect(() => (interactive && el ? t.attach(el) : undefined));

  // Wafer pieces (real photographs, cut out): image, x, y (cqw), width (cqw), rotation,
  // depth (parallax; >1 sits in front of the car, out of focus).
  const pieces: [number, number, number, number, number, number][] = [
    [1, 2, 22, 13, -24, 0.5],
    [0, 83, 16, 11, 31, 0.6],
    [3, 8, 58, 12, 58, 0.7],
    [2, 86, 52, 10, -14, 0.6],
    [1, 44, 11, 7, 16, 0.4],
    [0, -6, 98, 21, 22, 1.8],
    [2, 76, 92, 22, -34, 1.9],
    [3, 64, 4, 17, -40, 1.6],
    [1, 34, 112, 8, 70, 0.8],
  ];
</script>

<div class="card pr01b" class:card--flipped={flipped} class:rise={moment} style={t.style} bind:this={el}>
  <div class="card__rotator">
    <div class="card__front">
      <div class="bar"><span>Wafer Car Card</span></div>

      {#each pieces as [img, x, y, w, r, d], i (i)}
        {#if d <= 1}
          <img class="piece" src="./promo/wafer-{img}.webp" alt="" draggable="false" style="left:{x}cqw;top:{y}cqw;--w:{w}cqw;--r:{r}deg;--d:{d};--i:{i}" />
        {/if}
      {/each}

      <p class="headline" aria-hidden="true">
        <span>Top</span><span>down,</span><span>big</span><span>grin</span>
      </p>

      <div class="car">
        <img src={promo.image} alt="" draggable="false" />
        <svg class="shades" viewBox="0 0 120 40" aria-hidden="true">
          <defs>
            <linearGradient id="pr01b-lens" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#3a4a44" />
              <stop offset="1" stop-color="#0d1210" />
            </linearGradient>
          </defs>
          <path class="frame" d="M3 6h114l-3 7c-3 16-11 23-24 23-12 0-19-7-22-18h-16c-3 11-10 18-22 18-13 0-21-7-24-23z" />
          <path class="lens" d="M10 11h40c-1 13-7 20-19 20-11 0-18-7-21-20zM70 11h40c-3 13-10 20-21 20-12 0-18-7-19-20z" />
          <path class="shine" d="M15 14l9 0-8 12zM75 14l9 0-8 12z" />
        </svg>
      </div>

      {#each pieces as [img, x, y, w, r, d], i (i)}
        {#if d > 1}
          <img class="piece piece--front" src="./promo/wafer-{img}.webp" alt="" draggable="false" style="left:{x}cqw;top:{y}cqw;--w:{w}cqw;--r:{r}deg;--d:{d};--i:{i}" />
        {/if}
      {/each}

      <span class="sticker">940 kg</span>
      <svg class="stamp" viewBox="0 0 100 100" aria-hidden="true">
        <defs><path id="pr01b-ring" d="M50 50 m-35 0 a35 35 0 1 1 70 0 a35 35 0 1 1 -70 0" /></defs>
        <circle cx="50" cy="50" r="48" />
        <text><textPath href="#pr01b-ring" textLength="218" lengthAdjust="spacing">open top · 1989 · open top · 1989 ·</textPath></text>
        <path class="mark" d="M50 31l5.6 12.2 13.3 1.5-9.9 9 2.7 13.1L50 60.2l-11.7 6.6 2.7-13.1-9.9-9 13.3-1.5z" />
      </svg>

      <div class="info">
        <span class="name">{promo.maker} {promo.model} ({promo.generation})</span>
        <span class="spec">{promo.exif.camera} · {promo.exif.settings}</span>
      </div>

      <Signature no={promo.code} label="PROMO" ink="#2d2a26" />
      <div class="card__glare"></div>
    </div>
    <div class="card__back">
      <CardBack card={promo} {firstPulledAt} />
    </div>
  </div>
</div>

<style>
  .pr01b {
    --salmon: #e3a898;
    --cream: #eae6e3;
    --ink: #2d2a26;
    --chili: #d32929;
    --brick: #8b231a;
    --orange: #f45016;
    --mustard: #efc415;
    /* Pointer as -1..1 for parallax. */
    --px: calc((var(--pointer-from-left, .5) - .5) * 2);
    --py: calc((var(--pointer-from-top, .5) - .5) * 2);
  }
  .pr01b .card__front {
    background:
      radial-gradient(ellipse 92% 38% at 50% 30%, #b2584a 52%, transparent),
      var(--salmon);
    box-shadow: none;
    color: var(--ink);
  }

  /* Keep the glare low so it never washes the cream headline into the ground. */
  .pr01b .card__glare {
    opacity: calc(var(--card-opacity, 0) * .28);
  }

  /* The translucent pill bar with a hand-lettered wordmark, as on the reference's header. */
  .bar {
    position: absolute;
    left: 4cqw;
    right: 4cqw;
    top: 3.5cqw;
    height: 9.5cqw;
    border-radius: 2cqw;
    background: color-mix(in srgb, var(--cream) 62%, transparent);
    display: grid;
    place-items: center;
    z-index: 6;
  }
  .bar span {
    font: 400 6.2cqw/1 'Caveat Brush', cursive;
    color: var(--ink);
  }

  /* Giant stacked cream headline, centred, sitting behind the car. */
  .headline {
    position: absolute;
    left: 0;
    right: 0;
    top: 15cqw;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    font: 900 17cqw/.86 'Rubik', var(--latin);
    letter-spacing: -.02em;
    text-transform: uppercase;
    color: var(--cream);
    /* A soft brick halo keeps cream type legible on salmon and under the glare. */
    text-shadow: 0 .4cqw 1.6cqw rgba(139, 35, 26, .38), 0 0 .5cqw rgba(139, 35, 26, .3);
    transform: translate(calc(var(--px) * -1cqw), calc(var(--py) * -.8cqw));
    z-index: 2;
  }

  /* A wafer piece: a cut-out photograph with a soft cast shadow. */
  .piece {
    position: absolute;
    width: var(--w);
    height: auto;
    filter: drop-shadow(.4cqw 1.2cqw 1.4cqw rgba(110, 40, 20, .3));
    rotate: var(--r);
    transform: translate(calc(var(--px) * var(--d) * 2.4cqw), calc(var(--py) * var(--d) * 1.8cqw));
    animation: float 5s ease-in-out calc(var(--i) * -.7s) infinite alternate;
    z-index: 1;
  }
  .piece--front {
    filter: blur(.6cqw) drop-shadow(.4cqw 1.2cqw 1.4cqw rgba(110, 40, 20, .25));
    z-index: 5;
  }
  @keyframes float {
    to {
      translate: 0 -1.4cqw;
    }
  }

  /* The car: die-cut, rising through the headline, wearing shades. */
  .car {
    position: absolute;
    left: -2cqw;
    width: 100cqw;
    top: 64cqw;
    z-index: 4;
    transform: translate(calc(var(--px) * 1.8cqw), calc(var(--py) * 1.2cqw));
  }
  .car img {
    display: block;
    width: 100%;
    filter: drop-shadow(0 2.2cqw 2.4cqw rgba(110, 40, 20, .35));
  }
  .shades {
    position: absolute;
    left: 41%;
    top: 9%;
    width: 29%;
    rotate: 7deg;
    transform: perspective(40cqw) rotateY(-16deg) skewX(-6deg);
    filter: drop-shadow(0 .6cqw .5cqw rgba(30, 10, 5, .45));
  }
  .shades .frame {
    fill: var(--orange);
  }
  .shades .lens {
    fill: url(#pr01b-lens);
  }
  .shades .shine {
    fill: rgba(255, 255, 255, .55);
  }

  /* A paper sticker and the round stamp from the reference's product section. */
  .sticker {
    position: absolute;
    left: 5cqw;
    bottom: 17cqw;
    padding: 1.6cqw 3cqw;
    background: var(--mustard);
    color: var(--brick);
    font: 900 6cqw/1 'Rubik', var(--latin);
    text-transform: uppercase;
    rotate: -7deg;
    box-shadow: .3cqw .9cqw 1.6cqw rgba(110, 40, 20, .3);
    z-index: 6;
  }
  .stamp {
    position: absolute;
    right: 5cqw;
    bottom: 15cqw;
    width: 22cqw;
    height: 22cqw;
    z-index: 6;
    animation: turn 24s linear infinite;
  }
  .stamp circle {
    fill: var(--brick);
  }
  .stamp .mark {
    fill: var(--mustard);
  }
  .stamp text {
    font: 700 12.5px/1 'Rubik', var(--latin);
    text-transform: uppercase;
    fill: var(--cream);
  }
  @keyframes turn {
    to {
      rotate: 360deg;
    }
  }

  .info {
    position: absolute;
    left: 5cqw;
    right: 34cqw;
    bottom: 4cqw;
    display: flex;
    flex-direction: column;
    gap: 1cqw;
    z-index: 6;
  }
  .name {
    font: 700 3.6cqw/1.1 'Rubik', var(--latin);
    text-transform: uppercase;
  }
  .spec {
    font: 400 2.4cqw/1.2 'DM Mono', var(--mono);
    color: color-mix(in srgb, var(--ink) 82%, var(--brick));
  }

  /* The moment: the car rises from below the card, then the shades drop onto the windscreen. */
  .rise .car {
    animation: up 1100ms cubic-bezier(.16, 1, .3, 1) both;
  }
  .rise .shades {
    animation: drop 520ms cubic-bezier(.16, 1, .3, 1) 900ms both;
  }
  .rise .piece {
    animation:
      burst 1000ms cubic-bezier(.16, 1, .3, 1) calc(var(--i) * 60ms) both,
      float calc(4s + var(--i) * .37s) ease-in-out calc(1s + var(--i) * 60ms) infinite alternate;
  }
  @keyframes up {
    from {
      translate: 0 70cqw;
    }
  }
  @keyframes drop {
    from {
      translate: 0 -40cqw;
      opacity: 0;
    }
  }
  @keyframes burst {
    from {
      margin-top: 40cqw;
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .piece,
    .stamp,
    .rise .car,
    .rise .shades,
    .rise .piece {
      animation: none;
    }
  }
</style>
