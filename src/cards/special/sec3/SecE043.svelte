<script lang="ts">
  // e043 — after Paradigm Festival (Awwwards Honorable Mention): a full-bleed photo graded down like
  // a film still, a very wide extended display face in two stacked lines with the second pushed
  // right, a small bold date line above, and a hot light leak burning in from the corners.
  // Here the leak takes the car's own orange. The moment slides the two lines in from opposite sides.
  import '@fontsource/krona-one/400.css';
  import type { Card } from '../../../lib/types';
  import type { Tilt } from '../../../lib/tilt.svelte';
  import SecShell from '../sec2/SecShell.svelte';

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

<SecShell {...props} name="e043" ink="#f1e9dc" holo="rainbow">
  <div class="photo"><img src={card.image} alt="" draggable="false" /></div>
  <div class="grade"></div>
  <div class="leak" aria-hidden="true"></div>
  <p class="date">{card.year} · R26B</p>
  <h2 class="title"><span class="l1">{card.maker}</span><span class="l2">{card.model}</span></h2>
</SecShell>

<style>
  :global(.e043 .card__front) {
    background: #1f1d14;
    color: #f1e9dc;
  }
  .photo {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  /* A film still: colour pulled toward olive and cream, blacks lifted. */
  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 30% 60%;
    filter: saturate(.3) sepia(.45) contrast(1.1) brightness(.62);
    scale: calc(1.04 + var(--pointer-from-center, 0) * var(--card-opacity, 0) * .04);
    transition: scale 600ms cubic-bezier(.16, 1, .3, 1);
  }
  .grade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(31, 29, 20, .5), rgba(31, 29, 20, .15) 40%, rgba(31, 29, 20, .45)),
      linear-gradient(rgba(110, 104, 56, .4), rgba(110, 104, 56, .4));
    mix-blend-mode: multiply;
  }
  /* The leak: hot orange burning in from the top-right and bottom-left corners. */
  .leak {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(70% 45% at 108% -6%, #ff6a00 0, rgba(255, 106, 0, .55) 35%, transparent 70%),
      radial-gradient(55% 35% at -8% 108%, #ff3d00 0, rgba(255, 61, 0, .4) 40%, transparent 70%);
    mix-blend-mode: screen;
    opacity: calc(.85 + var(--pointer-from-center, 0) * .15);
  }
  .date {
    position: absolute;
    left: 6cqw;
    top: 42cqw;
    margin: 0;
    font: 700 4cqw/1 var(--latin);
    letter-spacing: -.02em;
    color: #f1e9dc;
  }
  .title {
    position: absolute;
    left: 5cqw;
    right: 4cqw;
    top: 48cqw;
    margin: 0;
    display: flex;
    flex-direction: column;
    font: 400 9.6cqw/1.02 'Krona One', var(--latin);
    letter-spacing: -.04em;
    text-transform: uppercase;
    color: #ecdfcb;
  }
  .l2 {
    align-self: flex-end;
    font-size: 15cqw;
    line-height: .95;
  }

  /* The moment: the two lines slide in from opposite sides. */
  :global(.moment) .l1 {
    animation: from-left 800ms cubic-bezier(.16, 1, .3, 1) both;
  }
  :global(.moment) .l2 {
    animation: from-right 800ms cubic-bezier(.16, 1, .3, 1) 120ms both;
  }
  @keyframes from-left {
    from {
      opacity: 0;
      translate: -20cqw 0;
    }
  }
  @keyframes from-right {
    from {
      opacity: 0;
      translate: 20cqw 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .photo img {
      transition: none;
    }
    :global(.moment) .l1,
    :global(.moment) .l2 {
      animation: none;
    }
  }
</style>
