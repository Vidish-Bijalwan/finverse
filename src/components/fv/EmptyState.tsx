import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Compact empty state with at most one call-to-action.
 * Promoted from `components/markets/shared.tsx` (which re-exports it).
 *
 * Brief §23: empty states stay compact (≤220px tall) — small icon, short
 * copy, one small CTA. Callers that need only a single line can omit `body`.
 */
export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border/60 bg-card px-4 py-5 text-center">
      <div className="grid size-10 place-items-center rounded-xl bg-tint">
        <Inbox className="size-5 text-primary" aria-hidden />
      </div>
      <h3 className="mt-2.5 text-sm font-bold text-foreground">{title}</h3>
      {body && <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">{body}</p>}
      {actionLabel && onAction && (
        <Button size="sm" className="mt-3" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
