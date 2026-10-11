<script lang="ts">
  import { biteMask, bitesToFinish, RIM, type Bite } from './bite';

  interface Props {
    /** Series 1 is a vanilla cream wafer, series 2 a single-layer cocoa wafer. */
    flavor?: 'vanilla' | 'choco';
    /** One crumb of the last bite sparkles. */
    sparkle?: boolean;
    onEaten: () => void;
  }
  let { flavor = 'vanilla', sparkle = false, onEaten }: Props = $props();

  interface Crumb {
    id: number;
    x: number;
    y: number;
    dx: number;
    rot: number;
    size: number;
    gold: boolean;
    /** Which bit of the wafer texture the crumb carries. */
    bx: number;
    by: number;
  }

  const total = bitesToFinish(Math.random);
  let bites = $state<Bite[]>([]);
  let crumbs = $state<Crumb[]>([]);
  let gone = $state(false);
  let el: HTMLElement;
  let nextId = 0;

  // The body (cut face) loses exactly the bite; the top surface sits a little further back,
  // so a rim of the cut face shows round every bite.
  const mask = $derived(biteMask(bites));
  const topMask = $derived(biteMask(bites, RIM));
  const css = (m: { image: string; composite: string }) =>
    `mask-image:${m.image || 'none'};mask-composite:${m.composite || 'add'}`;

  function addCrumbs(b: Bite, last: boolean) {
    const n = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const c: Crumb = {
        id: nextId++,
        x: b.x + (Math.random() - 0.5) * 18,
        y: b.y + (Math.random() - 0.5) * 10,
        dx: (Math.random() - 0.5) * 30,
        rot: (Math.random() - 0.5) * 540,
        size: 1.6 + Math.random() * 2.4,
        gold: last && sparkle && i === 0,
        bx: Math.random() * 100,
        by: Math.random() * 100,
      };
      crumbs.push(c);
      setTimeout(() => (crumbs = crumbs.filter((k) => k.id !== c.id)), c.gold ? 1400 : 900);
    }
  }

  /** Bite at a point (0..100 %), or somewhere on the uneaten edge when omitted. */
  export function bite(x?: number, y?: number) {
    if (gone) return;
    const b: Bite =
      x == null || y == null
        ? { x: [12, 88, 30, 70, 50, 20][bites.length % 6], y: [15, 30, 85, 70, 45, 55][bites.length % 6] }
        : { x, y };
    bites.push(b);
    const last = bites.length >= total;
    addCrumbs(b, last);
    if (last) {
      gone = true;
      setTimeout(onEaten, sparkle ? 900 : 420);
    }
  }

  function tap(e: PointerEvent) {
    const r = el.getBoundingClientRect();
    bite(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
  }
</script>

<div class="wafer-wrap {flavor}" bind:this={el}>
  <button class="wafer" class:gone style={css(mask)} onpointerdown={tap} aria-label="かじる">
    <span class="top" style={css(topMask)}></span>
  </button>
  {#each crumbs as c (c.id)}
    <span
      class="crumb"
      class:gold={c.gold}
      style="left:{c.x}%;top:{c.y}%;--dx:{c.dx}cqw;--rot:{c.rot}deg;--s:{c.size}cqw;--bx:{c.bx}%;--by:{c.by}%"
    ></span>
  {/each}
</div>

<style>
  .wafer-wrap {
    position: absolute;
    inset: -4%;
    container-type: inline-size;
    pointer-events: none;
  }
  /* Photographic textures (scripts/make-wafer.py): the lattice top and the cut face. */
  .vanilla {
    --top: url('/wafer/vanilla-top.webp');
    --side: url('/wafer/vanilla-side.webp');
    --side-h: 4.4cqw;
    --edge: rgba(96, 58, 20, .55);
  }
  .choco {
    --top: url('/wafer/choco-top.webp');
    --side: url('/wafer/choco-side.webp');
    --side-h: 2.6cqw;
    --edge: rgba(20, 10, 6, .6);
  }
  .wafer-wrap {
    filter: drop-shadow(0 1.6cqw 2.4cqw rgba(0, 0, 0, .45));
  }
  /* The body is the cut face: it shows along the front edge and as the rim of every bite. */
  .wafer {
    position: absolute;
    inset: 0;
    padding: 0;
    border: 0;
    border-radius: 1.2cqw;
    pointer-events: auto;
    cursor: pointer;
    background: var(--side) 0 100% / auto var(--side-h) repeat;
    transition: opacity var(--t-page) var(--ease-standard);
  }
  .wafer:focus-visible {
    outline: 1px solid var(--sel-frame);
    outline-offset: 4px;
  }
  /* The top surface: one light from the upper left, darker toward the edges. */
  .top {
    position: absolute;
    inset: 0 0 var(--side-h) 0;
    border-radius: 1.2cqw 1.2cqw .6cqw .6cqw;
    background:
      radial-gradient(130% 90% at 28% 18%, rgba(255, 246, 225, .22), transparent 55%),
      linear-gradient(transparent 82%, rgba(0, 0, 0, .14)),
      var(--top) 0 0 / 64cqw auto repeat;
    box-shadow:
      inset 0 0 0 .5cqw var(--edge),
      inset 0 0 3cqw rgba(0, 0, 0, .25),
      inset 0 .4cqw .2cqw rgba(255, 240, 210, .25);
  }
  .wafer.gone {
    opacity: 0;
    pointer-events: none;
  }
  .crumb {
    position: absolute;
    width: var(--s);
    height: calc(var(--s) * .8);
    background: var(--top) var(--bx) var(--by) / 40cqw auto;
    clip-path: polygon(10% 0, 100% 20%, 80% 100%, 0 70%);
    animation: crumb 900ms cubic-bezier(.4, 0, .9, .5) forwards;
  }
  .crumb.gold {
    width: 3.2cqw;
    height: 3.2cqw;
    background: url('/fx/glitter.png') center / 200%, radial-gradient(#fff6c8, #e0b400 60%, #8a6516);
    clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
    animation: crumb 1400ms cubic-bezier(.4, 0, .9, .5) forwards, glint 350ms ease-in-out 3;
  }
  @keyframes crumb {
    to {
      transform: translate(var(--dx), 70cqw) rotate(var(--rot));
      opacity: 0;
    }
  }
  @keyframes glint {
    50% {
      filter: brightness(2.2);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .crumb {
      animation-duration: 1ms;
    }
  }
</style>
