<script lang="ts">
  // d044 — after Hobro Digital (Awwwards Site of the Day): a warm, close, film-graded photograph
  // full bleed, one giant heavy word cut off by a horizontal line so only its top half shows, and
  // a small monospace caption centred under the cut. The moment raises the word up to the line.
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
  <div class="cut"><h2 class="word">{card.model}</h2></div>
  <p class="caption">{card.year} · 6.3 V8</p>
  <p class="exif">{card.exif?.camera} · {card.exif?.date}</p>
</SecShell>

<style>
  :global(.d044 .card__front) {
    background: #3a1408;
    color: #f6ead4;
  }
  .photo {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  /* Close and warm: the grille and the hood, pushed toward red and amber like a film still. */
  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 86% 62%;
    filter: sepia(.45) saturate(1.5) hue-rotate(-12deg) contrast(1.05) brightness(.92);
    scale: calc(1.06 + var(--pointer-from-center, 0) * var(--card-opacity, 0) * .05);
    transition: scale 600ms cubic-bezier(.16, 1, .3, 1);
  }
  .grade {
    position: absolute;
    inset: 0;
    background: radial-gradient(120% 80% at 60% 60%, transparent 35%, rgba(40, 10, 4, .7));
  }
  /* The warm cast: an orange wash in colour mode, so the grey car turns to amber like the reference. */
  .grade::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, #d2561c, #8f1f0c);
    mix-blend-mode: color;
    opacity: .55;
  }

  /* The cut: the word sits on a line and only its top half shows above it. */
  .cut {
    position: absolute;
    left: 0;
    right: 0;
    top: 30cqw;
    height: 9.2cqw;
    overflow: hidden;
  }
  .word {
    position: absolute;
    left: 4cqw;
    top: 0;
    margin: 0;
    font-family: 'Archivo Variable', var(--latin);
    font-weight: 900;
    font-stretch: 100%;
    font-size: 17cqw;
    line-height: .78;
    letter-spacing: -.05em;
    text-transform: uppercase;
    white-space: nowrap;
    color: #fbf3e6;
    translate: calc((var(--pointer-from-left, .5) - .5) * -3cqw) 0;
  }
  .caption {
    position: absolute;
    left: 0;
    right: 0;
    top: 42cqw;
    margin: 0;
    text-align: center;
    font: 500 3cqw/1 var(--mono);
    letter-spacing: .06em;
    text-transform: uppercase;
    color: rgba(251, 243, 230, .78);
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

  /* The moment: the word rises up to the line. */
  :global(.moment) .word {
    animation: rise 900ms cubic-bezier(.16, 1, .3, 1) both;
  }
  :global(.moment) .caption {
    animation: fade 500ms ease-out 600ms both;
  }
  @keyframes rise {
    from {
      transform: translateY(100%);
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
    :global(.moment) .word,
    :global(.moment) .caption {
      animation: none;
    }
  }
</style>
