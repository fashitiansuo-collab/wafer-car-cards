export type Rarity = 'C' | 'UC' | 'R' | 'UR' | 'SEC';

export const RARITIES: Rarity[] = ['C', 'UC', 'R', 'UR', 'SEC'];

export interface CardCredit {
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  modified: boolean;
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
