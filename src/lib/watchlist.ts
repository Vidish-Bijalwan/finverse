import { useMutation, useQuery, useQueryClient, type MutateOptions } from "@tanstack/react-query";

import type { FinanceDB } from "./finance/types";
import { getStock } from "./market/data";
import { getLTP } from "./market/history";
import { formatINR } from "./finance/format";

/**
 * Stock watchlist with price alerts, persisted in localStorage.
 *
 * Prices are the demo jittered LTPs from lib/market/history (mock "live"
 * prices that move slightly on refresh). When an alert's condition is met,
 * `watchlistAlerts()` produces a notification-shaped object for the
 * notifications aggregator — the plain structural type below is kept
 * intentionally independent of any other worker's notification types.
 */

export type AlertKind = "above" | "below";

export interface PriceAlert {
  id: string;
  kind: AlertKind;
  /** Integer paise threshold. */
  pricePaise: number;
  createdAt: string;
}

export interface WatchlistEntry {
  /** Stock symbol, e.g. "RELIANCE". */
  symbol: string;
  alerts: PriceAlert[];
  addedAt: string;
}

export const WATCHLIST_KEY = "finverse:watchlist:v1";

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

/** Notification-shaped object produced when an alert condition is met. */
export interface WatchlistNotification {
  id: string;
  kind: "price";
  title: string;
  body: string;
  /** Route the notification deep-links to. */
  to: string;
  createdAt: string;
}

function isValidEntry(v: unknown): v is WatchlistEntry {
  if (typeof v !== "object" || v === null) return false;
  const e = v as Record<string, unknown>;
  if (typeof e["symbol"] !== "string" || (e["symbol"] as string).length === 0) return false;
  if (!Array.isArray(e["alerts"])) return false;
  return (e["alerts"] as unknown[]).every((a) => {
    if (typeof a !== "object" || a === null) return false;
    const al = a as Record<string, unknown>;
    return (
      typeof al["id"] === "string" &&
      (al["kind"] === "above" || al["kind"] === "below") &&
      typeof al["pricePaise"] === "number" &&
      Number.isInteger(al["pricePaise"]) &&
      (al["pricePaise"] as number) > 0
    );
  });
}

/** Load the watchlist. SSR-safe: returns [] on the server. */
export function loadWatchlist(): WatchlistEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(WATCHLIST_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

/** Persist the watchlist. No-op on the server. */
export function saveWatchlist(entries: WatchlistEntry[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(entries));
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function assertPaise(amountPaise: number): void {
  if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
    throw new Error(`Alert price must be a positive integer number of paise, got ${amountPaise}`);
  }
}

/** Add a stock from the market universe. Throws on unknown symbols. Idempotent. */
export function addToWatchlist(entries: WatchlistEntry[], symbol: string): WatchlistEntry[] {
  const upper = symbol.trim().toUpperCase();
  if (!getStock(upper)) throw new Error(`Unknown stock symbol: ${symbol}`);
  if (entries.some((e) => e.symbol === upper)) return entries;
  return [...entries, { symbol: upper, alerts: [], addedAt: new Date().toISOString() }];
}

export function removeFromWatchlist(entries: WatchlistEntry[], symbol: string): WatchlistEntry[] {
  return entries.filter((e) => e.symbol !== symbol.trim().toUpperCase());
}

export function addPriceAlert(
  entries: WatchlistEntry[],
  symbol: string,
  kind: AlertKind,
  pricePaise: number,
): WatchlistEntry[] {
  assertPaise(pricePaise);
  const upper = symbol.trim().toUpperCase();
  return entries.map((e) =>
    e.symbol === upper
      ? {
          ...e,
          alerts: [
            ...e.alerts,
            { id: newId(), kind, pricePaise, createdAt: new Date().toISOString() },
          ],
        }
      : e,
  );
}

export function removePriceAlert(
  entries: WatchlistEntry[],
  symbol: string,
  alertId: string,
): WatchlistEntry[] {
  const upper = symbol.trim().toUpperCase();
  return entries.map((e) =>
    e.symbol === upper ? { ...e, alerts: e.alerts.filter((a) => a.id !== alertId) } : e,
  );
}

/** Is this alert's condition currently met at the given LTP? */
export function isAlertMet(alert: PriceAlert, ltpPaise: number): boolean {
  return alert.kind === "above" ? ltpPaise >= alert.pricePaise : ltpPaise <= alert.pricePaise;
}

/**
 * Evaluate every watchlist alert against current mock LTPs and return one
 * notification-shaped object per alert whose condition is currently met.
 * The `db` param keeps the signature compatible with a notifications
 * aggregator that passes the finance DB (the watchlist itself is stored
 * separately under WATCHLIST_KEY).
 */
export function watchlistAlerts(_db: FinanceDB): WatchlistNotification[] {
  const entries = loadWatchlist();
  const out: WatchlistNotification[] = [];
  const now = new Date().toISOString();
  for (const entry of entries) {
    const ltp = getLTP(entry.symbol);
    if (ltp <= 0) continue;
    const stock = getStock(entry.symbol);
    const name = stock?.name ?? entry.symbol;
    for (const alert of entry.alerts) {
      if (!isAlertMet(alert, ltp)) continue;
      const direction = alert.kind === "above" ? "rose above" : "fell below";
      out.push({
        id: `watchlist-${entry.symbol}-${alert.id}`,
        kind: "price",
        title: `${entry.symbol} price alert`,
        body: `${name} ${direction} your ${alert.kind} alert of ${formatINR(alert.pricePaise)} — now at ${formatINR(ltp)}.`,
        to: "/watchlist",
        createdAt: now,
      });
    }
  }
  return out;
}

// ---- React Query hooks ----

const QK_WATCHLIST = ["finverse", "watchlist"] as const;

type WatchlistMutation = (entries: WatchlistEntry[]) => WatchlistEntry[];
type WatchlistMutateOptions = MutateOptions<WatchlistEntry[], Error, WatchlistMutation>;

export function useWatchlist() {
  return useQuery({ queryKey: QK_WATCHLIST, queryFn: loadWatchlist });
}

function useMutateWatchlist() {
  const qc = useQueryClient();
  return useMutation<WatchlistEntry[], Error, WatchlistMutation>({
    mutationFn: async (fn) => {
      const next = fn(loadWatchlist());
      saveWatchlist(next);
      return next;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_WATCHLIST }),
  });
}

export function useAddToWatchlist() {
  const m = useMutateWatchlist();
  return {
    ...m,
    mutateAdd: (symbol: string, options?: WatchlistMutateOptions) =>
      m.mutate((e) => addToWatchlist(e, symbol), options),
  };
}

export function useRemoveFromWatchlist() {
  const m = useMutateWatchlist();
  return {
    ...m,
    mutateRemove: (symbol: string, options?: WatchlistMutateOptions) =>
      m.mutate((e) => removeFromWatchlist(e, symbol), options),
  };
}

export function useAddPriceAlert() {
  const m = useMutateWatchlist();
  return {
    ...m,
    mutateAddAlert: (
      symbol: string,
      kind: AlertKind,
      pricePaise: number,
      options?: WatchlistMutateOptions,
    ) => m.mutate((e) => addPriceAlert(e, symbol, kind, pricePaise), options),
  };
}

export function useRemovePriceAlert() {
  const m = useMutateWatchlist();
  return {
    ...m,
    mutateRemoveAlert: (symbol: string, alertId: string, options?: WatchlistMutateOptions) =>
      m.mutate((e) => removePriceAlert(e, symbol, alertId), options),
  };
}

export { QK_WATCHLIST as WATCHLIST_QUERY_KEY };
