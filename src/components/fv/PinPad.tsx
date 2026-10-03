import { useEffect, useRef, useState } from "react";
import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";
import { KeyButton } from "./KeyButton";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const LENGTH = 6;

function formatCooldown(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}

/**
 * 6-dot PIN entry. Hollow dots fill as digits are typed; the PIN digits are
 * NEVER rendered. On 6 digits, onComplete(pin) fires and the buffer clears.
 * Error state: shake animation + message (role="alert"). Disabled state:
 * keypad locked with a live cooldown countdown.
 */
export function PinPad({
  onComplete,
  error,
  disabled = false,
  cooldownSeconds = 0,
  title = "Enter PIN",
  className,
}: {
  onComplete: (pin: string) => void;
  error?: string | null;
  disabled?: boolean;
  /** Remaining lockout seconds; counts down while disabled. */
  cooldownSeconds?: number;
  title?: string;
  className?: string;
}) {
  const [pin, setPin] = useState("");
  const [shaking, setShaking] = useState(false);
  const [remaining, setRemaining] = useState(cooldownSeconds);
  const reduced = usePrefersReducedMotion();
  const completedRef = useRef(false);

  // Cooldown countdown while locked out.
  useEffect(() => {
    setRemaining(cooldownSeconds);
    if (cooldownSeconds <= 0) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldownSeconds, disabled]);

  // Shake + clear on error.
  useEffect(() => {
    if (!error) return;
    setPin("");
    completedRef.current = false;
    if (reduced) return;
    setShaking(true);
    const id = window.setTimeout(() => setShaking(false), 500);
    return () => window.clearTimeout(id);
  }, [error, reduced]);

  const press = (d: string) => {
    if (disabled || completedRef.current || pin.length >= LENGTH) return;
    const next = pin + d;
    if (next.length === LENGTH) {
      completedRef.current = true;
      onComplete(next);
      setPin("");
    } else {
      setPin(next);
    }
  };

  const backspace = () => {
    if (disabled || completedRef.current) return;
    setPin((p) => p.slice(0, -1));
  };

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <style>{`
        @keyframes fv-pin-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .fv-pin-shake { animation: fv-pin-shake 0.45s ease; }
        @media (prefers-reduced-motion: reduce) {
          .fv-pin-shake { animation: none; }
        }
      `}</style>

      <h2 className="text-lg font-bold text-foreground">{title}</h2>

      <div
        className={cn("flex items-center gap-3", shaking && "fv-pin-shake")}
        role="group"
        aria-label={`PIN entry, ${pin.length} of ${LENGTH} digits entered`}
      >
        {Array.from({ length: LENGTH }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "grid size-4 place-items-center rounded-full border-2",
              error
                ? "border-danger"
                : i < pin.length
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/40",
            )}
          />
        ))}
      </div>

      {error ? (
        <p role="alert" className="text-sm font-semibold text-danger">
          {error}
        </p>
      ) : (
        <p className="h-5 text-sm text-muted-foreground" aria-hidden>
          {disabled && remaining > 0 ? `Try again in ${formatCooldown(remaining)}` : ""}
        </p>
      )}

      <div className="grid w-full max-w-64 grid-cols-3 gap-2" role="group" aria-label="PIN keypad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <PinKey key={d} label={d} disabled={disabled} onPress={() => press(d)} />
        ))}
        <span aria-hidden />
        <PinKey label="0" disabled={disabled} onPress={() => press("0")} />
        <KeyButton
          label="Delete last digit"
          disabled={disabled || pin.length === 0}
          onPress={backspace}
          className="grid h-14 place-items-center rounded-2xl bg-keypad text-keypad-foreground"
        >
          <Delete className="size-6" aria-hidden />
        </KeyButton>
      </div>
    </div>
  );
}

function PinKey({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <KeyButton
      label={label}
      disabled={disabled}
      onPress={onPress}
      className="h-14 rounded-2xl bg-keypad text-xl font-semibold text-keypad-foreground tabular-nums"
    >
      {label}
    </KeyButton>
  );
}
