import { Fingerprint } from "lucide-react";
import { PinPad } from "./PinPad";

/**
 * Full-screen app-lock overlay built on PinPad. Biometric button renders only
 * when `biometricAvailable` is true. "Forgot passcode" routes to onReset.
 */
export function AppLockScreen({
  onComplete,
  error,
  disabled = false,
  cooldownSeconds = 0,
  biometricAvailable = false,
  onBiometric,
  onReset,
  appName = "FinVerse",
}: {
  onComplete: (pin: string) => void;
  error?: string | null;
  disabled?: boolean;
  cooldownSeconds?: number;
  biometricAvailable?: boolean;
  onBiometric?: () => void;
  onReset?: () => void;
  appName?: string;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="App locked"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-2 bg-background px-6"
    >
      <p className="text-sm font-bold text-primary-dark">{appName}</p>
      <PinPad
        title="Enter passcode"
        onComplete={onComplete}
        error={error ?? null}
        disabled={disabled}
        cooldownSeconds={cooldownSeconds}
      />

      {biometricAvailable && onBiometric && (
        <button
          type="button"
          onClick={onBiometric}
          disabled={disabled}
          className="mt-2 flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Fingerprint className="size-5" aria-hidden />
          Use biometrics
        </button>
      )}

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 text-sm font-semibold text-primary hover:underline"
        >
          Forgot passcode?
        </button>
      )}
    </div>
  );
}
