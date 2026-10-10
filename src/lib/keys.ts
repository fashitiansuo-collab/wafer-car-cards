/**
 * Whether a window-level key press is meant for the screen: not auto-repeat, not already handled,
 * and not aimed at a focused button, link or field (those handle Enter/Space themselves).
 */
export function isGlobalKey(e: KeyboardEvent): boolean {
  if (e.repeat || e.defaultPrevented) return false;
  const t = e.target as Element | null;
  return !(t && typeof t.closest === 'function' && t.closest('button, a, input, select, textarea'));
}
