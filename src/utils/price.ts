/** "$29.99" or "Item total: $39.98" -> 29.99 / 39.98 */
export function toPrice(text: string | null): number {
  const match = (text ?? '').match(/(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`No price found in "${text}"`);
  return Number(match[1]);
}

/** Avoids floating point noise: 0.1 + 0.2 -> 0.3 */
export const round2 = (n: number): number => Math.round(n * 100) / 100;
