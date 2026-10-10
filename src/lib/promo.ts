/** Promo codes are stored only as SHA-256 hashes, so the public source does not give them away. */

export function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[\s-]+/g, '');
}

async function sha256(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** The id of the promo this code unlocks, or null. */
export async function redeem(code: string, promos: { id: string; codeHash: string }[]): Promise<string | null> {
  const norm = normalizeCode(code);
  if (!norm) return null;
  const hash = await sha256(norm);
  return promos.find((p) => p.codeHash === hash)?.id ?? null;
}
