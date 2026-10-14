<script lang="ts">
  // An RSEC card: it looks like an ordinary common (the `top` snippet) until it is peeled from its
  // bottom-right corner, uncovering the real card underneath (`under`).
  // The flap is the back of the paper, shaded along the fold like the pleats of moooi "Paper Play".
  import type { Snippet } from 'svelte';
  import { peel, type Pt } from './peel';

  interface Props {
    top: Snippet;
    under: Snippet;
    /** Already peeled: show the real card. */
    peeled?: boolean;
    /** Allow peeling (the result and detail screens). Without it the card is just the common. */
    canPeel?: boolean;
    onPeel?: () => void;
  }
  let { top, under, peeled = false, canPeel = false, onPeel }: Props = $props();

  let el: HTMLElement | undefined = $state();
  let w = $state(0);
  let h = $state(0);
  // Where the corner is: null = resting (a small dog-ear when peelable).
  let corner = $state<Pt | null>(null);
  let dragging = $state(false);
  let done = $state(false);
  let raf = 0;

  const open = $derived(peeled || done);
  const rest = $derived<Pt>({ x: w * 0.9, y: h * 0.93 });
  const at = $derived(corner ?? (canPeel ? rest : { x: w, y: h }));
  const geo = $derived(w && h ? peel(w, h, at) : null);

  $effect(() => {
    if (!el) return;
    const ro = new ResizeObserver(() => {
      w = el!.clientWidth;
      h = el!.clientHeight;
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  });

  function local(e: PointerEvent): Pt {
    const r = el!.getBoundingClientRect();
    return { x: Math.max(-w, Math.min(w, e.clientX - r.left)), y: Math.max(-h, Math.min(h, e.clientY - r.top)) };
  }

  function down(e: PointerEvent) {
    if (!canPeel || open) return;
    const p = local(e);
    // Start only near the corner (the bottom-right third of the card).
    if (p.x < w * 0.62 || p.y < h * 0.66) return;
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    el!.setPointerCapture(e.pointerId);
    corner = p;
  }
  function move(e: PointerEvent) {
    if (dragging) corner = local(e);
  }
  function up() {
    if (!dragging) return;
    dragging = false;
    if (geo && geo.amount > 0.45) finish();
    else animateTo(rest, () => (corner = null));
  }

  function animateTo(to: Pt, then: () => void, ms = 360) {
    const from = { ...at };
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      corner = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e };
      if (k < 1) raf = requestAnimationFrame(step);
      else then();
    };
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(step);
  }

  /** Peel all the way (the guide button, Enter, or a long enough drag). */
  export function finish() {
    if (open) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const end = () => {
      done = true;
      corner = null;
      onPeel?.();
    };
    if (reduce) end();
    else animateTo({ x: -w * 0.9, y: -h * 0.9 }, end, 520);
  }
</script>

<div
  class="peel"
  class:can={canPeel && !open}
  class:dragging
  class:resting={canPeel && !open && corner === null}
  bind:this={el}
  role="presentation"
  onpointerdown={down}
  onpointermove={move}
  onpointerup={up}
  onpointercancel={up}
>
  {#if open || canPeel}
    <div class="under">{@render under()}</div>
  {/if}
  {#if canPeel && !open}
    <!-- Keyboard path: the dog-ear itself is a button. -->
    <button class="ear" aria-label="カードの角" onclick={finish}></button>
  {/if}
  {#if !open}
    <div class="top" style="clip-path:{geo?.flat ?? 'none'}">{@render top()}</div>
    {#if geo && geo.amount > 0}
      <div class="flap-shadow" aria-hidden="true">
        <div class="flap" style="clip-path:{geo.flap};--a:{geo.angle}deg"></div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .peel {
    position: relative;
    width: 100%;
    aspect-ratio: 63 / 88;
    container-type: inline-size;
  }
  .peel.can {
    touch-action: none;
    cursor: grab;
  }
  .peel.dragging {
    cursor: grabbing;
  }
  .under,
  .top {
    position: absolute;
    inset: 0;
  }
  .top {
    z-index: 1;
  }
  /* The lifted flap: the paper's back, darker at the fold, lighter at the edge; grain like Paper Play. */
  .flap-shadow {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    filter: drop-shadow(-.6cqw -.6cqw 1.4cqw rgba(0, 0, 0, .35));
  }
  .flap {
    position: absolute;
    inset: 0;
    background:
      url('/fx/noise.png') 0 0 / 120px,
      linear-gradient(calc(var(--a) + 180deg), #b9b5ad 0%, #e9e6df 38%, #f6f4ef 70%, #dedad2 100%);
    background-blend-mode: soft-light, normal;
    border-radius: 2.4cqw;
  }
  .ear {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 3;
    width: 14%;
    height: 10%;
    padding: 0;
    border: 0;
    background: none;
    pointer-events: none;
  }
  .ear:focus-visible {
    outline: 1px solid var(--sel-frame);
    outline-offset: 2px;
  }
  /* A hint: the resting dog-ear breathes a little. */
  .resting .flap-shadow {
    animation: breathe 2.4s ease-in-out infinite;
  }
  @keyframes breathe {
    50% {
      translate: -.4% -.4%;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .resting .flap-shadow {
      animation: none;
    }
  }
</style>
