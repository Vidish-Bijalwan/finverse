-- FinVerse AI — revamp schema (payments + app lock)
-- Supabase migration 0002_revamp.sql
-- Money in paise (bigint). Per-user isolation via RLS (auth.uid()).
-- Run after 0001_init.sql. Reuses public.set_updated_at() from 0001.

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: payment_links
-- ═══════════════════════════════════════════════════════════════════════════
-- Razorpay payment links issued by the app (test mode). Server creates the
-- link via the Razorpay API and records it here so the client can poll for
-- payment status without ever seeing the Razorpay secret.
create table public.payment_links (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  razorpay_link_id   text not null unique,
  amount_paise       bigint not null check (amount_paise > 0),
  currency           text not null default 'INR',
  status             text not null default 'created'
                     check (status in ('created','paid','expired','cancelled')),
  expires_at         timestamptz,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table public.payment_links enable row level security;
create policy "owner all" on public.payment_links
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index payment_links_user_created_idx on public.payment_links (user_id, created_at desc);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: payments
-- ═══════════════════════════════════════════════════════════════════════════
-- Completed/attempted payments. razorpay_payment_id is the idempotency key:
-- webhook re-deliveries upsert on it, never insert a second row.
create table public.payments (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  payment_link_id    uuid references public.payment_links(id) on delete set null,
  razorpay_payment_id text not null unique,
  razorpay_order_id  text,
  amount_paise       bigint not null check (amount_paise > 0),
  currency           text not null default 'INR',
  status             text not null default 'created'
                     check (status in ('created','attempted','captured','failed')),
  method             text,  -- e.g. 'upi', 'card'
  webhook_verified   boolean not null default false,
  failure_reason     text,
  raw_event          jsonb,
  -- Filled after the ledger write that records this payment as a
  -- transaction. No FK constraint: the ledger table lives in a separate
  -- migration that may not have been applied when this file runs, so the
  -- reference is kept loose deliberately.
  transaction_id     uuid,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table public.payments enable row level security;
create policy "owner all" on public.payments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index payments_user_created_idx on public.payments (user_id, created_at desc);
create index payments_status_idx on public.payments (status);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: app_lock
-- ═══════════════════════════════════════════════════════════════════════════
-- One row per user. pin_hash is PBKDF2-SHA256 hex computed CLIENT-SIDE via
-- WebCrypto — the server (and this DB) never sees the raw PIN. pin_salt is
-- the random per-user salt used in that derivation. The client must rate-limit
-- locally (failed_attempts / locked_until) in addition to any server checks.
create table public.app_lock (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  pin_salt           text not null,
  pin_hash           text not null,
  biometric_enabled  boolean not null default false,
  timeout_secs       integer not null default 120
                     check (timeout_secs in (30, 60, 120, 300, 600)),
  failed_attempts    integer not null default 0,
  locked_until       timestamptz,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table public.app_lock enable row level security;
create policy "owner all" on public.app_lock
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── updated_at triggers (reuse public.set_updated_at() from 0001) ─────────
create trigger trg_set_updated_at_payment_links
  before update on public.payment_links
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at_payments
  before update on public.payments
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at_app_lock
  before update on public.app_lock
  for each row execute function public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS verification queries (run as two different users)
-- ═══════════════════════════════════════════════════════════════════════════
-- Setup (run once, e.g. as service_role or via the SQL editor with auth):
--   A = auth uid of test user A, B = auth uid of test user B.
-- These probes assume you have switched session context so that
-- auth.uid() = A's uid, then repeat with B.
--
-- 1. INSERT as A (should succeed — one row per table shown; adapt per table):
--    insert into public.payment_links (user_id, razorpay_link_id, amount_paise)
--      values (auth.uid(), 'plink_test_A', 50000) returning id;
--    insert into public.payments (user_id, razorpay_payment_id, amount_paise)
--      values (auth.uid(), 'pay_test_A', 50000) returning id;
--    insert into public.app_lock (user_id, pin_salt, pin_hash)
--      values (auth.uid(), 'testsaltA', 'testhashA') returning user_id;
--
-- 2. INSERT spoofing B's user_id as A (must FAIL with_check / RLS violation):
--    insert into public.payment_links (user_id, razorpay_link_id, amount_paise)
--      values ('<B-UID-HERE>', 'plink_spoof', 1);
--    --> expected: new row violates row-level security policy
--
-- 3. SELECT as A must NOT see B's rows (rows filtered to 0):
--    select count(*) from public.payment_links;   -- expect only A's row
--    select count(*) from public.payments;        -- expect only A's row
--    select * from public.app_lock;               -- expect only A's row
--
-- 4. UPDATE B's row as A (must affect 0 rows):
--    update public.payments set amount_paise = 1
--      where razorpay_payment_id = 'pay_test_B';
--    --> expected: UPDATE 0 (USING clause rejects)
--
-- 5. DELETE B's row as A (must affect 0 rows):
--    delete from public.payments
--      where razorpay_payment_id = 'pay_test_B';
--    --> expected: DELETE 0
--
-- 6. Switch to B and verify B still sees exactly its own rows, then clean up
--    your own test rows:
--    delete from public.payment_links where user_id = auth.uid();
--    delete from public.payments where user_id = auth.uid();
--    delete from public.app_lock where user_id = auth.uid();
