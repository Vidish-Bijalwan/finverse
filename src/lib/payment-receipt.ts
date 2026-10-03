/**
 * Payment receipts — downloadable text receipts for test-rail payments.
 *
 * buildReceiptText is pure and unit-tested; downloadReceipt triggers the
 * browser download. The receipt states exactly what happened (rail, status,
 * reference) and that no real money moved.
 */

import { formatINR } from "./finance/format";

export interface ReceiptData {
  statusLabel: string;
  amountPaise: number;
  counterparty: string;
  railLabel: string;
  referenceId?: string | undefined;
  timestamp?: string | undefined;
  note?: string | undefined;
}

/** Render a plain-text receipt. */
export function buildReceiptText(r: ReceiptData): string {
  const lines = [
    "FinVerse AI — Payment Receipt (Test Mode)",
    "==========================================",
    `Status:      ${r.statusLabel}`,
    `Amount:      ${formatINR(r.amountPaise)}`,
    `Paid to:     ${r.counterparty}`,
    `Rail:        ${r.railLabel}`,
  ];
  if (r.referenceId) lines.push(`Reference:   ${r.referenceId}`);
  if (r.timestamp) lines.push(`Time:        ${r.timestamp}`);
  if (r.note) lines.push(`Note:        ${r.note}`);
  lines.push("", "This was a simulated test payment.", "No real money moved.");
  return lines.join("\n");
}

/** Trigger a download of the receipt as a .txt file. */
export function downloadReceipt(r: ReceiptData, filename: string): void {
  const blob = new Blob([buildReceiptText(r)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
