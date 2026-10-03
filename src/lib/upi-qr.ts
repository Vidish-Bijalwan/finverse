/**
 * Parse UPI QR payloads (`upi://pay?pa=…&pn=…&am=…&cu=INR`).
 *
 * The Scan-QR quick action decodes camera frames with the native
 * BarcodeDetector; this module turns the raw text into a typed payload the
 * payments flow can act on. Returns null for anything that is not a
 * well-formed UPI pay/collect intent.
 */

export interface UpiPayload {
  /** UPI ID, e.g. "merchant@okhdfcbank". */
  upiId: string;
  /** Payee name (pn param), if the QR carries one. */
  name: string | null;
  /** Integer paise, or null when the QR leaves the amount open. */
  amountPaise: number | null;
}

const UPI_ID_RE = /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/;

/** UPI ID syntax check: local-part@bank-handle (also used by manual entry). */
export function isValidUpiId(id: string): boolean {
  return UPI_ID_RE.test(id.trim());
}

/**
 * Convert a UPI `am` value (rupees, up to 2 decimals) to integer paise.
 * Returns null for malformed values.
 */
export function upiAmountToPaise(am: string | null): number | null {
  if (am === null || am === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(am.trim())) return null;
  const paise = Math.round(Number(am) * 100);
  return Number.isFinite(paise) && paise > 0 ? paise : null;
}

export function parseUpiPayload(raw: string): UpiPayload | null {
  const text = raw.trim();
  if (!/^upi:\/\//i.test(text)) return null;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (host !== "pay" && host !== "collect") return null;

  const pa = url.searchParams.get("pa")?.trim() ?? "";
  if (!UPI_ID_RE.test(pa)) return null;

  const cu = url.searchParams.get("cu");
  if (cu !== null && cu.toUpperCase() !== "INR") return null;

  const pn = url.searchParams.get("pn")?.trim() || null;
  const amountPaise = upiAmountToPaise(url.searchParams.get("am"));

  return { upiId: pa, name: pn, amountPaise };
}
