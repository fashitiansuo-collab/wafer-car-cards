<script lang="ts">
  // d044 — a 1970 brochure page. An everyday car park, an old car in a faded grey: the card sets the
  // photograph as a plate on a dark brown page, graded like a print from the year the car was built,
  // under the name and three warm supergraphic stripes. The moment draws the stripes in.
  import '@fontsource/shrikhand/400.css';
  import '@fontsource-variable/archivo/wdth.css';
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

<SecShell {...props} name="d044" ink="#f6ead4">
  <div class="photo"><img src="./sec/d044.webp" alt="" draggable="false" /></div>
  <div class="grade"></div>
  <div class="stripes" aria-hidden="true"><i></i><i></i><i></i></div>
  <h2 class="name">{card.model}</h2>
  <p class="year">{card.year}</p>
  <p class="exif">{card.exif?.camera} · {card.exif?.date}</p>
</SecShell>

<style>
  :global(.d044 .card__front) {
    background: #24180f;
    color: #f6ead4;
  }
  /* The plate: the photograph across the page, most of the car in view. */
  .photo {
    position: absolute;
    left: 0;
    right: 0;
    top: 37%;
    bottom: 13%;
    overflow: hidden;
  }
  /* A 1970 print: warm, lifted blacks, a little less colour. */
  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 62% 56%;
    filter: sepia(.3) saturate(.88) contrast(.92) brightness(1.06);
    scale: calc(1.02 + var(--pointer-from-center, 0) * var(--card-opacity, 0) * .04);
    transition: scale 600ms cubic-bezier(.16, 1, .3, 1);
  }
  .grade {
    position: absolute;
    left: 0;
    right: 0;
    top: 37%;
    bottom: 13%;
    background: linear-gradient(rgba(240, 180, 110, .12), rgba(240, 180, 110, .12));
    box-shadow: inset 0 0 6cqw rgba(36, 24, 15, .5);
    pointer-events: none;
  }
  /* Three stripes across the page between the name and the plate, ending in a slant. */
  .stripes {
    position: absolute;
    left: 0;
    right: 0;
    top: 27%;
    display: grid;
    gap: 1cqw;
  }
  .stripes i {
    height: 2.6cqw;
    clip-path: polygon(0 0, 100% 0, calc(100% - 2.6cqw) 100%, 0 100%);
    transform-origin: 0 50%;
  }
  .stripes i:nth-child(1) {
    width: 100%;
    background: #f0a22b;
  }
  .stripes i:nth-child(2) {
    width: 92%;
    background: #e5671e;
  }
  .stripes i:nth-child(3) {
    width: 84%;
    background: #c23a20;
  }
  .name {
    position: absolute;
    left: 5cqw;
    top: 6cqw;
    margin: 0;
    font: 400 18cqw/1 'Shrikhand', serif;
    letter-spacing: -.01em;
    color: #f6ead4;
  }
  .year {
    position: absolute;
    left: 5.6cqw;
    top: 27cqw;
    margin: 0;
    font-family: 'Archivo Variable', var(--latin);
    font-weight: 800;
    font-stretch: 125%;
    font-size: 6cqw;
    line-height: 1;
    letter-spacing: .08em;
    color: #f6ead4;
  }
  .exif {
    position: absolute;
    left: 5cqw;
    bottom: 4.4cqw;
    margin: 0;
    font: 500 2.4cqw/1 var(--mono);
    letter-spacing: .02em;
    color: rgba(246, 234, 212, .82);
  }

  /* The moment: the stripes run in from the left, one after another. */
  :global(.moment) .stripes i {
    animation: run 640ms cubic-bezier(.16, 1, .3, 1) both;
  }
  :global(.moment) .stripes i:nth-child(2) {
    animation-delay: 90ms;
  }
  :global(.moment) .stripes i:nth-child(3) {
    animation-delay: 180ms;
  }
  :global(.moment) .year {
    animation: fade 500ms ease-out 520ms both;
  }
  @keyframes run {
    from {
      transform: scaleX(0);
    }
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .photo img {
      transition: none;
    }
    :global(.moment) .stripes i,
    :global(.moment) .year {
      animation: none;
    }
  }
</style>
