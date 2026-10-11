<script lang="ts">
  // d043 — after Decathlon "Yestalgia" (Awwwards Site of the Day): a 90s sports-ad world. A pennant
  // badge with a script word over an italic block word, stickers with hard black offset shadows,
  // and a tall ultra-condensed headline. The photo is a summer-evening meet; the car is from 1994.
  // The moment drops the stickers on one by one.
  import '@fontsource/yellowtail/400.css';
  import '@fontsource/anton/400.css';
  import '@fontsource-variable/archivo/wdth-italic.css';
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

<SecShell {...props} name="d043" ink="#f4f4f4">
  <div class="photo"><img src="./sec/d043.webp" alt="" draggable="false" /></div>
  <div class="shade"></div>

  <h2 class="pennant">
    <span class="flag" aria-hidden="true"></span>
    <span class="script">Kraków</span>
    <span class="block">{card.model}</span>
  </h2>

  <svg class="bolt" viewBox="0 0 60 80" aria-hidden="true">
    <path class="shadow" d="M30 2 6 44h18L14 78l40-46H34L46 2z" transform="translate(4 4)" />
    <path class="fill" d="M30 2 6 44h18L14 78l40-46H34L46 2z" />
  </svg>
  <span class="dot" aria-hidden="true"></span>

  <p class="headline">Since<br />{card.year}</p>
  <p class="exif">{card.exif?.camera} · {card.exif?.date}</p>
</SecShell>

<style>
  :global(.d043 .card__front) {
    background: #f4f4f4;
    color: #0d0d0d;
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
    object-position: 80% 62%;
    filter: contrast(1.06) saturate(1.1);
    scale: calc(1.03 + var(--pointer-from-center, 0) * var(--card-opacity, 0) * .04);
    transition: scale 600ms cubic-bezier(.16, 1, .3, 1);
  }
  .shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(10, 10, 14, .78), rgba(10, 10, 14, 0) 34%);
  }

  /* The pennant: a gradient triangle, a script word across it, the italic block word below. */
  .pennant {
    position: absolute;
    left: 5cqw;
    top: 6cqw;
    width: 70cqw;
    height: 34cqw;
    margin: 0;
    translate: calc((var(--pointer-from-left, .5) - .5) * -2cqw) 0;
  }
  .flag {
    position: absolute;
    left: 0;
    top: 0;
    width: 52cqw;
    height: 30cqw;
    background: linear-gradient(120deg, #1f9e7a, #3c4bb0 55%, #6d2f9c);
    clip-path: polygon(0 0, 100% 12%, 8% 100%);
    filter: drop-shadow(1cqw 1cqw 0 #0d0d0d);
  }
  .script {
    position: absolute;
    left: 6cqw;
    top: 4cqw;
    font: 400 12cqw/1 'Yellowtail', cursive;
    color: #ff7ab6;
    rotate: -12deg;
    text-shadow: .6cqw .6cqw 0 #0d0d0d;
  }
  .block {
    position: absolute;
    left: 18cqw;
    top: 15cqw;
    font-family: 'Archivo Variable', var(--latin-condensed);
    font-style: italic;
    font-weight: 900;
    font-stretch: 62%;
    font-size: 15cqw;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: -.01em;
    background: linear-gradient(#ff4f8b, #ff9a3c 70%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(.8cqw .8cqw 0 #0d0d0d);
    -webkit-text-stroke: .25cqw #0d0d0d;
  }

  /* Stickers: flat colour, black outline, a hard black offset shadow. */
  .bolt {
    position: absolute;
    right: 6cqw;
    top: 44cqw;
    width: 15cqw;
    rotate: 14deg;
  }
  .bolt .shadow {
    fill: #0d0d0d;
  }
  .bolt .fill {
    fill: #d7e04a;
    stroke: #0d0d0d;
    stroke-width: 2.4;
    stroke-linejoin: round;
  }
  .dot {
    position: absolute;
    left: 6cqw;
    bottom: 34cqw;
    width: 12cqw;
    height: 12cqw;
    border-radius: 50%;
    background:
      repeating-linear-gradient(35deg, transparent 0 1.6cqw, rgba(13, 13, 13, .85) 1.6cqw 2cqw),
      #f0923a;
    border: .5cqw solid #0d0d0d;
    box-shadow: 1cqw 1cqw 0 #0d0d0d;
  }

  /* The tall condensed headline, bottom right. */
  .headline {
    position: absolute;
    right: 5cqw;
    bottom: 10cqw;
    margin: 0;
    font: 400 11cqw/.92 'Anton', var(--latin-condensed);
    text-transform: uppercase;
    text-align: right;
    color: #f4f4f4;
  }
  .exif {
    position: absolute;
    left: 5cqw;
    bottom: 4.4cqw;
    margin: 0;
    font: 500 2.4cqw/1 var(--mono);
    letter-spacing: .02em;
    color: rgba(244, 244, 244, .85);
  }

  /* The moment: the pennant swings in, then the stickers drop on. */
  :global(.moment) .pennant {
    animation: swing 700ms cubic-bezier(.16, 1, .3, 1) both;
  }
  :global(.moment) .bolt,
  :global(.moment) .dot {
    animation: stick 420ms cubic-bezier(.16, 1, .3, 1) both;
  }
  :global(.moment) .bolt {
    animation-delay: 420ms;
  }
  :global(.moment) .dot {
    animation-delay: 560ms;
  }
  @keyframes swing {
    from {
      opacity: 0;
      transform: rotate(-10deg) translate(-8cqw, -4cqw);
    }
  }
  @keyframes stick {
    from {
      opacity: 0;
      scale: 1.6;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .photo img {
      transition: none;
    }
    :global(.moment) .pennant,
    :global(.moment) .bolt,
    :global(.moment) .dot {
      animation: none;
    }
  }
</style>
