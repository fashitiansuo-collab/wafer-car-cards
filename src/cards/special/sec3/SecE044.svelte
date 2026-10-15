<script lang="ts">
  // e044 — after ArkDes: Lewerentz Exhibition (Awwwards Honorable Mention): a pale blue-grey ground,
  // the photograph hung on it as one panel, a small "ROOM" label over a hanging serif title in
  // capitals, a short serif caption, and a row of room numbers with the current one underlined.
  // The car is photographed on show in a museum, so it is set as one room of an exhibition.
  // The moment draws the underline across to the current room.
  import '@fontsource/libre-caslon-text/400.css';
  import '@fontsource/libre-caslon-text/400-italic.css';
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

<SecShell {...props} name="e044" ink="#1d2233" holo="secret">
  <div class="panel"><img src={card.image} alt="" draggable="false" /></div>
  <p class="room">Room 1</p>
  <h2 class="title">GT-One<br />Le Mans</h2>
  <p class="caption">Built by Toyota to race at Le Mans in 1998.</p>
  <ol class="rooms" aria-hidden="true">
    <li class="on">1</li><li>2</li><li>3</li><li>4</li><li>5</li><li>6</li>
  </ol>
</SecShell>

<style>
  :global(.e044 .card__front) {
    background: #a6b0cf;
    color: #1d2233;
  }
  /* The photograph hangs as a single panel, flush to the top edge like the reference's columns. */
  .panel {
    position: absolute;
    left: 7cqw;
    right: 7cqw;
    top: 0;
    height: 74cqw;
    overflow: hidden;
  }
  .panel img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 50%;
    filter: saturate(.92) contrast(1.02);
    scale: calc(1.03 + var(--pointer-from-center, 0) * var(--card-opacity, 0) * .04);
    transition: scale 600ms cubic-bezier(.16, 1, .3, 1);
  }
  .room {
    position: absolute;
    left: 7cqw;
    top: 81cqw;
    margin: 0;
    font: 400 2.6cqw/1 'Libre Caslon Text', serif;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .title {
    position: absolute;
    left: 7cqw;
    top: 86cqw;
    margin: 0;
    font: 400 7.4cqw/1 'Libre Caslon Text', serif;
    letter-spacing: -.01em;
    text-transform: uppercase;
  }
  .caption {
    position: absolute;
    left: 52cqw;
    right: 7cqw;
    top: 86cqw;
    margin: 0;
    font: 400 2.9cqw/1.35 'Libre Caslon Text', serif;
  }
  .rooms {
    position: absolute;
    left: 7cqw;
    bottom: 5cqw;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 5cqw;
    list-style: none;
    font: 400 2.6cqw/1 'Libre Caslon Text', serif;
  }
  .rooms li {
    position: relative;
    padding-bottom: 1.2cqw;
  }
  .rooms .on::after {
    content: '';
    position: absolute;
    left: -1.6cqw;
    right: -1.6cqw;
    bottom: 0;
    height: 1px;
    background: currentColor;
    transform-origin: 0 50%;
  }

  /* The moment: the underline is drawn under the current room, then the caption fades up. */
  :global(.moment) .rooms .on::after {
    animation: draw 900ms cubic-bezier(.16, 1, .3, 1) 200ms both;
  }
  :global(.moment) .caption {
    animation: fade 700ms ease-out 500ms both;
  }
  @keyframes draw {
    from {
      transform: scaleX(0);
    }
  }
  @keyframes fade {
    from {
      opacity: 0;
      translate: 0 1.5cqw;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .panel img {
      transition: none;
    }
    :global(.moment) .rooms .on::after,
    :global(.moment) .caption {
      animation: none;
    }
  }
</style>
