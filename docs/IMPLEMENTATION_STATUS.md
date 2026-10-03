# FinVerse Revamp — Implementation Status

Branch: `feature/fintech-overhaul` (Phase 1) · Base: `main@3841647d`
Migration handoff: `supabase/migrations/0002_revamp.sql` → user runs in Supabase dashboard before deploy.
Env handoff: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (test keys, server-only), `SUPABASE_SERVICE_ROLE_KEY` (server-only) → Vercel.

## Phase 1 — fintech overhaul: shell + dashboard (DONE, awaiting parent screenshot review)

- **Shell**: header nav rebuilt Home / Payments / Invest / Markets / Activity with pill active state + `aria-current`; bottom tabs match; global search gained Contacts + Features groups; no routes renamed, all deep links intact.
- **Greeting**: `src/lib/greeting.ts` sanitizes display names ("Good afternoon, ee" fixed); compact secondary line.
- **Balance hero**: net worth 32–36px tabular numerals, honest cash+investments−liabilities sub, month net-cash-flow + % vs prev month, compact metrics row (Investments · Cash · Monthly cash flow · Investment P&L), persisted eye-toggle privacy masking.
- **Financial-logic audit**: `src/lib/finance/money-math.ts` (net worth = cash+investments+other−liabilities; returns = value−cost; cash flow = income−expenses); "P&L" only for portfolio returns now; contradictory trio eliminated.
- **Quick actions**: 11-action compact icon grid, every action wired via `src/lib/quick-actions.ts` routing table — deep-links into real flows (`/payments` recipient/UPI-ID/QR flows, `/accounts` transfer dialog, `/expenses` add sheet, `/goals` goal form), real QR scanner dialog (camera + BarcodeDetector + manual fallback), real recharge dialog (ledger expense).
- **Market strip**: indices NIFTY 50 / SENSEX / BANK NIFTY (new `src/lib/market/indices.ts` simulated instruments) + watched stocks; symbol/price/abs/% per item; one compact SIMULATED DATA pill; hover/focus pause marquee; reduced-motion static row.
- **Desktop IA**: 12-col grid — PRIMARY (recent activity, insight, cash flow, analytics) / SECONDARY (portfolio snapshot, watchlist, market snapshot with top movers). 78rem max width, 16px card radii, Space Grotesk only, emerald/teal for interaction/state only.
- **Known gap**: no mutual-fund dataset exists in the codebase, so global search has no Mutual Funds group (not faked) — later phase.
- **Verification**: tsc 52 errors / 0 in touched files (baseline was 53); eslint clean on touched files; unit 125/125 (33 new tests); build green. Details: `TEST_REPORT.md` Phase 1 section.
- **DO NOT MERGE** — parent coordinator screenshot-reviews the Vercel preview before Phase 2.

## Completed (earlier phases)
- Phase 0 recon: `docs/UI_AUDIT.md` (architecture, components, weak areas, GPay/Groww patterns, component mapping, backend integration points, risks).
- Design system: extended oklch tokens (success/warning/danger/info+soft, focus, gain/loss, keypad) w/ intentional dark mode; 19-file `src/components/fv/` kit (NumberDisplay, TestModeBanner, StatBand, TxnRow, HoldingRow, MarketRow, AmountInput, PinPad, PaymentSheet, OrderSheet, ReceiptView, ChartCard, DonutAllocation, SearchDropdown, AppLockScreen, TickerStrip, EmptyState, ErrorState, index barrel). tsc/eslint clean.
- Migration: `supabase/migrations/0002_revamp.sql` — payment_links, payments, app_lock; owner RLS; updated_at triggers; indexes; RLS probe queries in comments. Parses clean (pglast). NOT applied — user handoff.
- Test infra: vitest 5 + Playwright 1.63 + @axe-core/playwright; `test:unit`, `test:e2e` scripts; `docs/TESTING.md`; smoke specs (6/6 pass).
- Dashboard (`/`): greeting, StatBand, TickerStrip, quick actions (Pay→/payments), cash-flow ChartCard, recents via TxnRow, skeleton deep-link cards, insight line, watchlist preview, ErrorStates (fixes txnsError gap).
- Payments (`/payments`): simulated-UPI flow (people-first → AmountInput → PaymentSheet → ReceiptView; success only after ledger write) + Razorpay test tab (honest unconfigured state; link → poll → success only on captured+verified) + history. 42P01 → honest "setup pending".
- Razorpay rail: server fns (link create, status), raw-body webhook `/api/razorpay-webhook` (HMAC verify, idempotent, exactly-once ledger). Secrets server-only (bundle scan clean). `.env.example` names only.
- Investments: portfolio StatBand/Donut/HoldingRows/Invest search; stock ChartCard + Buy/Sell/SIP → OrderSheet; `usePlaceOrder()` → holdings + ledger; SipSheet → recurring_rules. Simulated labels throughout.
- Markets/ticker: TickerStrip on dashboard+portfolio; watchlist on MarketRow (alert-flicker fix + "Last checked"); screener on MarketRow + SearchDropdown.
- App lock: PBKDF2 PIN, `__root.tsx` gate (background timeout, in-memory last-active), 5-attempt/30s lockout, honest WebAuthn, forgot → sign-out re-auth, settings section, 42P01 graceful state.
- Verification: tsc 53 errors all pre-existing (0 in revamp files); eslint 0 errors; `bun run build` green (routeTree includes /payments + webhook); unit 45/45; e2e smoke 6/6; secret scans clean (repo + bundle). `TEST_REPORT.md` written with honest unchecked boxes.

## In Progress
- (none — awaiting PR review/merge by parent)

## Remaining (parent-side)
- Run `0002_revamp.sql` in Supabase dashboard; set 3 server env vars in Vercel; register Razorpay webhook URL.
- Merge PR → Vercel deploy → live QA: visual pass (390px/tablet/1440px, light+dark), authenticated E2E (payment/invest/lock), axe run, Lighthouse, RLS live probes.

## Blocked
- Live-DB DDL + RLS probes: needs the user/owner (agents can't apply).
- Razorpay live test flow: needs test keys.
- Visual/browser QA: coordinator has no live-browser control.

## Bugs Found
- Mock receipt scan cycles fake receipts (expenses.tsx:157,315) — untouched, still present.
- Watchlist alert flicker near thresholds — mitigated (evaluate on mount/refresh + timestamp).
- `txnsError` with no error UI (index.tsx:117) — FIXED (full ErrorState+retry).
- Disabled "Paid" button as status (bills.tsx:141) — untouched.
- Dividend/streak/notification state in localStorage — untouched (out of scope).

## Bugs Fixed
- Dashboard txnsError gap → ErrorState with retry.
- 2 tsc errors introduced in stocks.$symbol.tsx during revamp → fixed by coordinator.
- 20 prettier/eslint issues across revamp files → auto-fixed.
- Dashboard Pay pill was plain `<a>` (route didn't exist at the time) → restored to typed `<Link to="/payments">`.

## Code review findings (Worker C perf pass, 2026-10-03)

Bundle (post-polish, pre-perf): 1,736,799 bytes total JS in `.output/public/assets/*.js`
(vs 1,718,293 pre-polish baseline, +18,506). Top chunks: root `index-*` 503KB
(react/react-dom/router/shell), recharts core 346KB, supabase 240KB,
tools route 56KB, expenses route 51KB. Lucide tree-shaking verified healthy
(no unused icon glyphs in any chunk); recharts was eagerly reachable from the
dashboard route chunk only (NOT the root chunk), so login/onboarding never
paid for it.

### Perf changes made
- **Recharts lazy-split (dashboard + portfolio):** `MonthBars`/`NetWorthSpark`/
  `SpendDonut` in `routes/index.tsx` and `DonutAllocation` in
  `routes/portfolio.tsx` are now `React.lazy` + `Suspense` with `ChartSkeleton`
  fallbacks. All render behind the existing client-only `chartsReady` mount
  gate, so SSR is unaffected. Dashboard initial route chunk drops ~400KB of
  eager recharts; it streams in after mount.
- **Query dedupe (`lib/finance/hooks.ts`):** `useAccountSummaries()` previously
  fired its own full-table `transactions` fetch via `fetchAccountSummaries()`
  while `useTransactions()` fired another — 2 identical Supabase reads on every
  dashboard/portfolio mount. It now resolves transactions through
  `qc.fetchQuery` on the existing `["finverse","transactions","all"]` key
  (key shapes unchanged), so React Query dedupes the in-flight request → 1
  fetch. `balanceForAccount` exported from `db.ts` to support this;
  `ensureRecurringPosted()` preserved in the shared fetch.
- **Memoized charts:** `MonthBars`, `NetWorthSpark`, `SpendDonut`,
  `DonutAllocation` wrapped in `React.memo` — parents re-render on unrelated
  state (categorize sheet, pull-to-refresh) with stable `useMemo`'d data refs,
  so recharts no longer re-renders then.
- **Dead code removed:** 21 unused shadcn `ui/*` components deleted
  (accordion, aspect-ratio, breadcrumb, calendar, carousel, chart, checkbox,
  command, context-menu, drawer, form, hover-card, input-otp, menubar,
  navigation-menu, pagination, popover, radio-group, resizable, sidebar) —
  zero had any importer in `src`/`e2e`. Unimported files were never bundled,
  so this is source hygiene, not byte savings.

### Deliberately skipped (with reason)
- Row memoization (`TxnRow`/`MarketRow`/`HoldingRow`): callsites pass inline
  arrow callbacks + fresh `swipeActions` objects, so `memo` alone would be a
  no-op; rows are cheap DOM and lists are short. Stabilizing callbacks
  parent-side is a larger refactor with negligible payoff — skipped per
  "don't memoize trivially-cheap components".
- List virtualization: expenses/payments lists are month-scoped (typically
  <100 rows) with date grouping + swipe gestures; virtualization complexity
  not justified. Revisit if a month ever exceeds ~100 rows.
- `package.json` unused deps (`date-fns`, `@hookform/resolvers`, plus
  `embla-carousel-react`/`vaul`/`cmdk`/`input-otp`/`react-resizable-panels`/
  `react-day-picker`/`react-hook-form` now that their only importers — the
  deleted ui files — are gone): removal needs `bun install` to regenerate
  `bun.lock`, which this worker may not run; left for the coordinator.
  None are bundled (no remaining importers), so no byte impact either way.

### Review findings (not changed — for follow-up)
1. **`Pill` is dead:** the revamp's design-system `Pill` (`components/fv/Pill.tsx`)
   has zero usages — every route hand-rolls `rounded-full` chips with
   inconsistent padding/color classes (19 files). Either adopt `Pill`
   everywhere or delete it.
2. **BottomTabBar missing `aria-current`:** active tab has no
   `aria-current="page"`; the nav has `aria-label` but screen readers can't
   tell the current tab.
3. **Prop drilling:** `routes/index.tsx` threads `month`/`setMonth` and
   categorize-sheet state through ~900 lines; consider extracting the
   dashboard sections. Not a bug, just growing.
4. **Duplicate `ensureRecurringPosted` trigger:** both `useTransactions` and
   (now) the shared summaries fetch can trigger it; it's idempotent, so
   harmless, but a single explicit "post recurring on app start" would be
   cleaner than piggybacking on query fns.
5. **`fetchWatchlist`/`useWatchlist` dual sources:** dashboard uses
   `useQuery({queryKey: WATCHLIST_QUERY_KEY})` + `useWatchlistUI()` from
   `components/markets/useWatchlist` — two hooks over the same data; already
   shares the key, but the split is easy to misuse.
6. **No `<img>` tags anywhere** — all imagery is SVG/icons; nothing to
   optimize. Fonts: preconnect + `display=swap` present for Roboto + Space
   Grotesk in `__root.tsx` ✓.
7. **53 pre-existing tsc strict-mode errors** (exactOptionalPropertyTypes /
   noUncheckedIndexedAccess in money dialogs, etc.) — runtime-safe per prior
   notes; untouched by this pass, 0 new errors introduced.

## UI polish pass (issues #52–#58) — Completed 2026-10-03

Branch: polish work on top of `main@5798cae1` (PR #51 merged). No `.git` in workdir;
coordinator merges. Verification: `bun run test:unit` 67/67 ✅ · `bun x tsc --noEmit`
53 errors all pre-existing, 0 in polish files ✅ · `bun x eslint .` 0 errors, 9 benign
react-refresh warnings ✅ · `bun run build` green ✅ · client JS 1,743,130 bytes
(+1.45% vs 1,718,293 baseline) ✅. See `TEST_REPORT.md` ("UI polish pass") for the
full per-item table and command outputs.

### #52–#56: 30 UI items
- **Color**: signature mint `#00E5A0` accent (primary/focus/ring oklch tokens, `--tint`);
  profit `#00C853` / loss `#FF5252` (`--gain`/`--loss` with intentional dark-mode values);
  dark `#0B0E17`→charcoal discipline; light warm paper `#FAFAF8`
  (`--background: oklch(0.985 0.004 100)`); section accents — payments blue,
  investments green, insights amber
- **Typography**: Fraunces serif headings (`--font-display-serif`), Space Grotesk money
  numerals (`--font-display` + `fv-money` tabular-nums), 11px uppercase eyebrows
  (`fv-eyebrow`: 11px/600/uppercase/0.12em); hero numbers 40px+ (`fv-hero`: 2.5rem)
- **Layout**: 1400px desktop grid (dashboard `max-w-[1400px]`); 3-up mobile stat bands;
  snap-scroll rails (Carousel, dashboard, insights); sticky sheet footers
  (PaymentSheet/OrderSheet)
- **Motion/interaction**: count-up numbers (`charts/CountUp.tsx`); press states
  (`fv/press.ts` `pressable()`, `active:scale-0.97`); txn swipe actions (`TxnRow`
  `swipeActions`); pull-to-refresh (`PullToRefresh` on dashboard); ticker flash
  (300ms green/red on 5s refresh, reduced-motion safe); toasts with real Undo;
  1px/1.5px hairline borders; mint shimmer skeletons (`fv-shimmer` 1.8s sweep,
  `ChartSkeleton` Suspense fallbacks)
- **fv kit additions**: `Pill`, `Accordion`, `Carousel`, `Tabs`, `Popover` (exported from
  `fv/index.ts`); bottom sheets everywhere as the primary dialog pattern

### #57: perf
- Recharts lazy-split (dashboard `MonthBars`/`NetWorthSpark`/`SpendDonut`, portfolio
  `DonutAllocation`) → recharts is a separate 340KB lazy chunk, NOT in the root chunk;
  eager dashboard chunk shrank; streams in behind `chartsReady` + `ChartSkeleton`
- Supabase query dedupe: `useAccountSummaries()` resolves via `qc.fetchQuery` on the
  existing `["finverse","transactions","all"]` key → 1 fetch per mount instead of 2
- Charts `React.memo`'d; 21 unused shadcn `ui/*` files deleted (zero importers);
  21 unused prod deps removed from `package.json` (radix leftovers, cmdk, vaul,
  embla-carousel-react, input-otp, react-resizable-panels, react-day-picker,
  react-hook-form, date-fns, @hookform/resolvers, @tailwindcss/vite,
  @tanstack/router-plugin, vite-tsconfig-paths)
- Result: 1,718,293 → 1,743,130 bytes (+1.45%; growth is lazy chunks, eager path lighter)

### #58: docs (this pass)
- `TEST_REPORT.md`: "UI polish pass" section with real command outputs, per-item
  verified status, honest ⏳ marks for browser-only checks
- `docs/IMPLEMENTATION_STATUS.md`: this section (all polish moved to Completed)
- `README.md`: design-system + testing + Razorpay + app-lock docs

### QA bugfixes (polish pass)
- Keypad rapid-input stale-closure fix (`src/lib/amount-keys.ts`, 6 unit tests)
- "Create account" CTA dead end in payment sheet → working sheet flow
- Portfolio 12s load-timeout failsafe + `ready` decoupling (`src/routes/portfolio.tsx`) —
  timeout shows ErrorState + Retry instead of infinite spinner
- Holdings order math extracted to pure `src/lib/finance/order-math.ts`
  (10 unit tests, incl. `BUY INFY × 2 @ 152200 paise`)
- MarketRow nested-button a11y fix (no interactive-inside-interactive)
- BillDialog/BudgetDialog converted from centered Dialog to BottomSheet

### Still pending (coordinator's live pass)
- Visual QA at 390px / tablet / 1440px, light + dark (all 30 items are code-verified;
  *looking* right needs a browser)
- axe run (installed; needs authenticated page harness), Lighthouse
- Authenticated E2E of the QA fixes (rapid keypad input, portfolio timeout path,
  undo toasts, swipe actions)
- Pre-existing: RLS live probes, Razorpay live test-mode flow (need owner / test keys)

## Screenshot-review bug fixes (2026-10-03, bug-fix subagent — NOT pushed)

1. **Floating button clipped at ~1920px** — root cause NOT found by static analysis; NOT claimed fixed. Only fixed-position rounded button (expenses FAB) sits `1.5rem` inset at 1920px — not clipped. Needs a real 1920px render by someone with browser tools (see TEST_REPORT.md regression note).
2. **SIMULATED badges** — `TestModeBanner` deleted (19 usages across payments/bank-transfer/request/portfolio/stock flows); MarketStrip "SIMULATED DATA" pill → quiet muted text; screener badge → quiet text. One quiet disclosure line per page/flow header retained (e.g. payments "Simulated rails — no real money moves"); Razorpay tab's inaccurate "Simulated" pill removed (it's test-mode, not simulated).
3. **`greetingName()` casing** — `src/lib/greeting.ts` now title-cases only all-lowercase tokens ("QA Reviewer" preserved); junk rejection unchanged. +4 tests.
4. **Avatar initials** — new `src/lib/names.ts` `avatarInitials()`: first letters of first two words ("QT"), blank → "FV". Applied in TxnRow + AppHeader + profile. +6 tests.
5. **Request setup-pending** — `isSetupPendingError` hardened (stable `code="FINVERSE_SETUP_PENDING"` + branded-message fallback, still matching 42P01/relation-regex); copy softened to "Requests aren't set up yet / Requests unlock after a quick database update…". +3 tests.
6. **Request quick action** — dashboard "Request" now opens `/payments?flow=request` (in-payments Requests tracker). Paise keypad behavior confirmed correct, untouched.
- Verification: unit 168/168 · tsc 52 pre-existing (0 new) · eslint 0 on touched files · build green. Details: TEST_REPORT.md (Screenshot-review bug fixes section).

## Phase 3 — markets (2026-10-03, feature worker — NOT pushed)

- **Market snapshot** (`src/components/home/MarketSnapshot.tsx`): NIFTY 50 / SENSEX / BANK NIFTY index cards with sparklines + Top Gainers / Top Losers / Most Active (3 rows each); every stock row links to `/stocks/$symbol`. New pure logic in `src/lib/market/movers.ts` (movers, sparkline downsampling/path, signed % labels) + `src/lib/market/movers.test.ts` (17 tests). New `src/components/fv/Sparkline.tsx` kit component (fv barrel). Most Active = largest absolute day % move (no traded-volume data in the demo feed — documented in code).
- **Watchlist card** (`src/components/home/WatchlistCard.tsx`): dashboard secondary column, ≤5 compact rows (icon, name, ticker, price, change, sparkline), tap → stock detail; shares the watchlist page's query cache. Compact empty state (≤220px): "Build your watchlist" / "Track stocks you care about." + "Explore stocks" CTA.
- **Stock detail** (`src/routes/stocks.$symbol.tsx`): chart ranges 1D/1W/1M/3M/1Y/5Y (1260-day deterministic history, memoized); new Overview section (cap band, sector medians, peer links — no fake descriptions) + Financials section (honestly-derived per-share ratios, "not real company financials" footnote); subtle neutral SIMULATION pill in the header. Buy/Sell order flow untouched.
- **Dashboard** (`src/routes/index.tsx`): secondary column now Portfolio snapshot → WatchlistCard → MarketSnapshot; removed the old MarketRow preview + MoverList; desktop IA unchanged.
- Simulated-data honesty: one quiet muted line per section header; no per-section badges reintroduced.
- Verification: unit 185/185 · tsc 52 pre-existing, 0 new (error lists byte-identical) · eslint 0 errors on touched files · build green. Live-browser visual QA not performed (no browser control) — milestone screenshot loop belongs to the parent coordinator.
