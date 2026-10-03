import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";

import { useNotifications } from "@/lib/notify";
import { pressable } from "@/components/fv";
import { cn } from "@/lib/utils";

/**
 * Standalone notification bell with an unread badge.
 *
 * Mounted by the app header (coordinator-owned); this component only reads
 * notification state via useNotifications() and links to /notifications.
 * It mounts no providers and touches no header internals.
 */
export function NotificationBell() {
  const { unread } = useNotifications();

  return (
    <Link
      to="/notifications"
      aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
      className={cn(
        pressable,
        "relative grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-muted",
      )}
    >
      <Bell className="size-5" />
      {unread > 0 && (
        <span
          aria-hidden
          className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white"
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
