import { formatINR, formatINRShort } from "@/lib/finance/format";

/** Format full paise as compact tick labels, e.g. ₹40K on a chart axis. */
export function axisTick(paise: number): string {
  return formatINRShort(paise);
}

/** Re-export for convenience in chart files. */
export { formatINR };
