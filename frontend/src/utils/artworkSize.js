// Classifies an artwork into a simple, buyer-friendly size tier based on its
// longest edge. Thresholds are in centimetres and are easy to retune below —
// they don't need to match any backend enum, this is purely a browsing aid.
//
// If your backend ever starts storing an explicit size category (e.g.
// artwork.size_category = 'LARGE'), getSizeCategory() will prefer that value
// over the computed one, so this keeps working either way.

export const SIZE_TIERS = [
  { key: 'SMALL', label: 'Small', maxCm: 40 },
  { key: 'MEDIUM', label: 'Medium', maxCm: 80 },
  { key: 'LARGE', label: 'Large', maxCm: 120 },
  { key: 'STATEMENT', label: 'Statement', maxCm: Infinity },
];

const TIERS_BY_KEY = Object.fromEntries(SIZE_TIERS.map((t) => [t.key, t]));

/**
 * @param {{ dimensions_h_cm?: number, dimensions_w_cm?: number, size_category?: string }} artwork
 * @returns {{ key: string, label: string } | null}
 */
export function getSizeCategory(artwork = {}) {
  if (artwork.size_category && TIERS_BY_KEY[artwork.size_category]) {
    return TIERS_BY_KEY[artwork.size_category];
  }

  const longestEdge = Math.max(artwork.dimensions_h_cm || 0, artwork.dimensions_w_cm || 0);
  if (!longestEdge) return null;

  return SIZE_TIERS.find((tier) => longestEdge <= tier.maxCm) || SIZE_TIERS[SIZE_TIERS.length - 1];
}
