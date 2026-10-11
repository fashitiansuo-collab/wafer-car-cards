<script lang="ts">
  // d043 — a car-meet flyer. A summer-evening meet outside an arena, people gathered round the
  // car: the card reads like the poster for that night. Heavy italic condensed name, one yellow
  // slanted tag with the place and date of the photo, the camera line. The moment slaps the tag on.
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

<SecShell {...props} name="d043" ink="#f4f1ea">
  <div class="photo"><img src="./sec/d043.webp" alt="" draggable="false" /></div>
  <div class="shade"></div>
  <h2 class="name">{card.model}</h2>
  <p class="tag"><span>Kraków · 05.06.2025</span></p>
  <p class="exif">{card.exif?.camera} · {card.exif?.settings}</p>
</SecShell>

<style>
  :global(.d043 .card__front) {
    background: #0d0d0d;
    color: #f4f1ea;
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
    filter: contrast(1.08) saturate(1.06);
    scale: calc(1.03 + var(--pointer-from-center, 0) * var(--card-opacity, 0) * .04);
    transition: scale 600ms cubic-bezier(.16, 1, .3, 1);
  }
  /* Dark at the top for the name, at the foot for the camera line. */
  .shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(13, 13, 13, .78), rgba(13, 13, 13, 0) 38%),
      linear-gradient(to top, rgba(13, 13, 13, .7), rgba(13, 13, 13, 0) 22%);
  }
  .name {
    position: absolute;
    left: 5cqw;
    right: 5cqw;
    top: 4.5cqw;
    margin: 0;
    font-family: 'Archivo Variable', var(--latin-condensed);
    font-style: italic;
    font-weight: 900;
    font-stretch: 62%;
    font-size: 27cqw;
    line-height: .82;
    letter-spacing: -.02em;
    text-transform: uppercase;
    color: #f4f1ea;
    translate: calc((var(--pointer-from-left, .5) - .5) * -2cqw) 0;
  }
  /* The tag: a slanted strip of the car's own yellow, like a meet sticker. */
  .tag {
    position: absolute;
    left: 5cqw;
    top: 30cqw;
    margin: 0;
    padding: 1.6cqw 3.4cqw;
    background: #f2c200;
    transform: skewX(-14deg);
    box-shadow: 0 .8cqw 2.4cqw rgba(0, 0, 0, .35);
  }
  .tag span {
    display: block;
    transform: skewX(14deg);
    font-family: 'Archivo Variable', var(--latin-condensed);
    font-style: italic;
    font-weight: 800;
    font-stretch: 75%;
    font-size: 4.6cqw;
    line-height: 1;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: #0d0d0d;
  }
  .exif {
    position: absolute;
    left: 5cqw;
    bottom: 4.4cqw;
    margin: 0;
    font: 500 2.4cqw/1 var(--mono);
    letter-spacing: .02em;
    color: rgba(244, 241, 234, .82);
  }

  /* The moment: the name drops in, then the tag is slapped on. */
  :global(.moment) .name {
    animation: drop 700ms cubic-bezier(.16, 1, .3, 1) both;
  }
  :global(.moment) .tag {
    animation: slap 420ms cubic-bezier(.16, 1, .3, 1) 520ms both;
  }
  @keyframes drop {
    from {
      opacity: 0;
      translate: 0 -6cqw;
    }
  }
  @keyframes slap {
    from {
      opacity: 0;
      transform: skewX(-14deg) scale(1.5) rotate(-4deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .photo img {
      transition: none;
    }
    :global(.moment) .name,
    :global(.moment) .tag {
      animation: none;
    }
  }
</style>
