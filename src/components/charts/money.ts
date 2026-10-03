import { formatINR, formatINRShort } from "@/lib/finance/format";

/** Format full paise as compact tick labels, e.g. ₹40K on a chart axis. */
export function axisTick(paise: number): string {
  return formatINRShort(paise);
}

/**
 * Full-rupee axis labels from integer paise, e.g. 157800 -> "₹1,578".
 * Use for charts whose dataKey is paise — formatting raw paise with a plain
 * ₹ prefix inflates every label 100× (portfolio chart bug, Phase 4 review).
 */
export function paiseAxisTick(paise: number): string {
  return formatINR(paise);
}

/**
 * Y-axis tick positions (integer paise) for money charts, with labels
 * guaranteed unique after rupee rounding.
 *
 * Recharts' auto ticks on a near-flat series emit values like 157750 and
 * 157800 paise that both format to "₹1,578" — duplicate axis labels. This
 * helper spreads `targetCount` ticks across the data range; when the range
 * is so flat that the endpoints would format to the same label, it expands
 * symmetrically until they differ (so the axis never collapses to one
 * repeated label), then drops any interior tick whose formatted label
 * duplicates an earlier one.
 */
export function paiseTicks(valuesPaise: number[], targetCount = 5): number[] {
  if (valuesPaise.length === 0) return [];
  const dataMin = Math.min(...valuesPaise);
  const dataMax = Math.max(...valuesPaise);
  // Expand flat/near-flat ranges until the endpoints format distinctly.
  // (Capped iterations as a safety net; in practice one expansion suffices.)
  let lo = Math.round(dataMin);
  let hi = Math.round(dataMax);
  let pad = 0;
  for (let i = 0; i < 12 && paiseAxisTick(lo) === paiseAxisTick(hi); i++) {
    pad = pad === 0 ? Math.max(Math.round(Math.abs(dataMax) * 0.005), 100) : pad * 2;
    lo = Math.round(dataMin - pad);
    hi = Math.round(dataMax + pad);
  }
  const n = Math.max(2, Math.round(targetCount));
  const seen = new Set<string>();
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const v = Math.round(lo + ((hi - lo) * i) / (n - 1));
    const label = paiseAxisTick(v);
    if (seen.has(label)) continue;
    seen.add(label);
    out.push(v);
  }
  // The endpoints were expanded to distinct labels, so we always have at
  // least 2 — guard anyway for the (impossible) degenerate case.
  if (out.length >= 2) return out;
  return lo === hi ? [lo] : [lo, hi];
}

/** Re-export for convenience in chart files. */
export { formatINR };
