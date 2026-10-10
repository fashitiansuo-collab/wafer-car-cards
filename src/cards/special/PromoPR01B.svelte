<script lang="ts">
  // PR-01 B "Hello, Roadster": a landscape sticker sheet. The car is a die-cut sticker on sunny
  // yellow, groovy type behind it, wafer crumbs drifting, a stamp that turns. On reveal the car
  // drives onto the card and the stickers slap down one by one.
  // Type picked to match the references: groovy display (energy-drink wordmark), chunky rounded sans
  // (snack stickers), heavy Japanese gothic, and a plain mono for the small print.
  import '@fontsource/shrikhand/400.css';
  import '@fontsource/lilita-one/400.css';
  import '@fontsource/dela-gothic-one/400.css';
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
    /** Play this card's one-off moment (on reveal): the drive-in and the stickers. */
    moment?: boolean;
    firstPulledAt?: number | null;
  }
  let { promo, interactive = true, flipped = false, tilt, moment = false, firstPulledAt = null }: Props = $props();

  const own = createTilt();
  const t = $derived(tilt ?? own);
  let el: HTMLElement;
  $effect(() => (interactive && el ? t.attach(el) : undefined));

  // Wafer crumbs: position (cqw), size, depth (parallax factor), spin.
  const crumbs = [
    [8, 9, 4, 1.4, 20],
    [27, 4, 3, 0.8, -35],
    [52, 7, 2.6, 1.1, 50],
    [90, 30, 3.6, 1.6, -15],
    [4, 52, 3.2, 0.9, 70],
    [44, 60, 2.4, 1.3, -60],
    [72, 4, 2.8, 0.7, 10],
    [95, 58, 2.2, 1.2, 40],
  ];
  const stamp = '人馬一体 · JINBA ITTAI · 人馬一体 · JINBA ITTAI · ';
</script>

<div class="card card--landscape pr01b" class:card--flipped={flipped} class:intro={moment} style={t.style} bind:this={el}>
  <div class="card__rotator">
    <div class="card__front">
      <div class="waves"></div>
      <div class="foil"></div>

      {#each crumbs as [x, y, s, depth, r], i (i)}
        <span class="crumb" style="left:{x}cqw;top:{y}cqw;--s:{s}cqw;--d:{depth};--r:{r}deg;--i:{i}"></span>
      {/each}

      <p class="word" aria-hidden="true">Roadster</p>

      <svg class="stamp" viewBox="0 0 100 100" aria-hidden="true">
        <defs><path id="pr01b-ring" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" /></defs>
        <circle cx="50" cy="50" r="48" />
        <text><textPath href="#pr01b-ring">{stamp}</textPath></text>
        <path class="star" d="M50 36l3.5 9 9.5.7-7.3 6.1 2.3 9.2L50 56l-8 5 2.3-9.2-7.3-6.1 9.5-.7z" />
      </svg>

      <div class="car">
        <img src={promo.image} alt="" draggable="false" />
      </div>

      <span class="sticker hello">HELLO!</span>
      <span class="sticker est">EST. 1989</span>
      <span class="sticker open" lang="ja">風、ひらく。</span>

      <div class="info">
        <span class="name">{promo.maker} {promo.model} <small>({promo.generation})</small></span>
        <span class="spec">L 3970 · W 1675 · 940 kg · 1.6L DOHC</span>
        <span class="spec">{promo.exif.camera} · {promo.exif.settings}</span>
      </div>

      <Signature no={promo.code} label="PROMO" ink="#2a1b00" />
      <div class="card__glare"></div>
    </div>
    <div class="card__back">
      <CardBack card={promo} {firstPulledAt} />
    </div>
  </div>
</div>

<style>
  .pr01b {
    --sun: #ffcc1a;
    --sun-2: #ffb800;
    --pink: #ff5fa2;
    --navy: #1d2a6b;
    --cherry: #d81e2c;
    /* Pointer position as -1..1, for parallax. */
    --px: calc((var(--pointer-from-left, .5) - .5) * 2);
    --py: calc((var(--pointer-from-top, .5) - .5) * 2);
  }
  .pr01b .card__front {
    background: var(--sun);
    box-shadow: none;
    color: #2a1b00;
  }

  /* Groovy rings drifting slowly behind everything. */
  .waves {
    position: absolute;
    inset: -20%;
    background:
      repeating-radial-gradient(circle at 18% 120%, transparent 0 5cqw, rgba(255, 168, 0, .55) 5cqw 9cqw),
      repeating-radial-gradient(circle at 105% -10%, transparent 0 6cqw, rgba(255, 255, 255, .22) 6cqw 8cqw);
    animation: drift 18s linear infinite alternate;
  }
  @keyframes drift {
    to {
      transform: translate(4cqw, -3cqw) rotate(4deg);
    }
  }
  .foil {
    position: absolute;
    inset: 0;
    background:
      url('/fx/glitter.png') var(--background-x, 50%) var(--background-y, 50%) / 80px,
      linear-gradient(115deg, hsl(320, 90%, 75%), hsl(50, 100%, 70%), hsl(170, 80%, 70%), hsl(320, 90%, 75%))
        var(--background-x, 50%) var(--background-y, 50%) / 300% 300%;
    mix-blend-mode: soft-light;
    opacity: calc(var(--card-opacity, 0) * .35);
    z-index: 1;
  }

  /* A little wafer: grid-baked biscuit, bobbing and drifting with depth. */
  .crumb {
    position: absolute;
    width: var(--s);
    height: calc(var(--s) * .72);
    border-radius: .4cqw;
    background:
      repeating-linear-gradient(45deg, rgba(120, 72, 22, .45) 0 .18cqw, transparent .18cqw .9cqw),
      repeating-linear-gradient(-45deg, rgba(120, 72, 22, .45) 0 .18cqw, transparent .18cqw .9cqw),
      #e2ad62;
    box-shadow: 0 0 0 .35cqw #fff, .5cqw .7cqw 0 rgba(0, 0, 0, .12);
    transform: translate(calc(var(--px) * var(--d) * 2.2cqw), calc(var(--py) * var(--d) * 1.6cqw)) rotate(var(--r));
    animation: bob 4s ease-in-out calc(var(--i) * -.6s) infinite alternate;
    z-index: 2;
  }
  @keyframes bob {
    to {
      translate: 0 -1.2cqw;
      rotate: 12deg;
    }
  }

  .word {
    position: absolute;
    left: 3.5cqw;
    top: 3cqw;
    margin: 0;
    font: 400 19cqw/1 'Shrikhand', var(--latin-condensed);
    color: #fff;
    text-shadow: .9cqw .9cqw 0 var(--cherry);
    rotate: -5deg;
    transform: translate(calc(var(--px) * -1.4cqw), calc(var(--py) * -1cqw));
    z-index: 2;
    white-space: nowrap;
  }

  .stamp {
    position: absolute;
    left: 4cqw;
    bottom: 13cqw;
    width: 17cqw;
    height: 17cqw;
    z-index: 3;
    animation: turn 22s linear infinite;
  }
  .stamp circle {
    fill: var(--navy);
  }
  .stamp text {
    font: 400 9px/1 'Dela Gothic One', var(--jp);
    letter-spacing: 1px;
    fill: #fff;
  }
  .stamp .star {
    fill: var(--sun);
  }
  @keyframes turn {
    to {
      rotate: 360deg;
    }
  }

  /* The car: a die-cut sticker (white rim, hard lift shadow) that floats over the type. */
  .car {
    position: absolute;
    right: 1cqw;
    top: 15cqw;
    width: 74cqw;
    z-index: 4;
    rotate: -2deg;
    transform: translate(calc(var(--px) * 2.6cqw), calc(var(--py) * 1.6cqw));
  }
  .car img {
    display: block;
    width: 100%;
    filter: drop-shadow(.55cqw 0 0 #fff) drop-shadow(-.55cqw 0 0 #fff) drop-shadow(0 .55cqw 0 #fff)
      drop-shadow(0 -.55cqw 0 #fff)
      drop-shadow(calc(1cqw + var(--px) * -.8cqw) calc(1.4cqw + var(--py) * -.6cqw) 0 rgba(60, 30, 0, .22));
  }

  .sticker {
    position: absolute;
    z-index: 5;
    font: 400 3.8cqw/1 'Lilita One', var(--latin);
    letter-spacing: .02em;
    padding: 1.1cqw 2cqw 1.3cqw;
    border-radius: 99px;
    box-shadow: 0 0 0 .5cqw #fff, .7cqw .9cqw 0 rgba(60, 30, 0, .2);
  }
  .hello {
    right: 6cqw;
    top: 5cqw;
    background: var(--pink);
    color: #fff;
    rotate: 8deg;
  }
  .est {
    right: 30cqw;
    top: 4cqw;
    background: var(--navy);
    color: var(--sun);
    font: 400 2.8cqw/1 'Lilita One', var(--latin);
    letter-spacing: .12em;
    border-radius: .6cqw;
    rotate: -6deg;
  }
  .open {
    left: 24cqw;
    bottom: 15cqw;
    background: #fff;
    color: var(--cherry);
    font: 400 3.2cqw/1 'Dela Gothic One', var(--jp);
    letter-spacing: .06em;
    border-radius: .6cqw;
    rotate: 4deg;
  }

  .info {
    position: absolute;
    left: 4cqw;
    bottom: 3.6cqw;
    right: 40cqw;
    display: flex;
    flex-direction: column;
    gap: .7cqw;
    z-index: 5;
  }
  .name {
    font: 400 3.8cqw/1 'Lilita One', var(--latin);
    letter-spacing: .03em;
    text-transform: uppercase;
  }
  .name small {
    color: var(--cherry);
  }
  .spec {
    font: 400 1.75cqw/1.2 'DM Mono', var(--mono);
    color: rgba(42, 27, 0, .7);
    white-space: nowrap;
  }

  /* The moment: drive in from the left with speed, then each sticker slaps down. */
  .intro .car {
    animation: drive 900ms cubic-bezier(.15, .8, .25, 1) both;
  }
  @keyframes drive {
    from {
      translate: -90cqw 0;
      filter: blur(.6cqw);
    }
    70% {
      translate: 2cqw 0;
      filter: none;
    }
    to {
      translate: 0 0;
    }
  }
  .intro .sticker,
  .intro .stamp {
    animation: slap 420ms cubic-bezier(.3, 1.6, .5, 1) both;
  }
  .intro .stamp {
    animation: slap 420ms cubic-bezier(.3, 1.6, .5, 1) 1000ms both, turn 22s linear 1420ms infinite;
  }
  .intro .hello { animation-delay: 850ms; }
  .intro .est { animation-delay: 1150ms; }
  .intro .open { animation-delay: 1300ms; }
  @keyframes slap {
    from {
      scale: 1.8;
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .waves,
    .crumb,
    .stamp,
    .intro .car,
    .intro .sticker,
    .intro .stamp {
      animation: none;
    }
  }
</style>
