import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Error state with an optional retry action. Use in place of silent
 * loading/empty renders when a query fails (role="alert").
 */
export function ErrorState({
  title = "Something went wrong",
  body = "We couldn't load this. Check your connection and try again.",
  retryLabel = "Try again",
  onRetry,
}: {
  title?: string;
  body?: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="grid place-items-center rounded-2xl border border-danger/30 bg-danger-soft/40 px-6 py-14 text-center"
    >
      <div className="grid size-14 place-items-center rounded-full bg-danger-soft">
        <AlertTriangle className="size-6 text-danger" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{body}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          <RotateCcw className="size-4" aria-hidden /> {retryLabel}
        </Button>
      )}
    </div>
  );
}
