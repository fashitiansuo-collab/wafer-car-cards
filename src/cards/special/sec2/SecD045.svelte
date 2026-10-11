<script lang="ts">
  // d045 — a concours lot. Photographed from behind on the lawn of a concours: the card is set like
  // an auction catalogue entry. A lot number in a high-contrast serif, the title in small capitals,
  // one hairline, the day it was photographed. The moment draws the hairline and lifts the lot in.
  import '@fontsource-variable/bodoni-moda/wght.css';
  import '@fontsource-variable/bodoni-moda/wght-italic.css';
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
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const shot = $derived.by(() => {
    const d = card.exif?.date?.split('/').map(Number);
    return d && d.length === 3 ? `${d[2]} ${MONTHS[d[1] - 1]} ${d[0]}` : String(card.year);
  });
  // "NISSAN" + "Skyline GT-R (R34)" → "Nissan Skyline GT-R"; the trim is on the car's own badge.
  const title = $derived(`${card.year} ${card.maker.charAt(0)}${card.maker.slice(1).toLowerCase()} ${card.model.replace(/\s*\(.*\)/, '')} V·spec II`);
</script>

<SecShell {...props} name="d045" ink="#f5f3ee">
  <div class="photo"><img src="./sec/d045.webp" alt="" draggable="false" /></div>
  <div class="shade"></div>
  <header class="lot">
    <p class="no">Lot {card.no}</p>
    <h2 class="title">{title}</h2>
    <span class="rule"></span>
  </header>
  <p class="shot">Photographed {shot}</p>
</SecShell>

<style>
  :global(.d045 .card__front) {
    background: #0e1320;
    color: #f5f3ee;
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
    object-position: 14% 62%;
    filter: contrast(1.04) saturate(1.04);
    scale: calc(1.03 + var(--pointer-from-center, 0) * var(--card-opacity, 0) * .04);
    transition: scale 600ms cubic-bezier(.16, 1, .3, 1);
  }
  .shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(14, 19, 32, .82), rgba(14, 19, 32, .5) 30%, rgba(14, 19, 32, 0) 50%),
      linear-gradient(to top, rgba(14, 19, 32, .62), rgba(14, 19, 32, 0) 20%);
  }
  .lot {
    position: absolute;
    left: 6cqw;
    right: 6cqw;
    top: 6cqw;
  }
  .no {
    margin: 0;
    font-family: 'Bodoni Moda Variable', serif;
    font-style: italic;
    font-weight: 500;
    font-size: 15cqw;
    line-height: .95;
    letter-spacing: -.02em;
    color: #f5f3ee;
  }
  .title {
    margin: 2.6cqw 0 0;
    font-family: 'Bodoni Moda Variable', serif;
    font-weight: 600;
    font-size: 4.4cqw;
    line-height: 1.2;
    font-variant: small-caps;
    letter-spacing: .06em;
    color: #f5f3ee;
    text-wrap: balance;
  }
  .rule {
    display: block;
    width: 46%;
    height: 1px;
    margin-top: 3.4cqw;
    background: rgba(245, 243, 238, .8);
    transform-origin: 0 50%;
  }
  .shot {
    position: absolute;
    left: 6cqw;
    bottom: 4.6cqw;
    margin: 0;
    font-family: 'Bodoni Moda Variable', serif;
    font-style: italic;
    font-size: 3.2cqw;
    line-height: 1;
    color: rgba(245, 243, 238, .9);
  }

  /* The moment: the hairline draws, the lot number settles in above it. */
  :global(.moment) .rule {
    animation: draw 900ms cubic-bezier(.16, 1, .3, 1) 200ms both;
  }
  :global(.moment) .no,
  :global(.moment) .title {
    animation: lift 800ms cubic-bezier(.16, 1, .3, 1) both;
  }
  :global(.moment) .title {
    animation-delay: 160ms;
  }
  @keyframes draw {
    from {
      transform: scaleX(0);
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
    :global(.moment) .rule,
    :global(.moment) .no,
    :global(.moment) .title {
      animation: none;
    }
  }
</style>
