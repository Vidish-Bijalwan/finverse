-- ═══════════════════════════════════════════════════════════════════
-- 0004 — robustness CHECK constraints (audit follow-up)
-- ═══════════════════════════════════════════════════════════════════
-- Run this in the Supabase SQL editor together with 0003 (same project).
-- Idempotent: every constraint is added only when it does not exist yet.
--
-- NOTE: ADD CONSTRAINT validates existing rows. If the database already
-- contains violating rows (e.g. a zero-amount transaction, or a goal whose
-- saved_paise exceeds target_paise), the corresponding block will fail —
-- clean or fix those rows first, then re-run.

-- ── transactions.amount_paise > 0 ──────────────────────────────────
-- 0001 allowed >= 0; the audit found zero-amount rows being accepted.
-- The >= 0 constraint from 0001 stays in place; this one tightens it.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'transactions_amount_positive'
  ) then
    alter table public.transactions
      add constraint transactions_amount_positive check (amount_paise > 0);
  end if;
end $$;

-- ── bills.due_day BETWEEN 1 AND 31 ─────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bills_due_day_range'
  ) then
    alter table public.bills
      add constraint bills_due_day_range check (due_day between 1 and 31);
  end if;
end $$;

-- ── holdings.qty > 0 ───────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'holdings_qty_positive'
  ) then
    alter table public.holdings
      add constraint holdings_qty_positive check (qty > 0);
  end if;
end $$;

-- ── goals.saved_paise <= goals.target_paise ────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'goals_saved_within_target'
  ) then
    alter table public.goals
      add constraint goals_saved_within_target check (saved_paise <= target_paise);
  end if;
end $$;

-- ── budgets.limit_paise > 0 ────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'budgets_limit_positive'
  ) then
    alter table public.budgets
      add constraint budgets_limit_positive check (limit_paise > 0);
  end if;
end $$;
