<script lang="ts">
  import { biteMask, bitesToFinish, type Bite } from './bite';

  interface Props {
    /** One crumb of the last bite sparkles. */
    sparkle?: boolean;
    onEaten: () => void;
  }
  let { sparkle = false, onEaten }: Props = $props();

  interface Crumb {
    id: number;
    x: number;
    y: number;
    dx: number;
    rot: number;
    size: number;
    gold: boolean;
  }

  const total = bitesToFinish(Math.random);
  let bites = $state<Bite[]>([]);
  let crumbs = $state<Crumb[]>([]);
  let gone = $state(false);
  let el: HTMLElement;
  let nextId = 0;

  const mask = $derived(biteMask(bites));

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

<div class="wafer-wrap" bind:this={el}>
  <button
    class="wafer"
    class:gone
    style="mask-image:{mask.image || 'none'};mask-composite:{mask.composite || 'add'}"
    onpointerdown={tap}
    aria-label="かじる"
  >
    <span class="cream"></span>
  </button>
  {#each crumbs as c (c.id)}
    <span
      class="crumb"
      class:gold={c.gold}
      style="left:{c.x}%;top:{c.y}%;--dx:{c.dx}cqw;--rot:{c.rot}deg;--s:{c.size}cqw"
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
  .wafer {
    position: absolute;
    inset: 0;
    pointer-events: auto;
    cursor: pointer;
    background:
      repeating-linear-gradient(45deg, rgba(120, 72, 22, .4) 0 .35cqw, transparent .35cqw 4.2cqw),
      repeating-linear-gradient(-45deg, rgba(120, 72, 22, .4) 0 .35cqw, transparent .35cqw 4.2cqw),
      radial-gradient(circle at 30% 25%, #f0c27e, #d9a35b 55%, #b98034);
    box-shadow: inset 0 0 0 1.2cqw rgba(160, 104, 40, .55);
    transition: opacity var(--t-page) var(--ease-standard);
  }
  .wafer:focus-visible {
    outline: 1px solid var(--sel-frame);
    outline-offset: 4px;
  }
  /* The cream layer shows as a pale line across the middle of the side. */
  .cream {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2.4cqw;
    background: linear-gradient(#f6ead2 0 40%, #c58c46 40% 60%, #f6ead2 60%);
  }
  .wafer.gone {
    opacity: 0;
    pointer-events: none;
  }
  .crumb {
    position: absolute;
    width: var(--s);
    height: calc(var(--s) * .8);
    background: #d39a52;
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
