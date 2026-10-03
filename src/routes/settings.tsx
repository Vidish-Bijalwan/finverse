import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { downloadFile } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  DatabaseBackup,
  Download,
  Fingerprint,
  Info,
  Lock,
  MonitorSmartphone,
  Moon,
  Palette,
  Sun,
  Upload,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SectionCard } from "@/components/markets/shared";
import { PageShell } from "@/components/markets/PageShell";
import { APP_VERSION } from "@/components/shell/AppHeader";
import { PinPad } from "@/components/fv";
import { useAuth } from "@/lib/auth";
import { APP_LOCK_TIMEOUTS, isLockEnabled } from "@/lib/applock";
import {
  useAppLock,
  useChangePin,
  useDisableLock,
  useSetPin,
  useUpdateLockSettings,
} from "@/lib/applock-hooks";
import {
  clearBiometricCredential,
  platformBiometricAvailable,
  registerBiometric,
} from "@/lib/applock-webauthn";
import {
  insertAccount,
  insertBill,
  insertCustomCategory,
  insertGoal,
  insertHolding,
  insertRecurringRule,
  insertTransaction,
  loadFinanceDB,
  setBudget,
} from "@/lib/finance/db";
import type { FinanceDB } from "@/lib/finance/types";
import {
  DEFAULT_SETTINGS,
  buildBackup,
  buildTransactionsCSV,
  clampMonthStartDay,
  getSettings,
  setSettings,
  useSettings,
  validateBackup,
  type BackupFile,
  type ThemeMode,
} from "@/lib/settings";
import { todayISO } from "@/lib/finance/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings — FinVerse AI" }],
  }),
  component: SettingsPage,
});

// ---------------------------------------------------------------------------

const THEME_OPTIONS: { value: ThemeMode; label: string; hint: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", hint: "Always light", icon: Sun },
  { value: "dark", label: "Dark", hint: "Always dark", icon: Moon },
  { value: "system", label: "System", hint: "Follow device", icon: MonitorSmartphone },
];

function SettingsPage() {
  const queryClient = useQueryClient();
  const [settings, updateSettings] = useSettings();
  const [restoreErrors, setRestoreErrors] = useState<string[]>([]);
  const [pendingBackup, setPendingBackup] = useState<BackupFile | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExportCSV() {
    const db = await loadFinanceDB();
    if (db.transactions.length === 0) {
      toast.info("No transactions to export yet.");
      return;
    }
    downloadFile(
      `finverse-transactions-${todayISO()}.csv`,
      buildTransactionsCSV(db.transactions),
      "text/csv",
    );
    toast.success(`Exported ${db.transactions.length} transactions to CSV.`);
  }

  async function handleBackup() {
    const backup = buildBackup(getSettings(), await loadFinanceDB());
    downloadFile(
      `finverse-backup-${todayISO()}.json`,
      JSON.stringify(backup, null, 2),
      "application/json",
    );
    toast.success("Backup downloaded.");
  }

  function handleRestoreFile(file: File) {
    setRestoreErrors([]);
    const reader = new FileReader();
    reader.onload = () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        setRestoreErrors([
          "This file is not valid JSON — pick the .json backup file you downloaded from FinVerse.",
        ]);
        return;
      }
      const errors = validateBackup(parsed);
      if (errors.length > 0) {
        setRestoreErrors(errors);
        return;
      }
      setPendingBackup(parsed as BackupFile);
    };
    reader.onerror = () => {
      setRestoreErrors(["Couldn't read that file — please try again."]);
    };
    reader.readAsText(file);
  }

  /**
   * Merge a validated backup into the live database: every backup row is
   * inserted through the Supabase data layer unless a row with the same id
   * already exists (skipped). Cross-references (accountId, billId, goalId,
   * recurringRuleId) are re-pointed at the live rows via an id map, so
   * restored transactions stay linked to their restored accounts/bills/goals.
   * Per-row failures are collected and surfaced; successful rows are kept.
   */
  async function confirmRestore() {
    if (!pendingBackup) return;
    setRestoreErrors([]);
    const errors: string[] = [];
    let inserted = 0;
    let skipped = 0;
    const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Couldn't save.");

    try {
      const db = await loadFinanceDB();
      const incoming: FinanceDB = pendingBackup.db;

      const existingIds = new Set<string>();
      for (const row of [
        ...db.transactions,
        ...db.budgets,
        ...db.bills,
        ...db.goals,
        ...db.holdings,
        ...db.accounts,
        ...db.customCategories,
        ...db.recurringRules,
      ]) {
        existingIds.add(row.id);
      }

      // Backup id -> live id, so references resolve to the right rows.
      const idMap = new Map<string, string>();
      const remap = (id: string | undefined): string | undefined =>
        id === undefined ? undefined : (idMap.get(id) ?? id);

      async function insertUnlessDup<T extends { id: string }>(
        label: string,
        row: T,
        insert: () => Promise<{ id: string }>,
      ): Promise<void> {
        if (existingIds.has(row.id)) {
          idMap.set(row.id, row.id);
          skipped += 1;
          return;
        }
        try {
          const created = await insert();
          idMap.set(row.id, created.id);
          existingIds.add(created.id);
          inserted += 1;
        } catch (e) {
          errors.push(`${label}: ${errMsg(e)}`);
        }
      }

      // Accounts first — transactions reference them.
      for (const a of incoming.accounts ?? []) {
        await insertUnlessDup(`Account "${a.name}"`, a, () =>
          insertAccount({
            name: a.name,
            type: a.type,
            iconName: a.iconName,
            color: a.color,
            openingBalancePaise: a.openingBalancePaise,
            isDefault: a.isDefault,
          }),
        );
      }

      // Custom categories: on a label clash, point at the existing category.
      for (const c of incoming.customCategories ?? []) {
        if (existingIds.has(c.id)) {
          idMap.set(c.id, c.id);
          skipped += 1;
          continue;
        }
        const clash = db.customCategories.find(
          (e) => e.label.toLowerCase() === c.label.toLowerCase(),
        );
        if (clash) {
          idMap.set(c.id, clash.id);
          skipped += 1;
          continue;
        }
        await insertUnlessDup(`Category "${c.label}"`, c, () =>
          insertCustomCategory({
            label: c.label,
            iconName: c.iconName,
            color: c.color,
            kind: c.kind,
          }),
        );
      }

      for (const b of incoming.bills ?? []) {
        await insertUnlessDup(`Bill "${b.name}"`, b, () =>
          insertBill({
            name: b.name,
            amountPaise: b.amountPaise,
            dueDay: b.dueDay,
            category: b.category,
            ...(b.lastPaidOn ? { lastPaidOn: b.lastPaidOn } : {}),
          }),
        );
      }

      for (const g of incoming.goals ?? []) {
        await insertUnlessDup(`Goal "${g.name}"`, g, () =>
          insertGoal({
            name: g.name,
            targetPaise: g.targetPaise,
            savedPaise: g.savedPaise,
            deadline: g.deadline,
            color: g.color,
          }),
        );
      }

      for (const h of incoming.holdings ?? []) {
        await insertUnlessDup(`Holding "${h.symbol}"`, h, () =>
          insertHolding({ symbol: h.symbol, qty: h.qty, avgPricePaise: h.avgPricePaise }),
        );
      }

      // Budgets upsert by (category, month), so they are idempotent.
      for (const b of incoming.budgets ?? []) {
        try {
          await setBudget({ categoryId: b.categoryId, month: b.month, limitPaise: b.limitPaise });
          inserted += 1;
        } catch (e) {
          errors.push(`Budget ${b.categoryId} ${b.month}: ${errMsg(e)}`);
        }
      }

      for (const r of incoming.recurringRules ?? []) {
        await insertUnlessDup(`Recurring "${r.note || r.category}"`, r, () =>
          insertRecurringRule({
            type: r.type,
            amountPaise: r.amountPaise,
            category: r.category,
            note: r.note,
            payMode: r.payMode,
            ...(remap(r.accountId) ? { accountId: remap(r.accountId)! } : {}),
            ...(remap(r.toAccountId) ? { toAccountId: remap(r.toAccountId)! } : {}),
            tags: r.tags ?? [],
            frequency: r.frequency,
            startDateISO: r.startDateISO,
            ...(r.endDateISO ? { endDateISO: r.endDateISO } : {}),
            isPaused: r.isPaused,
          }),
        );
      }

      // Transactions last — re-point every cross-reference at the live rows.
      for (const t of incoming.transactions ?? []) {
        await insertUnlessDup(`Transaction ${t.dateISO} "${t.note}"`, t, () =>
          insertTransaction({
            type: t.type,
            amountPaise: t.amountPaise,
            category: t.category,
            note: t.note,
            dateISO: t.dateISO,
            payMode: t.payMode,
            ...(remap(t.accountId) ? { accountId: remap(t.accountId)! } : {}),
            ...(remap(t.toAccountId) ? { toAccountId: remap(t.toAccountId)! } : {}),
            ...(remap(t.billId) ? { billId: remap(t.billId)! } : {}),
            ...(remap(t.goalId) ? { goalId: remap(t.goalId)! } : {}),
            ...(remap(t.recurringRuleId) ? { recurringRuleId: remap(t.recurringRuleId)! } : {}),
            tags: t.tags ?? [],
          }),
        );
      }

      const s = pendingBackup.settings;
      if (s && typeof s === "object") {
        setSettings({
          theme: (["light", "dark", "system"] as const).includes(s.theme)
            ? s.theme
            : DEFAULT_SETTINGS.theme,
          monthStartDay: clampMonthStartDay(s.monthStartDay),
        });
      }
      void queryClient.invalidateQueries();

      if (errors.length > 0) {
        setRestoreErrors(errors);
        toast.warning(
          `Restore partially complete — ${inserted} added, ${skipped} skipped, ${errors.length} failed.`,
        );
        setPendingBackup(null);
        return;
      }
      toast.success(
        `Backup restored — ${inserted} records added${skipped > 0 ? `, ${skipped} already present` : ""}.`,
      );
      setPendingBackup(null);
      // Reload so every screen (including theme + month grouping) picks up the
      // restored data in one consistent state.
      window.setTimeout(() => window.location.reload(), 400);
    } catch (e) {
      setRestoreErrors([`Couldn't restore: ${errMsg(e)} Check your connection and try again.`]);
    }
  }

  const backup = pendingBackup;

  return (
    <PageShell
      title="Settings"
      subtitle="Personalize FinVerse, manage your data, and keep backups."
      active="Settings"
    >
      <div className="grid gap-5">
        {/* Appearance */}
        <SectionCard title="Appearance">
          <div className="grid gap-4">
            <div>
              <Label className="text-sm font-semibold">Theme</Label>
              <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme">
                {THEME_OPTIONS.map((opt) => {
                  const selected = settings.theme === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        updateSettings({ theme: opt.value });
                        toast.success(
                          opt.value === "system"
                            ? "Theme follows your device."
                            : `${opt.label} theme on.`,
                        );
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5 transition-colors",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                      )}
                    >
                      <opt.icon className="size-5" />
                      <span className="text-sm font-bold">{opt.label}</span>
                      <span className="text-[11px]">{opt.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="month-start" className="text-sm font-semibold">
                Month-start day
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                The day your financial month begins (1st = calendar months). Bills, budgets and the
                dashboard group spending by this cycle.
              </p>
              <Select
                value={String(settings.monthStartDay)}
                onValueChange={(v) =>
                  updateSettings({ monthStartDay: clampMonthStartDay(Number(v)) })
                }
              >
                <SelectTrigger id="month-start" className="mt-2 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d}
                      {d === 1 ? "st (calendar months)" : d === 2 ? "nd" : d === 3 ? "rd" : "th"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>

        {/* Data & backup */}
        <SectionCard title="Data & backup">
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Download className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Export transactions</p>
                  <p className="text-xs text-muted-foreground">
                    Download every transaction as a CSV spreadsheet.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => void handleExportCSV()}>
                Export CSV
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <DatabaseBackup className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Full backup</p>
                  <p className="text-xs text-muted-foreground">
                    Download everything — transactions, budgets, bills, goals, holdings, settings.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => void handleBackup()}>
                Download
              </Button>
            </div>

            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Upload className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Restore backup</p>
                    <p className="text-xs text-muted-foreground">
                      Add a FinVerse backup file's records to your current data — records that
                      already exist are skipped.
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  Choose file
                </Button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                aria-label="Choose a FinVerse backup file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) handleRestoreFile(f);
                }}
              />
              {restoreErrors.length > 0 && (
                <div
                  role="alert"
                  className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3"
                >
                  <p className="flex items-center gap-1.5 text-sm font-bold text-destructive">
                    <AlertTriangle className="size-4" /> Couldn't restore this file
                  </p>
                  <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                    {restoreErrors.slice(0, 6).map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                    {restoreErrors.length > 6 && (
                      <li>…and {restoreErrors.length - 6} more problems.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* App lock */}
        <AppLockSection />

        {/* About */}
        <SectionCard title="About FinVerse">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-dark shadow-logo">
              <Palette className="size-6 text-primary-foreground" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black text-foreground">FinVerse AI</h3>
                <Badge variant="secondary">{APP_VERSION}</Badge>
              </div>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                Clear, explainable insights for your financial life. Track spending, manage budgets
                and bills, set goals, and understand your investments — with AI that always shows
                its reasoning.
              </p>
              <Separator className="my-3" />
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                Your data syncs securely to your private Supabase account — protected by row-level
                security so only you can access it.
              </p>
            </div>
          </div>
        </SectionCard>

        <Card className="shadow-card">
          <CardContent className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
            <CheckCircle2 className="size-4 shrink-0 text-success" />
            Settings save instantly and sync across tabs on this device.
          </CardContent>
        </Card>
      </div>

      {/* Restore confirm */}
      <AlertDialog open={!!backup} onOpenChange={(o) => !o && setPendingBackup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This adds the backup
              {backup && ` from ${new Date(backup.exportedAt).toLocaleString()}`} to your current
              data:
              <span className="mt-2 block">
                {backup?.db.transactions.length ?? 0} transactions ·{" "}
                {backup?.db.budgets.length ?? 0} budgets · {backup?.db.bills.length ?? 0} bills ·{" "}
                {backup?.db.goals.length ?? 0} goals · {backup?.db.holdings.length ?? 0} holdings.
              </span>
              Records that already exist (matched by id) are skipped, and linked records are
              re-linked automatically. Your current data is kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmRestore()}>
              Restore backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}

// ---------------------------------------------------------------------------

type PinDialogMode = "set" | "change";
type PinStep = "current" | "new" | "confirm";

/**
 * App lock settings section (PIN + auto-lock timeout + biometrics).
 *
 * Honest states: if the `app_lock` table is missing (migration not run) the
 * section says so plainly instead of faking a toggle. The biometric switch
 * renders only when the device actually has a user-verifying authenticator.
 */
function AppLockSection() {
  const { user } = useAuth();
  const lock = useAppLock();
  const setPin = useSetPin();
  const changePin = useChangePin();
  const disableLock = useDisableLock();
  const updateLock = useUpdateLockSettings();

  const [bioSupported, setBioSupported] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const [mode, setMode] = useState<PinDialogMode | null>(null);
  const [step, setStep] = useState<PinStep>("new");
  const [firstPin, setFirstPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinBusy, setPinBusy] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  const row = lock.data?.row ?? null;
  const tableMissing = lock.data?.tableMissing ?? false;
  const enabled = isLockEnabled(row);

  useEffect(() => {
    void platformBiometricAvailable().then(setBioSupported);
  }, []);

  function openDialog(m: PinDialogMode) {
    setMode(m);
    setStep(m === "change" ? "current" : "new");
    setFirstPin("");
    setCurrentPin("");
    setPinError(null);
    setPinBusy(false);
  }

  /** Close the dialog and wipe every PIN buffer from memory. */
  function closeDialog() {
    setMode(null);
    setStep("new");
    setFirstPin("");
    setCurrentPin("");
    setPinError(null);
    setPinBusy(false);
  }

  async function handlePinComplete(pin: string) {
    setPinError(null);
    if (mode === "set") {
      if (step === "new") {
        setFirstPin(pin);
        setStep("confirm");
        return;
      }
      if (pin !== firstPin) {
        setPinError("Passcodes didn't match — enter it once more.");
        setStep("new");
        setFirstPin("");
        return;
      }
      setPinBusy(true);
      try {
        await setPin.mutateAsync(pin);
        toast.success("Passcode set — app lock is on.");
        closeDialog();
      } catch (e) {
        setPinError(e instanceof Error ? e.message : "Couldn't save your passcode.");
        setPinBusy(false);
      }
      return;
    }
    if (mode === "change") {
      if (step === "current") {
        setCurrentPin(pin);
        setStep("new");
        return;
      }
      if (step === "new") {
        setFirstPin(pin);
        setStep("confirm");
        return;
      }
      if (pin !== firstPin) {
        setPinError("New passcodes didn't match — enter it once more.");
        setStep("new");
        setFirstPin("");
        return;
      }
      setPinBusy(true);
      try {
        await changePin.mutateAsync({ currentPin, newPin: pin });
        toast.success("Passcode changed.");
        closeDialog();
      } catch (e) {
        setPinError(e instanceof Error ? e.message : "Couldn't change your passcode.");
        setStep("current");
        setCurrentPin("");
        setFirstPin("");
        setPinBusy(false);
      }
    }
  }

  async function handleBioToggle(on: boolean) {
    if (!user) return;
    if (on) {
      setBioBusy(true);
      try {
        await registerBiometric(user.id, user.email ?? "FinVerse user");
        await updateLock.mutateAsync({ biometric_enabled: true });
        toast.success("Biometric unlock enabled on this device.");
      } catch (e) {
        // Honest fallback: setup failed → toggle stays off, PIN still works.
        toast.error(
          e instanceof Error ? e.message : "Biometric setup failed — your passcode still works.",
        );
      } finally {
        setBioBusy(false);
      }
      return;
    }
    try {
      await updateLock.mutateAsync({ biometric_enabled: false });
      clearBiometricCredential(user.id);
      toast.info("Biometric unlock turned off.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't turn off biometrics.");
    }
  }

  async function handleDisable() {
    setShowDisableConfirm(false);
    try {
      await disableLock.mutateAsync();
      if (user) clearBiometricCredential(user.id);
      toast.info("App lock disabled.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't disable app lock.");
    }
  }

  const dialogTitle =
    mode === "set"
      ? step === "confirm"
        ? "Confirm your passcode"
        : "Set a passcode"
      : step === "current"
        ? "Enter your current passcode"
        : step === "new"
          ? "Enter a new passcode"
          : "Confirm the new passcode";

  return (
    <>
      <SectionCard title="App lock">
        {tableMissing ? (
          <div
            role="note"
            className="flex items-start gap-2.5 rounded-xl border border-warning/40 bg-warning/5 p-4"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <p className="text-sm leading-6 text-foreground">
              <span className="font-bold">
                App lock unavailable until the database update is applied.
              </span>{" "}
              The <span className="font-mono text-xs">app_lock</span> table doesn't exist yet — run{" "}
              <span className="font-mono text-xs">supabase/migrations/0002_revamp.sql</span> in the
              Supabase SQL editor, then come back here.
            </p>
          </div>
        ) : lock.isLoading ? (
          <div className="grid gap-3" aria-label="Loading app-lock settings">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : lock.isError ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/5 p-4"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
            <div className="text-sm">
              <p className="font-bold text-foreground">Couldn't load app-lock settings</p>
              <p className="mt-0.5 text-muted-foreground">
                {lock.error?.message ?? "Check your connection and try again."}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => void lock.refetch()}
              >
                Try again
              </Button>
            </div>
          </div>
        ) : !enabled ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Lock className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Passcode lock</p>
                <p className="text-xs text-muted-foreground">
                  Require a 6-digit passcode when you return to the app after being away.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => openDialog("set")}>
              Set passcode
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-success/10 text-success">
                  <Lock className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">Passcode lock</p>
                    <Badge variant="secondary">On</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Locks when you're away longer than the timeout below.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => openDialog("change")}>
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Auto-lock after</p>
                <p className="text-xs text-muted-foreground">
                  How long the app can sit in the background before locking.
                </p>
              </div>
              <Select
                value={String(row?.timeout_secs ?? 120)}
                onValueChange={(v) => {
                  const secs = Number(v) as 30 | 60 | 120 | 300 | 600;
                  updateLock.mutate(
                    { timeout_secs: secs },
                    {
                      onError: (e) =>
                        toast.error(e instanceof Error ? e.message : "Couldn't save the timeout."),
                    },
                  );
                }}
              >
                <SelectTrigger className="w-36" aria-label="Auto-lock timeout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APP_LOCK_TIMEOUTS.map((t) => (
                    <SelectItem key={t.value} value={String(t.value)}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {bioSupported && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Fingerprint className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Biometric unlock</p>
                    <p className="text-xs text-muted-foreground">
                      Use this device's biometrics instead of the passcode.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={!!row?.biometric_enabled}
                  disabled={bioBusy || updateLock.isPending}
                  onCheckedChange={(on) => void handleBioToggle(on)}
                  aria-label="Biometric unlock"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("finverse:lock-now"));
                  toast.info("FinVerse locked.");
                }}
              >
                <Lock className="size-4" /> Lock now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:text-danger"
                onClick={() => setShowDisableConfirm(true)}
              >
                Disable app lock
              </Button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* PIN set / change dialog — the PIN buffer lives only in this dialog's
          state and is wiped on close; it is never persisted or logged. */}
      <Dialog open={mode !== null} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {mode === "change" && step === "current"
                ? "Verify your current passcode first."
                : "Your 6-digit passcode. It never leaves this device."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <PinPad
              key={`${mode}-${step}`}
              title={dialogTitle}
              onComplete={(pin) => void handlePinComplete(pin)}
              error={pinError}
              disabled={pinBusy}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable confirm */}
      <AlertDialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable app lock?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes your passcode and any biometric enrollment on this device. Anyone with
              access to the device and your signed-in session will be able to open FinVerse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it on</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger text-danger-foreground hover:bg-danger/90"
              onClick={() => void handleDisable()}
            >
              Disable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
