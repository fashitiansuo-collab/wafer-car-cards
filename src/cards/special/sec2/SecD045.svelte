<script lang="ts">
  // d045 — after ERA Residence (Awwwards Site of the Month): a tall, narrow high-contrast serif in
  // capitals at the centre, widely spaced capitals either side, a script word crossing the title,
  // one thin vertical line and a hairline inner frame with clipped corners. Here it sits over the
  // photograph of the car on a concours lawn. The moment draws the line and writes the script in.
  import '@fontsource/instrument-serif/400.css';
  import '@fontsource/pinyon-script/400.css';
  import type { Card } from '../../../lib/types';
  import type { Tilt } from '../../../lib/tilt.svelte';
  import SecShell from './SecShell.svelte';

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
</script>

<SecShell {...props} name="d045" ink="#f3ece4">
  <div class="photo"><img src="./sec/d045.webp" alt="" draggable="false" /></div>
  <div class="shade"></div>
  <div class="frame" aria-hidden="true"></div>

  <h2 class="title">
    <span class="main">Skyline<br />GT-R</span>
    <span class="script">V·spec II</span>
  </h2>
  <p class="side left">{card.year}</p>
  <p class="side right">R 3 4</p>
  <span class="line" aria-hidden="true"></span>
  <p class="foot">{card.exif?.date?.replaceAll('/', '.')}</p>
</SecShell>

<style>
  :global(.d045 .card__front) {
    background: #120f1f;
    color: #f3ece4;
  }
  .photo {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 14% 70%;
    filter: contrast(1.04) saturate(1.02);
    scale: calc(1.03 + var(--pointer-from-center, 0) * var(--card-opacity, 0) * .04);
    transition: scale 600ms cubic-bezier(.16, 1, .3, 1);
  }
  .shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(18, 15, 31, .9), rgba(18, 15, 31, .62) 34%, rgba(18, 15, 31, 0) 56%),
      linear-gradient(to top, rgba(18, 15, 31, .6), rgba(18, 15, 31, 0) 18%);
  }
  /* Hairline inner frame with clipped corners. */
  .frame {
    position: absolute;
    inset: 2.6cqw;
    border: 1px solid rgba(243, 236, 228, .32);
    clip-path: polygon(3cqw 0, calc(100% - 3cqw) 0, 100% 3cqw, 100% calc(100% - 3cqw), calc(100% - 3cqw) 100%, 3cqw 100%, 0 calc(100% - 3cqw), 0 3cqw);
  }

  .title {
    position: absolute;
    left: 0;
    right: 0;
    top: 9cqw;
    margin: 0;
    text-align: center;
  }
  .main {
    display: block;
    font: 400 15cqw/.86 'Instrument Serif', serif;
    text-transform: uppercase;
    letter-spacing: -.01em;
    color: #f3ece4;
  }
  .script {
    position: absolute;
    left: 50%;
    top: 21cqw;
    translate: -32% 0;
    rotate: -10deg;
    font: 400 9cqw/1 'Pinyon Script', cursive;
    white-space: nowrap;
    color: #f3ece4;
    clip-path: inset(0 0 0 0);
  }
  .side {
    position: absolute;
    top: 17cqw;
    margin: 0;
    font: 400 3.2cqw/1 'Instrument Serif', serif;
    letter-spacing: .7em;
    color: #f3ece4;
  }
  .side.left {
    left: 6.5cqw;
  }
  .side.right {
    right: 4cqw;
  }
  .line {
    position: absolute;
    left: 50%;
    top: 40cqw;
    width: 1px;
    height: 12cqw;
    background: rgba(243, 236, 228, .8);
    transform-origin: 50% 0;
  }
  .foot {
    position: absolute;
    left: 6.5cqw;
    bottom: 5.4cqw;
    margin: 0;
    font: 400 3cqw/1 'Instrument Serif', serif;
    letter-spacing: .3em;
    color: rgba(243, 236, 228, .9);
  }

  /* The moment: the title settles, the script is written left to right, the line drops. */
  :global(.moment) .main {
    animation: settle 900ms cubic-bezier(.16, 1, .3, 1) both;
  }
  :global(.moment) .script {
    animation: write 900ms cubic-bezier(.65, 0, .35, 1) 500ms both;
  }
  :global(.moment) .line {
    animation: drop 700ms cubic-bezier(.16, 1, .3, 1) 900ms both;
  }
  @keyframes settle {
    from {
      opacity: 0;
      letter-spacing: .12em;
    }
  }
  @keyframes write {
    from {
      clip-path: inset(0 100% 0 0);
    }
  }
  @keyframes drop {
    from {
      transform: scaleY(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .photo img {
      transition: none;
    }
    :global(.moment) .main,
    :global(.moment) .script,
    :global(.moment) .line {
      animation: none;
    }
  }
</style>
