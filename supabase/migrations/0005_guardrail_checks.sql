-- ═══════════════════════════════════════════════════════════════════
-- 0005 — guardrail check log + AI rate-limit counter (M3: ai-chat)
-- ═══════════════════════════════════════════════════════════════════
-- Run this in the Supabase SQL editor (same project as 0001–0004).
-- Idempotent: every statement uses IF NOT EXISTS / guards.
--
-- NOTE (migration queue): 0003 and 0004 are still unapplied on the live
-- database; this file joins the same manual queue. The ai-chat Edge
-- Function works without these tables (guardrail logging and the
-- DB-backed rate limit are fail-open) but the check log stays empty and
-- the limiter falls back to per-instance state until 0005 lands.
--
-- Both tables are append-only logs: no updated_at column, no updates.

-- ── TABLE: guardrail_checks ──────────────────────────────────────────
-- One row per verification check the guardrail runs on an AI answer.
-- check_type: source (claimed tool actually ran), value (number matches
-- the tool result), text (number in the prose matches the claim),
-- citation (a quoted fragment really comes from the named source).
-- verdict: pass / fail. attempt: 1 = first answer, 2 = corrected retry.
create table if not exists public.guardrail_checks (
  id                 uuid primary key default gen_random_uuid(),
  request_id         text not null,
  user_id            uuid not null references auth.users(id) on delete cascade,
  feature            text not null,
  attempt            integer not null check (attempt > 0),
  claim_text         text not null,
  source_tool        text not null,
  check_type         text not null
                     check (check_type in ('source','value','text','citation')),
  expected           text,
  actual             text,
  verdict            text not null check (verdict in ('pass','fail')),
  created_at         timestamptz default now()
);
alter table public.guardrail_checks enable row level security;
drop policy if exists "owner all" on public.guardrail_checks;
create policy "owner all" on public.guardrail_checks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists guardrail_checks_user_created_idx
  on public.guardrail_checks (user_id, created_at desc);
create index if not exists guardrail_checks_request_idx
  on public.guardrail_checks (request_id);

-- ── TABLE: ai_rate_limits ────────────────────────────────────────────
-- One row per ai-chat request, counted per user per 60-second window by
-- the Edge Function (10 requests/minute/user). The function deletes rows
-- older than an hour opportunistically; this table is a counter, not an
-- audit log, so rows may be pruned freely.
create table if not exists public.ai_rate_limits (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  created_at         timestamptz default now()
);
alter table public.ai_rate_limits enable row level security;
drop policy if exists "owner all" on public.ai_rate_limits;
create policy "owner all" on public.ai_rate_limits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists ai_rate_limits_user_created_idx
  on public.ai_rate_limits (user_id, created_at desc);
