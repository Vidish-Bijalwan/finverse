# FinVerse Revamp — Testing

Two suites: **unit** (Vitest, fast, no browser) and **e2e** (Playwright, needs a dev server).

## Unit tests — `bun run test:unit`

- Runner: `vitest run` with `vitest.config.ts` (node environment, `src/**/*.test.ts`).
- Coverage (optional): `bunx vitest run --coverage` (requires `@vitest/coverage-v8`, installed).
- Current starter tests (25 total, all passing):
  - `src/lib/finance/format.test.ts` — `formatINR` / `formatINRShort` (paise→₹ Indian grouping, zero, rounding, negative, K/L/Cr units, non-finite throws).
  - `src/lib/calc/sip.test.ts` — `calcSip` annuity-due formula vs a hand-computed value (₹10k/mo @ 12% for 10y → ≈ ₹23,23,390.76), zero-rate edge, invalid inputs, plus `sipGrowthSeries` / `validateSip`.
  - `src/lib/razorpay.test.ts` — HMAC-SHA256 webhook signature: known test vector, tampered-body rejection, wrong-secret rejection, forged/missing signatures. Covers `src/lib/razorpay.ts`, the dependency-free contract the webhook agent will use.
- Add new tests next to the module: `src/lib/<area>/<module>.test.ts` (matches the vitest `include` glob).

## E2E tests — `bun run test:e2e`

1. Start the dev server in another terminal: `bun run dev` (serves `http://localhost:8080`).
2. Run: `bun run test:e2e` (or `bunx playwright test e2e/smoke.spec.ts` for one file).
- Config: `playwright.config.ts` — testDir `e2e/`, baseURL `http://localhost:8080`, projects `chromium` (Desktop Chrome) + `mobile` (Pixel 7), generous timeouts for cold dev-server hydration, 1 retry, trace on first retry, `globalSetup` writes the trampoline. HTML report goes to `e2e-results/`.
- **Local Network Access (LNA) workaround:** the pre-installed Chromium (`/opt/meta-chromium/chrome`, v152) hard-blocks every renderer-initiated navigation to localhost (`ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS`) and no `--disable-features` flag or managed policy disables it in this build. Playwright's own browser download was skipped (slow apt/network). Solution: `e2e/helpers.ts` `gotoLocal(page, path)` navigates via a `file://` trampoline page (`e2e/global-setup.ts` writes `e2e/.lna-trampoline.html`; a `file://` initiator has local address space, so the redirect to the dev server is allowed). Chromium path is configurable via `PW_CHROMIUM_PATH`.
- First-time setup: `PLAYWRIGHT_BROWSERS_PATH=~/workspace/.pw-browsers bunx playwright install --with-deps chromium` (browsers live under `~/workspace/.pw-browsers`, NOT /tmp — /tmp is a 512M tmpfs).
- Current smoke suite (`e2e/smoke.spec.ts`): `GET /` redirects to `/login` when logged out; `/login` renders the sign-in UI (Email/Password fields, Sign in button, Continue with Google, tab switcher); client-side email validation fires without network. Runs on both chromium and mobile projects.
- Accessibility: `@axe-core/playwright` is installed — extend e2e specs with `new AxeBuilder({ page }).analyze()` on key pages.

## Typecheck

- `bun x tsc --noEmit` — keep touched files clean (do NOT run `bun run build` for test infra).
