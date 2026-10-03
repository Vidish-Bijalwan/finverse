import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, Keyboard, Loader2, X } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { pressable } from "@/components/fv";
import { cn } from "@/lib/utils";
import { parseUpiPayload, type UpiPayload } from "@/lib/upi-qr";

type Phase = "starting" | "scanning" | "denied" | "unavailable" | "manual" | "error";

const UPI_ID_RE = /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/;

/**
 * QR scanner for UPI payments.
 *
 * Primary path: rear camera via getUserMedia + the native BarcodeDetector
 * (Chromium/Edge). Decoded text is parsed as a UPI intent; anything else is
 * rejected with an honest message.
 *
 * Fallbacks (all real, no dead ends): camera denied / no camera /
 * no BarcodeDetector / decode failures → manual UPI ID entry (name + optional
 * amount). The dialog never pretends a scan succeeded.
 */
export function QrScannerDialog({
  open,
  onOpenChange,
  onScan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (payload: UpiPayload) => void;
}) {
  const [phase, setPhase] = useState<Phase>("starting");
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const detectorRef = useRef<{
    detect(v: HTMLVideoElement): Promise<{ rawValue: string }[]>;
  } | null>(null);
  const scannedRef = useRef(false);

  const stopAll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    detectorRef.current = null;
    scannedRef.current = false;
  }, []);

  const startCamera = useCallback(async () => {
    setPhase("starting");
    setError(null);
    try {
      if (!window.BarcodeDetector) {
        setPhase("unavailable");
        return;
      }
      const md = navigator.mediaDevices;
      if (!md?.getUserMedia) {
        setPhase("unavailable");
        return;
      }
      detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
      const stream = await md.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stopAll();
        setPhase("error");
        return;
      }
      video.srcObject = stream;
      await video.play().catch(() => {});
      setPhase("scanning");

      const loop = async () => {
        if (scannedRef.current) return;
        try {
          const results = await detectorRef.current?.detect(video);
          const raw = results?.[0]?.rawValue?.trim();
          if (raw) {
            const payload = parseUpiPayload(raw);
            if (payload) {
              scannedRef.current = true;
              stopAll();
              onScan(payload);
              return;
            }
            setError("That QR code isn't a UPI payment code. Try another one.");
          }
        } catch {
          // A single failed frame is not fatal; keep scanning.
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      stopAll();
      if (
        e instanceof DOMException &&
        (e.name === "NotAllowedError" || e.name === "SecurityError")
      ) {
        setPhase("denied");
      } else if (e instanceof DOMException && e.name === "NotFoundError") {
        setPhase("unavailable");
      } else {
        setPhase("error");
        setError(e instanceof Error ? e.message : "Couldn't start the camera.");
      }
    }
  }, [onScan, stopAll]);

  useEffect(() => {
    if (open) void startCamera();
    return () => stopAll();
  }, [open, startCamera, stopAll]);

  const close = () => onOpenChange(false);

  /** Stop the camera before switching to manual entry (releases the lens). */
  const goManual = () => {
    stopAll();
    setPhase("manual");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Scan a UPI QR code</DialogTitle>
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-base font-bold text-foreground">Scan QR code</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close scanner"
            className={cn(
              pressable,
              "grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="px-5 pb-5">
          {(phase === "starting" || phase === "scanning") && (
            <div className="mt-3">
              <div className="relative overflow-hidden rounded-2xl bg-black">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="aspect-square w-full object-cover"
                  aria-label="Camera viewfinder"
                />
                {phase === "starting" && (
                  <div className="absolute inset-0 grid place-items-center bg-black/60">
                    <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
                  </div>
                )}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-8 rounded-xl border-2 border-primary"
                />
              </div>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                {phase === "starting" ? "Starting camera…" : "Point the camera at a UPI QR code."}
              </p>
              {error && phase === "scanning" && (
                <p role="alert" className="mt-2 text-center text-sm font-semibold text-loss">
                  {error}
                </p>
              )}
              {phase === "scanning" && (
                <button
                  type="button"
                  onClick={goManual}
                  className={cn(
                    pressable,
                    "mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-bold text-foreground hover:bg-muted/60",
                  )}
                >
                  <Keyboard className="size-4" aria-hidden /> Enter UPI ID instead
                </button>
              )}
            </div>
          )}

          {(phase === "denied" || phase === "unavailable" || phase === "error") && (
            <div className="mt-3 flex flex-col items-center gap-3 py-6 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-muted">
                {phase === "denied" ? (
                  <Camera className="size-6 text-muted-foreground" aria-hidden />
                ) : (
                  <AlertTriangle className="size-6 text-muted-foreground" aria-hidden />
                )}
              </span>
              <p className="max-w-60 text-sm text-muted-foreground">
                {phase === "denied" &&
                  "Camera access was blocked. Allow camera permission in your browser to scan, or enter the UPI ID manually."}
                {phase === "unavailable" &&
                  "Camera scanning isn't available on this device or browser. Enter the UPI ID manually instead."}
                {phase === "error" && (error ?? "Couldn't start the camera.")}
              </p>
              <button
                type="button"
                onClick={goManual}
                className={cn(
                  pressable,
                  "flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover",
                )}
              >
                <Keyboard className="size-4" aria-hidden /> Enter UPI ID manually
              </button>
              {(phase === "denied" || phase === "error") && (
                <button
                  type="button"
                  onClick={() => void startCamera()}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Try the camera again
                </button>
              )}
            </div>
          )}

          {phase === "manual" && <ManualEntry onScan={onScan} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ManualEntry({ onScan }: { onScan: (p: UpiPayload) => void }) {
  const [upiId, setUpiId] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);

  const idValid = UPI_ID_RE.test(upiId.trim());
  const amountPaise =
    amount.trim() === ""
      ? null
      : /^\d+(\.\d{1,2})?$/.test(amount.trim())
        ? Math.round(Number(amount) * 100)
        : -1;

  const canSubmit = idValid && amountPaise !== -1;

  return (
    <form
      className="mt-3 flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!canSubmit) return;
        onScan({
          upiId: upiId.trim(),
          name: name.trim() || null,
          amountPaise: amountPaise === 0 ? null : amountPaise,
        });
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold text-foreground">UPI ID</span>
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="name@bank"
          autoComplete="off"
          autoFocus
          className="h-12 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        {touched && !idValid && (
          <span className="text-xs font-semibold text-loss">
            Enter a valid UPI ID, like name@okhdfcbank.
          </span>
        )}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold text-foreground">
          Payee name <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Corner Store"
          maxLength={60}
          className="h-12 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold text-foreground">
          Amount <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="₹ amount"
          className="h-12 rounded-xl border border-input bg-background px-3 text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        {touched && amountPaise === -1 && (
          <span className="text-xs font-semibold text-loss">Enter an amount like 250.50.</span>
        )}
      </label>
      <button
        type="submit"
        className={cn(
          pressable,
          "mt-1 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40",
        )}
        disabled={!canSubmit}
      >
        Continue to payment
      </button>
    </form>
  );
}
