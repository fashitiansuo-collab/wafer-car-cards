// Geometry of peeling a card from its bottom-right corner, like a sticker.
// The corner K is dragged to the pointer P. The fold is the perpendicular bisector of KP:
// the part of the card on P's side stays flat, the part on K's side is lifted and lies
// reflected across the fold (the flap, showing the paper's back).

export interface Pt {
  x: number;
  y: number;
}

/** Points of the polygon `poly` on the side where (X - m)·d <= 0 (Sutherland–Hodgman). */
export function clipHalf(poly: Pt[], m: Pt, d: Pt): Pt[] {
  const side = (p: Pt) => (p.x - m.x) * d.x + (p.y - m.y) * d.y;
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const sa = side(a);
    const sb = side(b);
    if (sa <= 0) out.push(a);
    if ((sa < 0 && sb > 0) || (sa > 0 && sb < 0)) {
      const t = sa / (sa - sb);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return out;
}

/** Reflect a point across the line through m perpendicular to d. */
export function reflect(p: Pt, m: Pt, d: Pt): Pt {
  const len2 = d.x * d.x + d.y * d.y || 1;
  const k = (2 * ((p.x - m.x) * d.x + (p.y - m.y) * d.y)) / len2;
  return { x: p.x - k * d.x, y: p.y - k * d.y };
}

export interface Peel {
  /** What stays flat, as a CSS polygon() in px. */
  flat: string;
  /** The lifted flap, already reflected, as a CSS polygon() in px. */
  flap: string;
  /** Angle of the fold's normal (deg), for the flap's shading. */
  angle: number;
  /** 0 (untouched) … 1 (the corner has reached the far corner). */
  amount: number;
}

const poly = (pts: Pt[]) => (pts.length ? `polygon(${pts.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(',')})` : 'polygon(0 0)');

/** The peel of a w × h card whose bottom-right corner has been pulled to p. */
export function peel(w: number, h: number, p: Pt): Peel {
  const k = { x: w, y: h };
  const d = { x: k.x - p.x, y: k.y - p.y };
  const len = Math.hypot(d.x, d.y);
  const rect = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ];
  if (len < 0.5) return { flat: poly(rect), flap: 'polygon(0 0)', angle: 45, amount: 0 };
  const m = { x: (k.x + p.x) / 2, y: (k.y + p.y) / 2 };
  const flat = clipHalf(rect, m, d);
  const lifted = clipHalf(rect, m, { x: -d.x, y: -d.y }).map((q) => reflect(q, m, d));
  return {
    flat: poly(flat),
    flap: poly(lifted),
    angle: (Math.atan2(d.y, d.x) * 180) / Math.PI,
    amount: Math.min(1, len / Math.hypot(w, h)),
  };
}
