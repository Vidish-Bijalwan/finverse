# FinVerse AI — Personal Finance Intelligence

**Live demo:** https://finverse-nu.vercel.app/

FinVerse AI is a personal-finance intelligence web app: track spending, manage bills and
budgets, set savings goals, send UPI-style payments, get explainable AI insights, and
analyse investments — with a fast, mobile-first experience built for India.

This is **Module 1 (personal expense tracking)** of a 3-module college major project.

---

## Features

### Money management
- **Dashboard** — net worth, monthly P&L, income-vs-expenses, category breakdown, quick actions
- **Expenses** — add / edit / delete transactions, month picker, search, category filters,
  swipe-to-delete on mobile, undo-friendly confirms
- **Smart entry** — natural-language input ("lunch 250 at office"), voice-input fallback,
  mock receipt extraction
- **Payments** — UPI-style send/request, bank transfer, account-to-account transfers,
  payment links; balances **block** (never warn) on insufficient funds
- **Bills** — recurring bills with due dates; "mark paid" creates the matching expense
- **Budgets** — per-category monthly limits with 80% / 100% progress states
- **Goals** — savings goals with progress tracking and monthly-pace guidance

### AI (explainable, no API keys needed)
- **Insights** — insight cards computed from your real data, each with evidence
  ("Why this?") and a confidence level — never a bare unexplained score
- **AI Chat** — ask "how much did I spend on food this month?" or "what's my savings rate?"
  and get answers computed from your stored data
- **LLM-ready** — a typed `LLMAdapter` abstraction ships with the deterministic engine,
  so Ollama / OpenRouter can be plugged in later without touching the UI

### Investments
- **Portfolio** — holdings with quantity, average price, LTP, value, P&L, allocation donut
- **Screener** — stock table with sector, P/E, dividend-yield and market-cap filters
- **Stock detail** — price history chart, 52-week range, fundamentals, rule-based AI analysis
- **Readiness score** — 0–100 investment-readiness score with explained factor cards
  (emergency-fund coverage, savings rate, budget discipline, fixed-cost ratio)
  plus a "Can I invest ₹X this month?" calculator

### Experience
- Mobile-first fintech design: bottom tab bar on mobile, bottom sheets, ₹ formatting
  (Indian numbering), quick actions, count-up numbers
- Loading skeletons, empty states with working CTAs, **error states with retry**
  (never fake empty screens), toast notifications
- Touch gestures, reduced-motion support, responsive desktop / tablet / mobile layouts
- Security headers in production: CSP, `X-Frame-Options: DENY`, nosniff, strict referrer policy

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | TanStack Start (React 19, SSR) + TanStack Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4, shadcn/ui + Radix primitives |
| Data fetching | TanStack Query |
| Charts | Recharts |
| Icons | Lucide |
| Persistence | **Supabase** (Postgres + Auth + Storage); amounts in integer paise |
| Runtime | Bun |
| Deployment | Vercel (auto-deploys from `main`) |

## Auth & onboarding

- **Email/password + Google OAuth** via Supabase Auth (`src/lib/auth.tsx` exposes
  `signUp`, `signIn`, `signInWithGoogle`, `signOut`).
- Routes: `/login`, `/auth/callback` (PKCE code exchange, hardened against
  expired/used links), `/forgot-password`, `/auth/reset-password`, `/onboarding`, `/profile`.
- **Onboarding wizard**: display name → monthly income + payday → budget split
  (must sum to 100%) → ≥1 goal; completes by setting `profiles.onboarding_completed`.
- **Route guards** (root route): no session → `/login`; session without completed
  onboarding → `/onboarding`. App chrome is hidden on auth/onboarding routes.
- **Profile**: avatar upload (Supabase Storage `avatars` bucket), display name, bio,
  phone, logout. **App lock**: PBKDF2-SHA256 PIN (weak PINs rejected), auto-lock
  timeouts, 5-attempt lockout, optional WebAuthn convenience unlock.

## Database

Supabase Postgres, migrations in [`supabase/migrations/`](supabase/migrations/):

| Migration | Contents |
|---|---|
| `0001_init.sql` | 11 core tables, RLS owner policies, `set_updated_at()` triggers, `avatars` Storage bucket |
| `0002_revamp.sql` | Payments + app-lock schema (payment links, payment requests) |
| `0003_payment_requests.sql` | Payment requests + transaction refunds |
| `0004_robustness_constraints.sql` | CHECK constraints (positive amounts, `due_day` 1–31, `qty > 0`, saved ≤ target, positive budget limits) |

> ⚠️ **0003 and 0004 have not been applied to the live database yet.** Run them in
> the Supabase Dashboard → SQL Editor (in order). 0004 validates existing rows —
> clean any violating rows first (e.g. zero-amount transactions).

## Design system

All tokens live in [`src/styles.css`](src/styles.css) as oklch semantic variables
(`--primary`, `--success`, `--warning`, `--danger`, `--info`, `--gain`, `--loss`,
`--keypad`, …) with intentional light- *and* dark-mode values. Component
primitives live in the `fv` kit: [`src/components/fv/`](src/components/fv/).

### Color
- **Signature accent — mint `#00E5A0`**: reserved for primary actions, focus rings,
  and hero moments. In dark mode it goes full electric on a deep-ink `#0B0E17` →
  charcoal base; in light mode a deepened mint-teal keeps contrast on warm paper
  `#FAFAF8`.
- **Profit `#00C853` / loss `#FF5252`** (`--gain`/`--loss`): the only colors used
  for P&L, returns, and ticker flashes — green means up, red means down, everywhere.
- **Section accents**: payments skew blue, investments green, insights amber — one
  accent per section so each tab has its own identity.
- **Borders**: hairline 1px/1.5px discipline; no heavy dividers.

### Typography
- **One typeface: Space Grotesk** (`--font-sans`), body through headings — no serif.
- `.fv-money` enforces `font-variant-numeric: tabular-nums` so ₹ figures align in
  columns; `.fv-hero` renders hero numbers at 40px+ with tight tracking.
- **11px uppercase eyebrows** (`.fv-eyebrow`: 11px/600/uppercase/0.12em tracking)
  for section labels.
- Fonts load via Google Fonts `display=swap` with `preconnect` in `__root.tsx`.

### Components (`src/components/fv/`)
NumberDisplay · TestModeBanner · StatBand · TxnRow (swipe actions) · HoldingRow ·
MarketRow · TickerStrip · AmountInput + NumericKeypad · PinPad · PaymentSheet ·
OrderSheet · ReceiptView · ChartCard (1D/1W/1M/1Y) · DonutAllocation ·
SearchDropdown · AppLockScreen · EmptyState / ErrorState · PullToRefresh ·
CategorizeSheet · **Pill · Accordion · Carousel · Tabs · Popover** · `press()`
(active:scale-0.97 press states) · `tabsNav`. Utilities in `styles.css`:
`fv-eyebrow`, `fv-hero`, `fv-money`, `fv-shimmer` (mint-tinted skeleton sweep).
Motion utilities: count-up numbers (`charts/CountUp.tsx`), 300ms ticker price
flash, reduced-motion respected throughout.

---

## Architecture

```
┌─ Presentation ─────────────────────────────┐
│ routes/*  (25 page routes: /, accounts,    │
│  auth/callback, auth/reset-password,       │
│  bills, budgets, chat, expenses,           │
│  forgot-password, goals, insights, login,  │
│  markets, more, notifications, onboarding, │
│  payments, portfolio, profile, readiness,  │
│  screener, settings, stocks/$symbol,       │
│  tools, watchlist; + api/razorpay-webhook) │
│ components/* (ui, money, ai, markets, shell)│
├─ Application ──────────────────────────────┤
│ lib/finance/hooks.ts  (React Query hooks)  │
│ lib/finance/orders.ts (order placement)     │
│ lib/ai/engine.ts      (insight engine)     │
│ lib/ai/adapter.ts     (LLMAdapter stub)    │
├─ Domain ───────────────────────────────────┤
│ lib/finance/types.ts  (Transaction, Bill,  │
│   Budget, Goal, Holding — paise ints)      │
│ lib/finance/categories.ts                  │
├─ Infrastructure ───────────────────────────┤
│ lib/finance/db.ts     (Supabase queries,   │
│   snake_case↔camelCase mappers, RLS,       │
│   React Query wiring; no localStorage)     │
└────────────────────────────────────────────┘
```

**Data flow:** UI → React Query hooks → `db.ts` (Supabase queries, per-user scoped;
RLS enforces it server-side) → components re-render. The AI engine is a pure
function over the loaded snapshot: every insight carries its evidence and
confidence, and the chat answers are computed from the same data — no black boxes.

**Money handling:** all amounts are stored and computed as integer paise to avoid
float errors; formatting (`formatINR`) applies the Indian digit grouping (lakh/crore).
Amount parsing is strict (rejects `1e5`, `0x10`, negatives).

**AI design:** deterministic, explainable rules today (zero cost, no keys). The
`LLMAdapter` interface mirrors the engine's input/output contract so a real model
can replace or augment rules later.

---

## Project structure

```
src/
  routes/            # File-based routes (one per page)
  components/
    ui/              # shadcn primitives (button, dialog, sheet, input…)
    money/           # Expense/bill/budget/goal dialogs & lists
    ai/              # Insight cards, chat message
    markets/         # Portfolio, screener, stock detail
    shell/           # App header, bottom tabs, navigation
  lib/
    finance/         # types, db (Supabase), hooks, orders, categories, format
    ai/              # engine (insights), adapter (LLM stub)
    auth.tsx         # Supabase auth provider
public/              # favicon.svg, robots.txt
PROGRESS_REPORT.md   # Full build log: what shipped, what remains, system design
```

---

## Getting started

```sh
bun install
bun run dev        # http://localhost:3000
```

```sh
bun run lint       # eslint
bun run build      # production build (vite + nitro)
```

Set in `.env` (see [`.env.example`](.env.example)): `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`. Google OAuth additionally needs a Google Cloud OAuth
client configured in Supabase Dashboard → Authentication → Providers, with
redirect URL `<site-url>/auth/callback`.

## Testing

```sh
bun run test:unit     # vitest — unit tests (306 passing: order math, PIN policy,
                      # amount parsing, webhook HMAC vectors, keypad reducer…)
bun run test:e2e      # playwright — browser E2E (chromium + Pixel 7 mobile)
bun x tsc --noEmit    # typecheck (51 pre-existing errors in untouched legacy
                      # files; zero in touched code)
bun x eslint          # lint — 0 errors
bun run build         # production build (vite + nitro)
```

See [TEST_REPORT.md](./TEST_REPORT.md) for the full verification log (per-issue
status, bundle sizes, honest pending items) and
[docs/IMPLEMENTATION_STATUS.md](./docs/IMPLEMENTATION_STATUS.md) for the
feature-by-feature build state.

## Razorpay test-mode setup (optional)

Payments include a **Razorpay test-mode rail**. The app is designed to fail
closed: without keys the Razorpay tab shows an honest "not configured" state and
nothing else changes.

1. In the Razorpay dashboard, generate **test-mode** keys (never live keys).
2. Set server-only env vars (never `VITE_`-prefixed — the secret must stay off
   the client):
   ```sh
   RAZORPAY_KEY_ID=<test key id>
   RAZORPAY_KEY_SECRET=<test key secret>
   ```
   In Vercel, add these to the server environment. Names are in
   [`.env.example`](.env.example).
3. Register the webhook in the Razorpay dashboard:
   `https://<your-app>/api/razorpay-webhook` for `payment.authorized`,
   `payment.captured`, `payment.failed`.
4. Flow: payment link → new-tab test checkout → UI polls for 3s → success only
   when the payment is `captured` **and** `webhook_verified`. The webhook verifies
   HMAC-SHA256 signatures (401 on mismatch), upserts idempotently on
   `razorpay_payment_id`, and writes the ledger transaction exactly once.

## App lock

Optional PIN lock (settings → App lock):

- PIN is derived with **PBKDF2-SHA256, 100,000 iterations** (WebCrypto) — only
  salt + hash are stored, never the PIN.
- Weak PINs rejected (`000000`, `123456`, repeated digits, sequential runs).
- **Auto-lock timeouts**: 30s / 1m / 2m / 5m / 10m of background inactivity
  (in-memory last-active tracking in `__root.tsx`).
- **5 wrong attempts → 30s lockout.**
- **WebAuthn**: offered only where a platform authenticator exists (Face ID /
  Touch ID / Windows Hello / Android biometrics) as a device-local convenience
  unlock — the PIN remains the authoritative credential.
- **Forgot PIN**: no backdoor — signs you out and re-authenticates via Supabase.


## Deployment

Pushes to `main` auto-deploy to production on Vercel:

- **Production:** https://finverse-nu.vercel.app/
- **Repo:** https://github.com/Vidish-Bijalwan/finverse
- Security headers ship via `vercel.json` (CSP, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`).

---

## Status & roadmap

FinVerse has graduated from a localStorage demo to a real authenticated product:
Supabase Auth + Postgres + Storage are live in production, all data is per-user
with RLS, and a deep security/robustness audit (2026-10-04) left no unresolved
code-side findings. See [PROGRESS_REPORT.md](./PROGRESS_REPORT.md) for the full
build log, system design, verification evidence, and owner actions still pending.

**Pending owner actions:**
- Run migrations `0003` + `0004` in the Supabase SQL Editor (payment requests /
  refunds need 0003)
- Supabase Dashboard → Authentication → Rate Limits (signup rate limiting)
- Decide on "Confirm email" (kills account enumeration, adds signup friction)
- Enable breached-password check + min length 8 in Auth → Password Protection

**Planned next steps (Modules 2–3 and hardening):**
- Plug a real LLM into `LLMAdapter` (Ollama / OpenRouter) for open-ended chat
- Live market-data feed (currently simulated with disclosures)
- PWA / offline install, push reminders for bills
- Multi-currency, live end-to-end Razorpay test keys

---

## License

College major-project submission. All rights reserved by the author.
