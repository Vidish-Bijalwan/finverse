import { useCallback, useSyncExternalStore } from "react";

import type { FinanceDB, Transaction } from "./finance/types";

/**
 * App-level personalization settings, persisted in localStorage.
 *
 * - theme: "light" | "dark" | "system" (system = follow OS preference)
 * - monthStartDay: 1-28, the day of month a "financial month" starts on.
 *   Dashboard/expenses month grouping can shift to the financial month via
 *   `financialMonthKey()` below. Default 1 = calendar months.
 */

export type ThemeMode = "light" | "dark" | "system";

export interface AppSettings {
  theme: ThemeMode;
  /** Day of month (1-28) the financial month starts on. */
  monthStartDay: number;
  /** Mask money figures across the dashboard (persisted privacy preference). */
  balancePrivate?: boolean;
}

export const SETTINGS_KEY = "finverse:settings:v1";

export const DEFAULT_SETTINGS: AppSettings = { theme: "system", monthStartDay: 1 };

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const THEMES: ThemeMode[] = ["light", "dark", "system"];

function isValidSettings(v: unknown): v is AppSettings {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Record<string, unknown>;
  const theme = s["theme"];
  const monthStartDay = s["monthStartDay"];
  return (
    typeof theme === "string" &&
    (THEMES as string[]).includes(theme) &&
    typeof monthStartDay === "number" &&
    Number.isInteger(monthStartDay) &&
    monthStartDay >= 1 &&
    monthStartDay <= 28 &&
    (s["balancePrivate"] === undefined || typeof s["balancePrivate"] === "boolean")
  );
}

/** Read settings. SSR-safe: returns defaults on the server. */
export function getSettings(): AppSettings {
  return readSettingsSnapshot();
}

/**
 * Snapshot reader for useSyncExternalStore. React requires getSnapshot to
 * return a CACHED value — returning a fresh object on every call makes
 * useSyncExternalStore re-render in an infinite loop ("Maximum update depth
 * exceeded"). The snapshot is keyed on the raw localStorage string: unchanged
 * storage -> identical object reference; changed storage -> re-parsed once.
 * Do not mutate the returned object; use setSettings() to change settings.
 */
let snapshotRaw: string | null | undefined;
let snapshotSettings: AppSettings = DEFAULT_SETTINGS;

function readSettingsSnapshot(): AppSettings {
  const raw = isBrowser() ? window.localStorage.getItem(SETTINGS_KEY) : null;
  if (raw === snapshotRaw) return snapshotSettings;
  snapshotRaw = raw;
  if (!raw) {
    snapshotSettings = DEFAULT_SETTINGS;
    return snapshotSettings;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    snapshotSettings = isValidSettings(parsed) ? parsed : DEFAULT_SETTINGS;
  } catch {
    snapshotSettings = DEFAULT_SETTINGS;
  }
  return snapshotSettings;
}

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

/** Persist a settings patch. No-op on the server. */
export function setSettings(patch: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...patch };
  if (next.monthStartDay < 1 || next.monthStartDay > 28 || !Number.isInteger(next.monthStartDay)) {
    throw new Error("monthStartDay must be an integer between 1 and 28");
  }
  if (isBrowser()) {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    emit();
  }
  return next;
}

function subscribeSettings(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SETTINGS_KEY) listener();
  };
  if (isBrowser()) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (isBrowser()) window.removeEventListener("storage", onStorage);
  };
}

/** Reactive settings hook. Returns [settings, updateSettings]. */
export function useSettings(): [AppSettings, (patch: Partial<AppSettings>) => AppSettings] {
  const settings = useSyncExternalStore(subscribeSettings, getSettings, getSettings);
  const update = useCallback((patch: Partial<AppSettings>) => setSettings(patch), []);
  return [settings, update];
}

// ---------------------------------------------------------------------------
// Financial-month helpers
//
// When monthStartDay > 1, a "financial month" runs from monthStartDay of one
// calendar month to monthStartDay-1 of the next. These helpers map any date to
// its financial-month key ("YYYY-MM", the month the period starts in).
//
// Integration note: dashboard (/) and /expenses currently group by calendar
// month via `dateISO.startsWith(monthKey)`. To honour monthStartDay there,
// replace that filter with a date-range filter built from
// financialMonthRange(monthKey, monthStartDay) — a one-line change in each
// route, kept out of this worker's file-ownership scope.
// ---------------------------------------------------------------------------

/** Clamp a month-start day to the supported 1-28 range. */
export function clampMonthStartDay(day: number): number {
  if (!Number.isInteger(day)) return 1;
  return Math.min(28, Math.max(1, day));
}

/** "YYYY-MM-DD" -> financial-month key "YYYY-MM" for the given monthStartDay. */
export function financialMonthKey(dateISO: string, monthStartDay: number): string {
  const day = clampMonthStartDay(monthStartDay);
  const y = Number(dateISO.slice(0, 4));
  const m = Number(dateISO.slice(5, 7));
  const d = Number(dateISO.slice(8, 10));
  if ([y, m, d].some((n) => !Number.isInteger(n))) return dateISO.slice(0, 7);
  if (d >= day) return `${y}-${String(m).padStart(2, "0")}`;
  // Belongs to the financial month that started in the previous calendar month.
  const prev = new Date(y, m - 2, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
}

/** Inclusive [startISO, endISO] date range of a financial month. */
export function financialMonthRange(
  monthKey: string,
  monthStartDay: number,
): { startISO: string; endISO: string } {
  const day = clampMonthStartDay(monthStartDay);
  const parts = monthKey.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  if (!Number.isInteger(y) || !Number.isInteger(m) || (m as number) < 1 || (m as number) > 12) {
    throw new Error(`financialMonthRange: invalid month key "${monthKey}"`);
  }
  const year = y as number;
  const month = m as number;
  const start = new Date(year, month - 1, day);
  const end = new Date(year, month, day - 1); // last day before next period starts
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { startISO: iso(start), endISO: iso(end) };
}

/** "2026-10" -> "Oct 2026" for a financial month key (same labels as calendar). */
export function financialMonthLabel(monthKey: string, monthStartDay: number): string {
  const day = clampMonthStartDay(monthStartDay);
  if (day === 1) return monthKey;
  return `${monthKey} (from ${day}${ordinalSuffix(day)})`;
}

function ordinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// ---------------------------------------------------------------------------
// CSV export (transactions)
// ---------------------------------------------------------------------------

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build a transactions CSV with proper quoting/escaping. */
export function buildTransactionsCSV(transactions: Transaction[]): string {
  const header = [
    "id",
    "type",
    "date",
    "note",
    "category",
    "amount_paise",
    "amount_inr",
    "pay_mode",
    "goal_id",
    "bill_id",
    "created_at",
  ];
  const lines = transactions.map((t) =>
    [
      csvEscape(t.id),
      csvEscape(t.type),
      csvEscape(t.dateISO),
      csvEscape(t.note),
      csvEscape(t.category),
      t.amountPaise,
      (t.amountPaise / 100).toFixed(2),
      csvEscape(t.payMode),
      csvEscape(t.goalId ?? ""),
      csvEscape(t.billId ?? ""),
      csvEscape(t.createdAt),
    ].join(","),
  );
  return `${header.join(",")}\n${lines.join("\n")}\n`;
}

// ---------------------------------------------------------------------------
// JSON backup / restore
// ---------------------------------------------------------------------------

export interface BackupFile {
  app: "finverse";
  kind: "finverse-backup";
  version: 1;
  exportedAt: string;
  settings: AppSettings;
  db: FinanceDB;
}

export function buildBackup(settings: AppSettings, db: FinanceDB): BackupFile {
  return {
    app: "finverse",
    kind: "finverse-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    db,
  };
}

const TXN_TYPES = ["expense", "income", "transfer"] as const;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isPaise(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0;
}

/** Validate a parsed backup file. Returns human-readable errors ([] = valid). */
export function validateBackup(parsed: unknown): string[] {
  const errors: string[] = [];
  if (!isObject(parsed)) return ["The file does not contain a valid backup object."];
  if (parsed["app"] !== "finverse" || parsed["kind"] !== "finverse-backup") {
    return ["This file is not a FinVerse backup (missing backup header)."];
  }
  if (parsed["version"] !== 1) {
    return [
      `Unsupported backup version ${String(parsed["version"])} — this build reads version 1 backups only.`,
    ];
  }
  const db = parsed["db"];
  if (!isObject(db)) return ["The backup is missing its data section."];
  for (const key of ["transactions", "budgets", "bills", "goals", "holdings"] as const) {
    if (!Array.isArray(db[key])) errors.push(`Data section "${key}" is missing or not a list.`);
  }
  if (errors.length > 0) return errors;

  const txns = db["transactions"] as unknown[];
  txns.forEach((t, i) => {
    if (!isObject(t)) {
      errors.push(`Transaction #${i + 1} is not an object.`);
      return;
    }
    if (typeof t["id"] !== "string") errors.push(`Transaction #${i + 1} is missing an id.`);
    if (typeof t["type"] !== "string" || !(TXN_TYPES as readonly string[]).includes(t["type"])) {
      errors.push(`Transaction #${i + 1} has an invalid type "${String(t["type"])}".`);
    }
    if (!isPaise(t["amountPaise"])) {
      errors.push(`Transaction #${i + 1} has an invalid amount (must be integer paise ≥ 0).`);
    }
    if (typeof t["dateISO"] !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(t["dateISO"])) {
      errors.push(`Transaction #${i + 1} has an invalid date "${String(t["dateISO"])}".`);
    }
  });

  const settingsRaw = parsed["settings"];
  if (isObject(settingsRaw)) {
    const d = settingsRaw["monthStartDay"];
    if (d !== undefined) {
      if (typeof d !== "number" || !Number.isInteger(d) || d < 1 || d > 28) {
        errors.push("Backup settings contain an invalid month-start day.");
      }
    }
  }
  return errors;
}
