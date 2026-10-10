export type Rarity = 'C' | 'UC' | 'R' | 'UR' | 'SEC';

export const RARITIES: Rarity[] = ['C', 'UC', 'R', 'UR', 'SEC'];

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
  maker: string;
  model: string;
  year: number;
  country: string;
  image: string;
  focus?: string;
  /** The frame picked for this photo's mood; defaults to 'gallery'. */
  frame?: Frame;
  exif?: Exif;
  /** Five colours of the photo, most common first. */
  palette?: string[];
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
}
