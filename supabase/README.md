# FinVerse AI — Supabase backend

Migration: `supabase/migrations/0001_init.sql`

## Apply the migration

**Option A — Supabase Dashboard (recommended for first setup)**
1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/migrations/0001_init.sql`.
3. Click **Run**. All tables, RLS policies, triggers, and the `avatars`
   storage bucket are created in one go.

**Option B — Supabase CLI**
1. `supabase init` (once), then `supabase link --project-ref <your-project-ref>`.
2. Place this file under `supabase/migrations/` (it already is:
   `supabase/migrations/0001_init.sql`).
3. `supabase db push` to apply it to the linked project.

## Environment variables

The client needs two values (from **Project Settings → API** in the dashboard):

| Variable              | Value                                  |
|-----------------------|----------------------------------------|
| `VITE_SUPABASE_URL`   | Project URL, e.g. `https://xyzcompany.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | The **anon / public** key             |

Add them to your local `.env` file and also to the **Vercel project →
Settings → Environment Variables** so production builds can reach Supabase.

**Why the anon key is safe in the browser:** every table in this schema has
Row Level Security enabled, and the only policy on each table is the owner
policy `auth.uid() = user_id` (or `auth.uid() = id` for `profiles`). Even with
the anon key, a signed-in user can only read/write rows that belong to their
own `auth.uid()` — no cross-user access is possible. The `service_role` key
bypasses RLS and must never be shipped to the client.

## Google OAuth setup

1. Dashboard → **Authentication → Providers** → enable **Google**.
2. Create an OAuth client in
   [Google Cloud Console](https://console.cloud.google.com) (APIs & Services →
   Credentials → OAuth client ID, type **Web application**).
3. Paste the **Client ID** and **Client secret** into the Supabase Google
   provider settings.
4. Under **Site URL** (Authentication → URL Configuration) set your deployed
   URL, e.g. `https://finverse-nu.vercel.app`.
5. Add this redirect URL to the provider's allowed list:
   `<site-url>/auth/callback` (e.g. `https://finverse-nu.vercel.app/auth/callback`).
   Also add the same URL as an authorized redirect URI in the Google Cloud
   OAuth client.

## Schema summary

All money is stored in **paise** (`bigint`). Every user-owned table carries
`user_id uuid not null references auth.users(id) on delete cascade` plus
`created_at` / `updated_at timestamptz default now()`.

| Table               | Purpose                                          |
|---------------------|--------------------------------------------------|
| `profiles`         | One row per auth user (`id = auth.uid()`), onboarding state |
| `accounts`        | Bank / cash / UPI accounts + opening balances    |
| `custom_categories` | User-defined expense/income categories           |
| `transactions`    | Ledger; `type` ∈ expense/income/transfer, indexed on `(user_id, date_iso desc)` |
| `bills`           | Recurring bills with `due_day` + last-paid date  |
| `budgets`         | Monthly per-category limits, `unique(user_id, category_id, month)` |
| `goals`           | Savings goals with target / saved / deadline     |
| `holdings`        | Investment holdings (`qty` numeric for fractional units) |
| `watchlist_items` | Market watchlist, `unique(user_id, symbol)`      |
| `price_alerts`    | Alerts with `direction` ∈ above/below            |
| `recurring_rules` | Auto-posting rules for recurring transactions    |

RLS: a single `owner all` policy per table (`auth.uid() = user_id`; `auth.uid() = id`
for `profiles`). A shared `set_updated_at()` trigger function keeps `updated_at`
fresh on every update. Storage bucket `avatars` is public for reads; writes are
scoped to the path prefix `<auth.uid()>/…`, so users can only manage their own
avatar files.
