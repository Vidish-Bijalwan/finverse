-- ═══════════════════════════════════════════════════════════════════
-- 0003 — payment requests + transaction refunds (Phase 2: payments hub)
-- ═══════════════════════════════════════════════════════════════════
-- Run this in the Supabase SQL editor (same project as 0001/0002).
-- Idempotent: every statement uses IF NOT EXISTS / guards.

-- ── TABLE: payment_requests ──────────────────────────────────────────
-- "Request money" IOUs created by the user. The counterparty has no app,
-- so settlement is explicit: "Mark as paid" records a real income
-- transaction and points settled_txn_id at it. Statuses:
--   pending   — waiting on the other person
--   paid      — settled (settled_txn_id set, income recorded)
--   declined  — the other person declined
--   cancelled — the requester withdrew it
create table if not exists public.payment_requests (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  person_name        text not null,
  amount_paise       bigint not null check (amount_paise > 0),
  note               text not null default '',
  status             text not null default 'pending'
                     check (status in ('pending','paid','declined','cancelled')),
  settled_txn_id     uuid references public.transactions(id) on delete set null,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table public.payment_requests enable row level security;
drop policy if exists "owner all" on public.payment_requests;
create policy "owner all" on public.payment_requests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists payment_requests_user_created_idx
  on public.payment_requests (user_id, created_at desc);

-- ── COLUMN: transactions.refund_of ─────────────────────────────────
-- Links a refund (income) transaction to the original payment (expense).
-- A payment whose id appears here renders with the "Refunded" status.
alter table public.transactions
  add column if not exists refund_of uuid
  references public.transactions(id) on delete set null;
create index if not exists transactions_refund_of_idx
  on public.transactions (refund_of) where refund_of is not null;
