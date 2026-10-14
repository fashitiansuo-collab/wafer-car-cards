export type Rarity = 'C' | 'UC' | 'R' | 'UR' | 'SEC' | 'RSEC';

export const RARITIES: Rarity[] = ['C', 'UC', 'R', 'UR', 'SEC'];

export const ALL_RARITIES: Rarity[] = [...RARITIES, 'RSEC'];

export type SeriesId = 1 | 2 | 3;

export const SERIES: SeriesId[] = [1, 2, 3];

export interface CardCredit {
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  modified: boolean;
}

export type Frame = 'gallery' | 'watermark' | 'litt' | 'palette' | 'window';
export const FRAMES: Frame[] = ['gallery', 'watermark', 'litt', 'palette', 'window'];

export interface Exif {
  camera: string | null;
  settings: string | null;
  date: string | null;
}

export interface Card {
  id: string;
  no: number;
  rarity: Rarity;
  /** Which set the card belongs to; a missing series means the first set. */
  series?: SeriesId;
  maker: string;
  model: string;
  year: number;
  country: string;
  image: string;
  focus?: string;
  /** focus was set by hand; scripts/photo-check.py --fit leaves it alone. */
  focusManual?: boolean;
  /** The frame picked for this photo's mood; defaults to 'gallery'. */
  frame?: Frame;
  exif?: Exif;
  /** Five colours of the photo, most common first. */
  palette?: string[];
  spec?: { engine?: string; power?: string; weight?: string; source?: string };
  /** A short note about the car, quoted from Wikipedia (CC BY-SA), credited with its source. */
  flavor?: { text: string; lang: 'ja' | 'en'; source: string; license: string };
  /** RSEC: the ordinary card it poses as until peeled (model is what that card says). */
  stock?: { image: string; model?: string; focus?: string; frame?: Frame; credit: CardCredit; exif?: Exif; palette?: string[] };
  credit: CardCredit;
}

export interface Save {
  v: 1;
  stock: number;
  lastRefillAt: number;
  eaten: number;
  owned: Record<string, number>;
  firstPulledAt: Record<string, number>;
  pending: string | null;
  /** The set whose bag is selected; missing means series 1. */
  series?: SeriesId;
  /** Calories banked per series; a missing key means none. */
  kcal?: Partial<Record<'1' | '2' | '3', number>>;
  /** The opening that is pending is a high-rare guaranteed (pity) pack. */
  pendingPity?: boolean;
  peeled?: Record<string, number>;
}

/** A promo card: given by code, outside the numbered set, with a design of its own. */
export interface Promo {
  id: string;
  code: string;
  maker: string;
  model: string;
  generation: string;
  year: number;
  country: string;
  /** Cut-out of the car (transparent background). */
  image: string;
  /** Centres of the headlights on the cut-out, % of its width and height. */
  lights: [number, number][];
  exif: Exif;
  codeHash: string;
  credit: CardCredit;
  /** Other photographs composited into the design (e.g. wafer pieces), credited on the back too. */
  assets?: CardCredit[];
}
