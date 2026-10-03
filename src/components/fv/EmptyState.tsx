import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Friendly empty state with exactly one call-to-action.
 * Promoted from `components/markets/shared.tsx` (which re-exports it).
 */
export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="fv-card-interactive grid place-items-center rounded-2xl bg-card px-6 py-14 text-center shadow-card">
      <div className="grid size-16 place-items-center rounded-2xl bg-tint shadow-tile">
        <Inbox className="size-7 text-primary" aria-hidden />
      </div>
      <h3 className="mt-5 text-xl font-bold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{body}</p>
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
