import type { Card, SeriesId } from './types';

/** Which series a card belongs to; a missing series means the first set. */
export function seriesOf(card: Card): SeriesId {
  return card.series ?? 1;
}

export function cardsOf(cards: Card[], s: SeriesId): Card[] {
  return cards.filter((c) => seriesOf(c) === s);
}