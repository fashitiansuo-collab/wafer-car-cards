<script lang="ts">
  import { createTilt } from '../lib/tilt.svelte';
  import Icon from '../ui/Icon.svelte';
  import { TEAR_Y, tearPath } from './tear';

  interface Props {
    /** Called once the strip has fallen away. */
    onTorn: () => void;
    disabled?: boolean;
    /** Series 1 is the silver vanilla bag, series 2 the bronze chocolate one. */
    series?: 1 | 2;
    /** The high-rare guaranteed pack: a gold label marked UR+. */
    premium?: boolean;
  }
  let { onTorn, disabled = false, series = 1, premium = false }: Props = $props();

  const seed = Math.floor(Math.random() * 1e6);
  const tilt = createTilt();
  let el: HTMLElement;
  let progress = $state(0);
  let dragging = $state(false);
  let off = $state(false);
  let auto = 0;
  let fallTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => (el ? tilt.attach(el) : undefined));
  // Leaving the screen mid-tear must not open a bag later from another screen.
  $effect(() => () => {
    if (auto) cancelAnimationFrame(auto);
    clearTimeout(fallTimer);
  });

  function finish() {
    if (off) return;
    progress = 1;
    off = true;
    fallTimer = setTimeout(onTorn, 480);
  }

  function advance(p: number) {
    if (off || disabled) return;
    progress = Math.max(progress, p);
    if (progress >= 0.7) finish();
  }

  function local(e: PointerEvent) {
    const r = el.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  }

  function down(e: PointerEvent) {
    if (disabled || off) return;
    const p = local(e);
    // The tear starts at the notch: the top quarter of the bag.
    if (p.y > 0.28) return;
    dragging = true;
    el.setPointerCapture(e.pointerId);
    advance(p.x * 0.5);
  }
  function move(e: PointerEvent) {
    if (dragging) advance(local(e).x);
  }
  function up() {
    dragging = false;
  }

  /** Enter / the guide button: tear by itself over 600ms. */
  export function autoTear() {
    if (disabled || off || auto) return;
    const from = progress;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 600);
      progress = from + (1 - from) * k;
      if (k < 1) auto = requestAnimationFrame(step);
      else finish();
    };
    auto = requestAnimationFrame(step);
  }
</script>

<div
  class="bag"
  class:choco={series === 2}
  class:premium
  class:disabled
  class:dragging
  class:off
  style="{tilt.style};--tear-y:{TEAR_Y}%;--p:{progress}"
  bind:this={el}
  onpointerdown={down}
  onpointermove={move}
  onpointerup={up}
  onpointercancel={up}
  role="button"
  tabindex="-1"
  aria-label="袋の上端をなぞって破る"
>
  <div class="rot">
    <div class="piece body" style="clip-path:{tearPath(progress, seed, 'body')}">
      {@render art()}
    </div>
    <div class="piece top" style="clip-path:{tearPath(progress, seed, 'top')}">
      {@render art()}
    </div>
    <span class="notch" aria-hidden="true"></span>
  </div>
</div>

{#snippet art()}
  <div class="art">
    <div class="crimp crimp--top"></div>
    <div class="label">
      <div class="mark"><Icon name="mark" size="100%" /></div>
      <p class="name">WAFER</p>
      <p class="sub">{series === 2 ? 'CHOCOLATE' : 'CAR CARD COLLECTION'}</p>
      <p class="no">{premium ? 'No. 0' + series + ' · UR+ GUARANTEED' : 'No. 0' + series + ' · 1 CARD INSIDE'}</p>
    </div>
    <div class="crimp crimp--bottom"></div>
    <div class="glare"></div>
  </div>
{/snippet}

<style>
  .bag {
    position: relative;
    width: 58%;
    aspect-ratio: 5 / 8;
    container-type: inline-size;
    perspective: 700px;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    cursor: grab;
  }
  .bag.dragging {
    cursor: grabbing;
  }
  .bag.disabled {
    filter: brightness(.35) saturate(.6);
    cursor: default;
  }
  .rot {
    position: absolute;
    inset: 0;
    transform: rotateY(calc(var(--rotate-y) * .6)) rotateX(calc(var(--rotate-x) * .6));
    transform-style: preserve-3d;
  }
  .piece {
    position: absolute;
    inset: 0;
  }
  /* The strip lifts a little as the tear runs, so the jagged gap shows. */
  .top {
    transform-origin: 100% var(--tear-y);
    transform: translateY(calc(var(--p) * -3.5cqw)) rotate(calc(var(--p) * -4deg));
  }
  .off .top {
    animation: fall 480ms cubic-bezier(.4, 0, .9, .6) forwards;
  }
  @keyframes fall {
    to {
      transform: translate(-30cqw, 120cqw) rotate(-38deg);
      opacity: 0;
    }
  }

  .art {
    position: absolute;
    inset: 0;
    background:
      url('/fx/noise.png'),
      conic-gradient(
        from calc(200deg + var(--rotate-y) * 3) at 30% 40%,
        #c9ced6, #8d939c, #eef0f3, #7a8089, #b9bec6, #f4f5f7, #8a9099, #c9ced6
      );
    background-size: 96px, 100% 100%;
    background-blend-mode: soft-light, normal;
    overflow: hidden;
  }
  /* Series 2: bronze foil round a chocolate label. */
  .choco .art {
    background-image:
      url('/fx/noise.png'),
      conic-gradient(
        from calc(200deg + var(--rotate-y) * 3) at 30% 40%,
        #9a6a48, #4a2a1a, #d6a77e, #3b2115, #8a5a3a, #e8c4a0, #4f2d1c, #9a6a48
      );
  }
  .choco .label {
    background: #20120b;
    box-shadow: inset 0 0 0 1px rgba(232, 196, 160, .18);
  }
  .choco .sub {
    color: #d9b08a;
  }
  /* The high-rare guaranteed pack: gold foil, a gold rule round the label. */
  .premium .art {
    background-image:
      url('/fx/glitter.png'),
      conic-gradient(
        from calc(200deg + var(--rotate-y) * 3) at 30% 40%,
        #e9c76a, #8a6516, #fff3c4, #6e4f10, #d4a93c, #fff8dc, #7d5a14, #e9c76a
      );
    background-size: 160px, 100% 100%;
    background-blend-mode: overlay, normal;
  }
  .premium .label {
    box-shadow: inset 0 0 0 1px #e9c76a, inset 0 0 0 .9cqw #141518, inset 0 0 0 calc(.9cqw + 1px) rgba(233, 199, 106, .45);
  }
  .premium .no {
    color: #f1d58a;
    border-top-color: rgba(233, 199, 106, .5);
  }
  .crimp {
    position: absolute;
    left: 0;
    right: 0;
    height: 5%;
    background: repeating-linear-gradient(90deg, rgba(0, 0, 0, .18) 0 .8cqw, rgba(255, 255, 255, .25) .8cqw 1.6cqw);
  }
  .crimp--top { top: 0; }
  .crimp--bottom { bottom: 0; }

  .label {
    position: absolute;
    left: 9%;
    right: 9%;
    top: 22%;
    bottom: 14%;
    background: #141518;
    color: var(--paper);
    padding: 7cqw 7cqw;
    display: flex;
    flex-direction: column;
    gap: 2.4cqw;
  }
  .mark {
    width: 16cqw;
    height: 16cqw;
    color: var(--paper);
    margin-bottom: auto;
  }
  .label p {
    margin: 0;
  }
  .name {
    font: 700 19cqw/.9 var(--latin-condensed);
    letter-spacing: .02em;
  }
  .sub {
    font: 600 6cqw/1.05 var(--latin-condensed);
    letter-spacing: .06em;
    color: var(--paper-2);
  }
  .no {
    padding-top: 3cqw;
    border-top: 1px solid var(--line-2);
    font: 500 3.6cqw/1 var(--latin);
    letter-spacing: .1em;
    color: var(--paper-2);
  }
  .glare {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      farthest-corner circle at var(--pointer-x) var(--pointer-y),
      hsla(0, 0%, 100%, .7) 8%,
      hsla(0, 0%, 100%, .2) 30%,
      hsla(0, 0%, 0%, .35) 90%
    );
    mix-blend-mode: overlay;
    opacity: calc(.3 + var(--card-opacity) * .5);
    pointer-events: none;
  }
  .notch {
    position: absolute;
    left: -1px;
    top: calc(var(--tear-y) - 1.6cqw);
    border: 1.6cqw solid transparent;
    border-left-color: var(--ink-1);
    opacity: calc(1 - var(--p) * 4);
  }

  @media (prefers-reduced-motion: reduce) {
    .off .top {
      animation-duration: 1ms;
    }
  }
</style>
