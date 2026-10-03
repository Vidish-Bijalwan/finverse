# FinVerse AI — UI/UX Audit (Phase 0)

Date: 2026-10-03 · Workdir: `~/workspace/finverse-revamp/app` @ `d5db5c5e` (= main HEAD)
Stack: TanStack Start + React 19 + Tailwind CSS 4 + shadcn/ui + Supabase (Postgres + Auth + Storage, RLS)

---

## 1. Existing architecture

**Layout (`src/`):** `routes/` (21 file-based routes + `__root.tsx`), `components/ui/` (44 shadcn/radix primitives),
`components/shell/` (AppHeader, BottomTabBar, GlobalSearch, NotificationBell, BottomSheet, PageTransition, ThemeApplier),
`components/money/` (14 finance dialogs/inputs), `components/markets/` (PageShell, ScoreRing, shared EmptyState/SectionCard/PnlBadge, HoldingDialog, useWatchlist),
`components/ai/`, `components/charts/` (MonthBars, NetWorthSpark, SpendDonut, CountUp, ChartSkeleton), `components/expenses/`, `components/tools/`,
`lib/finance/` (db.ts Supabase layer, hooks.ts React Query, format.ts, categories.ts, types.ts),
`lib/auth.tsx` (AuthProvider), `lib/supabase.ts` (lazy singleton, PKCE flow-id fix), `lib/market/` (data.ts static dataset, history.ts seeded PRNG),
`lib/ai/`, `lib/calc/`, `hooks/` (use-mobile dead, use-prefers-reduced-motion).

**Routing/guards:** TanStack Start file routes. `__root.tsx` → QueryClientProvider → AuthProvider → GuardedShell:
splash while loading → unauthenticated → `/login` → incomplete onboarding → `/onboarding`. `/login`, `/auth/callback`, `/onboarding`
render chromeless. 404 + error boundaries in root.

**Data layer:** React Query keys `["finverse", …]`; `useTransactions` auto-posts recurring rules; mutations invalidate related keys.
Chat/insights load whole-DB snapshot (`loadFinanceDB`, 8 parallel fetches) for the deterministic AI engine.
Amounts stored as integer **paise**; `formatINR` → `₹8,42,310` (en-IN); `formatINRShort` → ₹L/K/Cr. `tabular-nums` applied per-component (not global).

**Styling:** Tailwind 4 `@theme inline` in `src/styles.css`, oklch semantic tokens, class-based dark mode via ThemeApplier
(default `system`), Roboto, base radius 0.5rem. Dark palette intentionally designed, not inverted.

**Supabase (0001_init.sql):** 11 tables — profiles, accounts, custom_categories, transactions, bills, budgets, goals,
holdings, watchlist_items, price_alerts, recurring_rules — uniform `owner all` RLS policy (`auth.uid() = user_id`),
client queries additionally `.eq("user_id", uid())`. `updated_at` triggers everywhere. Public `avatars` bucket, owner-scoped.

**Tests:** none. No vitest/playwright, no test scripts. `vite build` does not typecheck.

---

## 2. Reusable components (what exists)

- **Solid:** full shadcn kit (button/input/card/dialog/sheet/tabs/table/skeleton/sonner…), `markets/shared.tsx`
  (PageShell, SectionCard, EmptyState, PnlBadge), `charts/shared.tsx` (ChartSkeleton), `money/` dialogs (14),
  BottomSheet, GlobalSearch, NotificationBell, PageTransition (220ms fade-up).
- **Gaps (to build):** AmountInput w/ dedicated keypad, PinPad (6-dot), TxnRow, HoldingRow, MarketRow, PaymentSheet
  (review), OrderSheet, ReceiptView, AppLockScreen, TestModeBanner, StatBand (current/invested/P&L), DonutAllocation,
  ChartCard (range selector + prev-close), SearchDropdown (grouped results), NumberDisplay (global tabular-nums).
- **Promote:** `markets/shared.tsx` EmptyState/ErrorState → global; make `tabular-nums` a utility on NumberDisplay.

## 3. Weak areas (file:line)

1. **Fake/mock remnants:** `routes/expenses.tsx:157,315` — `mockReceiptScan()` cycles 3 fake receipts behind a "demo" label
   (keep only if relabeled honestly or remove); `lib/market/data.ts:81` — ~40 static stocks ("demo dataset — not live prices");
   `lib/market/history.ts` — seeded PRNG history + jittered mock LTPs (watchlist alert flicker near thresholds, known issue);
   `routes/watchlist.tsx:137` subtitle admits mock prices.
2. **Error-state gaps:** `routes/index.tsx:117` captures `txnsError` with no error branch; `/budgets`, `/goals`, `/expenses`,
   `/insights`, `/portfolio`, `/screener`, `/stocks.$symbol`, `/watchlist`, `/settings` render loading/empty only.
   Explicit error UI exists only in accounts, chat, RecurringList, auth/callback, root boundary.
3. **Dead code:** `src/hooks/use-mobile.tsx` — zero imports.
4. **Inconsistencies:** Button `rounded-sm` vs cards `rounded-2xl`; hardcoded colors (`text-emerald-600` bills:141,
   `bg-red-600` NotificationBell:26, `text-blue-600` EmiTab:208–214); heading weights (`font-black` vs `font-bold`);
   container padding variants; skeleton radii (`rounded-lg` vs `rounded-xl`).
5. **Local persistence leaks (per-device, not account-synced):** dividend overrides (`finverse:dividends:v1`, portfolio:60),
   streaks (`finverse:streaks:v1`), notification read-state (`finverse:notifications:v1`).
6. **A11y gaps:** recharts canvases have no text alternatives; `role="status"` only on splash; bills "Paid" status rendered
   as permanently `disabled` Button (bills.tsx:141) — confusing to assistive tech.
7. **Dashboard cards** previously showed empty-state copy while loading (fixed PR #48 via "…" placeholders) — revamp must
   use proper skeletons everywhere instead.

## 4. Useful patterns from reference repos

### GPay clone (muhammad-fiaz/GpayApp-Flutter) — ADOPT the grammar, NOT the fakes
- **People-first home:** recent payees above the fold (avatar grid), balance deliberately one tap deep; labeled rows for
  "See all payment activity" / "Check account balance"; scroll-aware floating "New Payment" pill (hides on scroll-down).
- **Payment flow:** chat-framed P2P (Pay/Request pills) → **dedicated full-bleed amount screen with custom numeric keypad**
  (no system keyboard; giant amount readout = anti-mistake) → **review bottom-sheet** (recipient, amount, funding source,
  "Proceed to pay" pill, "use other app" escape hatch) → PIN → processing → animated result screen with receipt actions.
- **Copy-with-confirmation:** tappable UPI-ID row → clipboard → snackbar "copied" (port for our UPI ID display).
- **Disabled-until-valid:** Continue/FAB stays grey until form valid (bank-details double-entry pattern).
- **PIN screen:** 6 hollow dots, custom keypad, dark overlay; the clone's gaps WE MUST FILL: wrong-PIN shake + message,
  progressive lockout with countdown, attempt counter, biometric fallback.
- **Txn rows:** avatar | name + date | right-aligned color-coded amount (green in / red out); group by month, sticky headers;
  failed rows tappable to retry. Detail view: amount, direction, counterparty, timestamp, reference ID, funding source, actions.
- **DO NOT PORT:** hardcoded passcode `123456`, no PIN error state, success toast that goes nowhere, index-parity amount
  coloring bug, echo-chamber chat, camera-only QR scanner, all static mock lists, dead overflow menus.

### Groww clone (HanshikaJ21/groww-react-clone) — landing-page heavy; design from first principles
- Repo is ~80% marketing site; `Stockcard/Watchlistcard/PortfolioPieChart` are 0-byte stubs; all data hardcoded; no order flow.
- **Adopt:** split auth modal (value panel + progressive form), card-fan discovery strip, staggered hero CTA, persistent search
  navbar slot, mega-menu promo-rail layout.
- **Canonical invest patterns to implement originally:** summary band (Current value | Invested | signed colored P&L) →
  donut allocation + ranked holdings list (name, qty, avg, LTP, P&L%); instrument rows (symbol+name → price → change chip);
  watchlist with inline star toggle + bell → alert sheet; **order ticket bottom-sheet** (Market/Limit segmented, qty/amount
  input, live estimated cost) → confirm screen → success with order ID; SIP flow (amount → frequency → date → mandate);
  chart with **1D/1W/1M/1Y selector, gradient fill, prev-close dashed line, tooltip with time+price+change**; grouped search
  dropdown (stocks/MF/ETF/indices) with inline price context; filter chips not selects.

## 5. Planned component mapping

| New component | Location | Replaces / extends |
|---|---|---|
| Design tokens (extended) | `src/styles.css` (@theme) | existing palette + success/warning/danger/info soft, focus, chart gain/loss, keypad |
| NumberDisplay, TestModeBanner, StatBand | `src/components/fv/` (new) | ad-hoc `tabular-nums` spans |
| AmountInput (keypad), PinPad | `src/components/fv/` | — |
| TxnRow, HoldingRow, MarketRow | `src/components/fv/` | inline rows in expenses/portfolio/watchlist |
| PaymentSheet, OrderSheet, ReceiptView | `src/components/fv/` | — |
| ChartCard (ranges + prev-close) | `src/components/fv/` | raw recharts per page |
| SearchDropdown | `src/components/fv/` | GlobalSearch (extend) |
| AppLockScreen, useAppLock | `src/components/fv/` + `src/lib/applock.ts` | — |
| Promoted EmptyState/ErrorState/Skeleton | move to `src/components/fv/` | `markets/shared.tsx` |
| useRazorpay, payment server fns | `src/lib/payments.ts` + server functions | — |

All new UI consumes the extended token set; no hardcoded colors; `rounded-2xl` card standard, pill actions.

## 6. Backend integration points

- **Ledger (existing `transactions`):** payments (type=expense, pay_mode=`upi_test`, account_id, note, `bill_id`/`goal_id` links
  where relevant), Razorpay captures (pay_mode=`razorpay_test`, reference = razorpay payment id), investment buys/sells
  (category=Investments, note=symbol/qty) — all via the same `useCreateTransaction`-style mutation path.
- **New tables (0002_revamp.sql):** `payment_links` (razorpay_link_id unique, amount_paise, status, expires_at),
  `payments` (razorpay_payment_id unique, link_id, amount_paise, status created|attempted|captured|failed,
  webhook_verified bool, raw_event jsonb), `app_lock` (user_id PK, pin_salt, pin_hash, biometric_enabled, timeout_secs,
  failed_attempts, locked_until). All: `owner all` RLS, `updated_at` trigger, indexes on user_id (+ status).
- **Server:** TanStack Start server functions for Razorpay order/link creation + webhook endpoint (HMAC-SHA256 verify,
  idempotent upsert by razorpay payment id, only then insert ledger transaction). Secrets from server env only.
- **Graceful degradation:** if new tables are absent (migration not yet run), payments/lock UI shows honest
  "setup incomplete" states — never fake success, never crash.

## 7. Migration / refactor risks

1. **`gh push` whole-dir sync** — snapshot discipline: verify base == main HEAD before every push; `rm -rf node_modules
   .output .wrangler dist` pre-push; confirm intended file set in the tree after merge.
2. **Migration cannot be applied by agents** — 0002 SQL is a handoff; app must degrade gracefully until the user runs it.
3. **Razorpay keys don't exist** — integration ships behind env vars with explicit "not configured" UI; webhook HMAC
   unit-tested with fixtures.
4. **TanStack Start server functions** — implementation agents must read `src/server.ts`/`src/start.ts` and existing
   `createServerFn` usage before adding webhook/order endpoints; no parallel framework.
5. **No test infra** — vitest + Playwright to be added; Playwright browser download may be slow/blocked (fallback: tsc +
   eslint + build + manual route checks).
6. **Auth session in E2E** — Supabase auth in Playwright needs a test user; keep E2E to unauthenticated + mocked-session
   flows where a real user can't be provisioned, and mark clearly.
7. **Scope control** — 21 routes; revamp touches shell + dashboard + payments + investments + markets hardest; other routes
   get token/component migration only, no feature changes (preserve working functionality).
8. **Dark mode + reduced-motion** must be verified per screen, not assumed from tokens.
