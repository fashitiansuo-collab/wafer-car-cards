import { describe, expect, it } from 'vitest';
import { isGlobalKey } from '../src/lib/keys';

const ev = (o: Partial<{ repeat: boolean; defaultPrevented: boolean; target: unknown }>) =>
  ({ repeat: false, defaultPrevented: false, target: null, ...o }) as unknown as KeyboardEvent;
const el = (inControl: boolean) => ({ closest: () => (inControl ? {} : null) });

describe('isGlobalKey', () => {
  it('accepts a plain key press on the page', () => {
    expect(isGlobalKey(ev({ target: el(false) }))).toBe(true);
  });
  it('ignores auto-repeat', () => {
    expect(isGlobalKey(ev({ repeat: true }))).toBe(false);
  });
  it('leaves focused buttons and links to themselves', () => {
    expect(isGlobalKey(ev({ target: el(true) }))).toBe(false);
  });
  it('ignores events already handled', () => {
    expect(isGlobalKey(ev({ defaultPrevented: true }))).toBe(false);
  });
});
