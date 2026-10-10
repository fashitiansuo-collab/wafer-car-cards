// Pointer / gyro → spring → CSS variables, after poke-holo (simeydotme/pokemon-cards-css).

const MAX_TILT = 14;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

/** px, py in 0..1 across the element. */
export function pointerToVars(px: number, py: number): Record<string, string> {
  const x = clamp(px);
  const y = clamp(py);
  const fromCenter = clamp(Math.hypot(x - 0.5, y - 0.5) / Math.hypot(0.5, 0.5));
  // A corner is the farthest point, so normalise by the half-diagonal and round to keep 0 and 1 exact.
  return {
    '--pointer-x': `${round(x * 100, 2)}%`,
    '--pointer-y': `${round(y * 100, 2)}%`,
    '--pointer-from-center': `${round(fromCenter)}`,
    '--pointer-from-left': `${round(x)}`,
    '--pointer-from-top': `${round(y)}`,
    '--background-x': `${round(37 + x * 26, 2)}%`,
    '--background-y': `${round(37 + y * 26, 2)}%`,
    '--rotate-x': `${round((0.5 - y) * 2 * MAX_TILT, 2)}deg`,
    '--rotate-y': `${round((x - 0.5) * 2 * MAX_TILT, 2)}deg`,
  };
}

const toStyle = (vars: Record<string, string>, opacity: number) =>
  Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';') + `;--card-opacity:${round(opacity)}`;

const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// poke-holo's interact spring: stiffness .066, damping .25
const STIFFNESS = 0.066;
const DAMPING = 0.25;

export interface Tilt {
  readonly style: string;
  readonly active: boolean;
  attach(el: HTMLElement): () => void;
  /** iOS needs a user gesture before deviceorientation fires. */
  askGyro(): Promise<void>;
  /** Drive the tilt from code (e.g. a reveal sweep). */
  set(px: number, py: number, opacity?: number): void;
  release(): void;
}

export function createTilt(): Tilt {
  let style = $state(toStyle(pointerToVars(0.5, 0.5), 0));
  let active = $state(false);

  const pos = { x: 0.5, y: 0.5, o: 0 };
  const vel = { x: 0, y: 0, o: 0 };
  const target = { x: 0.5, y: 0.5, o: 0 };
  let raf = 0;

  function frame() {
    let moving = false;
    for (const k of ['x', 'y', 'o'] as const) {
      vel[k] = (vel[k] + (target[k] - pos[k]) * STIFFNESS) * (1 - DAMPING);
      pos[k] += vel[k];
      if (Math.abs(target[k] - pos[k]) > 0.0005 || Math.abs(vel[k]) > 0.0005) moving = true;
      else pos[k] = target[k];
    }
    style = toStyle(pointerToVars(pos.x, pos.y), pos.o);
    raf = moving ? requestAnimationFrame(frame) : 0;
  }

  function set(px: number, py: number, opacity = 1) {
    target.x = clamp(px);
    target.y = clamp(py);
    target.o = clamp(opacity);
    active = opacity > 0;
    if (reducedMotion()) {
      Object.assign(pos, target);
      style = toStyle(pointerToVars(pos.x, pos.y), pos.o);
      return;
    }
    if (!raf && typeof requestAnimationFrame !== 'undefined') raf = requestAnimationFrame(frame);
  }

  function release() {
    set(0.5, 0.5, 0);
  }

  function attach(el: HTMLElement) {
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      set((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      // Phone held upright at ~45°; ±25° of travel covers the card.
      set(0.5 + e.gamma / 50, 0.5 + (e.beta - 45) / 50, 0.8);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onMove);
    el.addEventListener('pointerleave', release);
    el.addEventListener('pointercancel', release);
    window.addEventListener('deviceorientation', onOrient);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onMove);
      el.removeEventListener('pointerleave', release);
      el.removeEventListener('pointercancel', release);
      window.removeEventListener('deviceorientation', onOrient);
      if (raf) cancelAnimationFrame(raf);
    };
  }

  async function askGyro() {
    const D = (globalThis as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } })
      .DeviceOrientationEvent;
    if (D?.requestPermission) {
      try {
        await D.requestPermission();
      } catch {
        // Declined: pointer input still works.
      }
    }
  }

  return {
    get style() { return style; },
    get active() { return active; },
    attach,
    askGyro,
    set,
    release,
  };
}
