-- FinVerse AI — initial schema
-- Supabase migration 0001_init.sql
-- Money in paise (bigint). Per-user isolation via RLS (auth.uid()).

create extension if not exists "pgcrypto";

-- ── shared updated_at trigger ─────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: profiles
-- ═══════════════════════════════════════════════════════════════════════════
create table public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  email              text,
  full_name          text,
  avatar_url         text,
  bio                text,
  phone              text,
  onboarding_completed boolean not null default false,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "owner all" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: accounts
-- ═══════════════════════════════════════════════════════════════════════════
create table public.accounts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  name               text not null,
  type               text not null default 'bank',
  icon_name          text not null default '',
  color              text not null default '#10B981',
  opening_balance_paise bigint not null default 0,
  is_default         boolean not null default false,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table public.accounts enable row level security;
create policy "owner all" on public.accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: custom_categories
-- ═══════════════════════════════════════════════════════════════════════════
create table public.custom_categories (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  label              text not null,
  icon_name          text not null default 'tag',
  color              text not null default '#F59E0B',
  kind               text not null default 'expense',
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table public.custom_categories enable row level security;
create policy "owner all" on public.custom_categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: transactions
-- ═══════════════════════════════════════════════════════════════════════════
create table public.transactions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  type               text not null check (type in ('expense','income','transfer')),
  amount_paise       bigint not null check (amount_paise >= 0),
  category           text not null default '',
  note               text not null default '',
  date_iso           date not null,
  pay_mode           text not null default 'UPI',
  account_id         uuid,
  to_account_id      uuid,
  goal_id            uuid,
  bill_id            uuid,
  tags               text[] not null default '{}',
  recurring_rule_id  uuid,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table public.transactions enable row level security;
create policy "owner all" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index transactions_user_date_idx on public.transactions (user_id, date_iso desc);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: bills
-- ═══════════════════════════════════════════════════════════════════════════
create table public.bills (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  name               text not null,
  amount_paise       bigint not null,
  due_day            int not null,
  category           text not null default '',
  last_paid_on       date,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table public.bills enable row level security;
create policy "owner all" on public.bills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: budgets
-- ═══════════════════════════════════════════════════════════════════════════
create table public.budgets (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  category_id        text not null,
  month              text not null,
  limit_paise        bigint not null,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  unique (user_id, category_id, month)
);
alter table public.budgets enable row level security;
create policy "owner all" on public.budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: goals
-- ═══════════════════════════════════════════════════════════════════════════
create table public.goals (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  name               text not null,
  target_paise       bigint not null,
  saved_paise        bigint not null default 0,
  deadline           date,
  color              text not null default '#8B5CF6',
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table public.goals enable row level security;
create policy "owner all" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: holdings
-- ═══════════════════════════════════════════════════════════════════════════
create table public.holdings (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  symbol             text not null,
  qty                numeric not null,
  avg_price_paise    bigint not null,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table public.holdings enable row level security;
create policy "owner all" on public.holdings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: watchlist_items
-- ═══════════════════════════════════════════════════════════════════════════
create table public.watchlist_items (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  symbol             text not null,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  unique (user_id, symbol)
);
alter table public.watchlist_items enable row level security;
create policy "owner all" on public.watchlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: price_alerts
-- ═══════════════════════════════════════════════════════════════════════════
create table public.price_alerts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  symbol             text not null,
  target_price_paise bigint not null,
  direction          text not null check (direction in ('above','below')),
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table public.price_alerts enable row level security;
create policy "owner all" on public.price_alerts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: recurring_rules
-- ═══════════════════════════════════════════════════════════════════════════
create table public.recurring_rules (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  type               text not null,
  amount_paise       bigint not null,
  category           text not null default '',
  note               text not null default '',
  pay_mode           text not null default 'UPI',
  account_id         uuid,
  to_account_id      uuid,
  tags               text[] not null default '{}',
  frequency          text not null,
  start_date_iso     date not null,
  end_date_iso       date,
  last_posted_date_iso date,
  is_paused          boolean not null default false,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
alter table public.recurring_rules enable row level security;
create policy "owner all" on public.recurring_rules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── updated_at triggers (one per table) ───────────────────────────────────
create trigger trg_set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at_accounts
  before update on public.accounts
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at_custom_categories
  before update on public.custom_categories
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at_transactions
  before update on public.transactions
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at_bills
  before update on public.bills
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at_budgets
  before update on public.budgets
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at_goals
  before update on public.goals
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at_holdings
  before update on public.holdings
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at_watchlist_items
  before update on public.watchlist_items
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at_price_alerts
  before update on public.price_alerts
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at_recurring_rules
  before update on public.recurring_rules
  for each row execute function public.set_updated_at();

-- ── storage: avatars bucket ───────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Public read of avatars
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

-- Owner-scoped writes: object path must start with the user's own uid
-- (client uploads to "<uid>/filename.ext")
create policy "avatars owner insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "avatars owner update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "avatars owner delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
