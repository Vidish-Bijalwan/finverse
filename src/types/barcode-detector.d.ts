/**
 * Minimal typing for the native BarcodeDetector API (Chromium/Edge).
 * Used by the QR scanner; feature-detected at runtime — absence is a normal
 * path (graceful manual-entry fallback), not an error.
 */

interface BarcodeDetectorResult {
  rawValue: string;
}

interface BarcodeDetectorInstance {
  detect(source: HTMLVideoElement | HTMLImageElement): Promise<BarcodeDetectorResult[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats: string[] }): BarcodeDetectorInstance;
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export {};
