# FinVerse Revamp — Implementation Status

Branch: `feature/finverse-revamp` · Base: `main@d5db5c5e`
Migration handoff: `supabase/migrations/0002_revamp.sql` → user runs in Supabase dashboard before deploy.
Env handoff: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (test keys, server-only), `SUPABASE_SERVICE_ROLE_KEY` (server-only) → Vercel.

## Completed
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
