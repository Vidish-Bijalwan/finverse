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

/** Re-export for convenience in chart files. */
export { formatINR };
