import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  BellRing,
  CalendarClock,
  CheckCheck,
  Flame,
  Lightbulb,
  PiggyBank,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, pressable } from "@/components/fv";
import { cn } from "@/lib/utils";
import { useNotifications, type AppNotification } from "@/lib/notify";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — FinVerse AI" },
      {
        name: "description",
        content:
          "Bills due, budget alerts, goal milestones, anomalies and streaks — all in one place.",
      },
    ],
  }),
  component: NotificationsPage,
});

const GROUP_META: Record<AppNotification["kind"], { label: string; icon: LucideIcon }> = {
  bill: { label: "Bills due", icon: CalendarClock },
  budget: { label: "Budgets", icon: PiggyBank },
  goal: { label: "Goals", icon: Target },
  anomaly: { label: "Unusual spending", icon: Zap },
  streak: { label: "Streaks", icon: Flame },
  price: { label: "Price alerts", icon: BellRing },
  info: { label: "Updates", icon: Lightbulb },
};

const GROUP_ORDER: AppNotification["kind"][] = [
  "bill",
  "price",
  "budget",
  "goal",
  "anomaly",
  "streak",
  "info",
];

/** "2026-10-03T12:00:00.000Z" -> "3 Oct, 12:00" (local). */
function timeLabel(iso: string): string {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const hasTime = iso.length > 10;
  return `${d.getDate()} ${months[d.getMonth()]}${hasTime ? `, ${hh}:${mm}` : ""}`;
}

function NotificationsPage() {
  const { notifications, unread, isRead, markAllRead, isLoading, isError, refetch } =
    useNotifications();

  const groups = GROUP_ORDER.map((kind) => ({
    kind,
    items: notifications.filter((n) => n.kind === kind),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="mt-2 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-primary">
              <Bell className="size-4" /> NOTIFICATIONS
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              {isLoading
                ? "Loading notifications"
                : isError
                  ? "Couldn't load notifications"
                  : unread > 0
                    ? `${unread} unread`
                    : "You're all caught up"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Bills due, budget alerts, goal milestones, anomaly flags and streaks — generated from
              your real data.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className={`mt-1 shrink-0 gap-1.5 ${pressable}`}
            onClick={markAllRead}
            disabled={unread === 0 || isLoading || isError}
          >
            <CheckCheck className="size-4" aria-hidden />
            Mark all read
          </Button>
        </header>

        <div className="mt-6 grid gap-6">
          {isLoading && (
            <div className="grid gap-3" aria-label="Loading notifications">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          )}

          {!isLoading && isError && (
            <ErrorState
              title="Couldn't load your notifications"
              body="We couldn't check what's new. Check your connection and try again."
              onRetry={() => void refetch()}
            />
          )}

          {!isLoading && !isError && notifications.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center px-6 py-12 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-primary/10">
                  <Bell className="size-6 text-primary" />
                </span>
                <h2 className="mt-4 text-lg font-bold">Nothing to flag right now</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  When a bill is due soon, a budget is nearly used up, a goal hits a milestone, or
                  spending looks unusual, it will show up here.
                </p>
                <Button variant="outline" size="sm" className={`mt-4 ${pressable}`} asChild>
                  <Link to="/insights">See AI insights</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {groups.map((group) => {
            const meta = GROUP_META[group.kind];
            const GroupIcon = meta.icon;
            return (
              <section key={group.kind} aria-label={meta.label}>
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  <GroupIcon className="size-4" aria-hidden />
                  {meta.label}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                    {group.items.length}
                  </span>
                </h2>
                <ul className="mt-3 grid gap-3">
                  {group.items.map((n) => {
                    const read = isRead(n.id);
                    return (
                      <li key={n.id}>
                        <Link
                          to={n.to}
                          className={cn(
                            "flex gap-3 rounded-xl border bg-card p-4 text-card-foreground transition-colors hover:border-primary/40",
                            read && "opacity-70",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-1 size-2 shrink-0 rounded-full",
                              read ? "bg-muted-foreground/40" : "bg-primary",
                            )}
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold leading-snug">{n.title}</span>
                            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                              {n.body}
                            </span>
                            <span className="mt-2 block text-xs text-muted-foreground">
                              {timeLabel(n.createdAt)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
