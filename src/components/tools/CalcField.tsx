import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { parseStrictDecimal } from "@/lib/parse-decimal";

export type CalcFieldFormat = "rupees" | "percent" | "months" | "years" | "plain";

const SUFFIX: Record<CalcFieldFormat, string> = {
  rupees: "₹",
  percent: "%",
  months: "mo",
  years: "yr",
  plain: "",
};

interface CalcFieldProps {
  label: string;
  /** Current numeric value. */
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: CalcFieldFormat;
  /** Validation message for the current value, or null. */
  error?: string | null;
  helper?: string;
  id?: string;
}

/**
 * Combined numeric input + slider for calculator inputs.
 * The text field is free-typing friendly; the slider commits clamped values.
 */
export function CalcField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format = "rupees",
  error,
  helper,
  id,
}: CalcFieldProps) {
  const [text, setText] = useState(() => String(value));

  // Keep the text box in sync when the value changes externally (slider / prefill).
  useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = (raw: string) => {
    setText(raw);
    // Strict decimal parse: "1e5", "0x10", "" and trailing garbage never
    // commit, so the slider/value only ever see real numbers.
    const parsed = parseStrictDecimal(raw);
    if (Number.isNaN(parsed)) return;
    // Commit the raw value; limits live on the slider and in validation text,
    // so free typing never fights the user mid-keystroke.
    onChange(parsed);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <div className="relative w-36 shrink-0">
          <Input
            id={id}
            inputMode="decimal"
            value={text}
            onChange={(e) => commit(e.target.value)}
            onBlur={() => setText(String(value))}
            className={cn(
              "pr-10 text-right font-semibold tabular-nums",
              error && "border-destructive focus-visible:ring-destructive/40",
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            {SUFFIX[format]}
          </span>
        </div>
      </div>
      <Slider
        value={[Math.min(max, Math.max(min, value))]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => {
          if (v !== undefined) onChange(v);
        }}
        aria-label={label}
        className={cn(error && "[&_[role=slider]]:border-destructive")}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}
