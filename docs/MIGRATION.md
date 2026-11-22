# Migration Notes — FinverseAI/FinVerse-AI → Vidish-Bijalwan/finverse

**Date:** 22 November 2026
**Decision:** Vivek's call — all work from Phase 0 through Phase 12 now
happens in this repo (`Vidish-Bijalwan/finverse`, TanStack Start +
Supabase, currently live on Vercel at `finverse-nu.vercel.app` — see §6
for the hosting decision to move to GitHub Pages). The old repo
(`FinverseAI/FinVerse-AI`, NestJS + Next.js + Prisma/Neon) is superseded;
its open PR #4 (Phase 3 guardrails) is superseded by this move.

This document records the **M0 preservation step**: what was carried over
from the old repo, what was deliberately left behind, and where each old
phase maps to in this repo. M0 is additive only — docs, a static sample
UI, reference snapshots, and a Pages deployment of the sample UI (via
the `gh-pages` branch — see §5). No live app code was
changed in M0.

---

## 1. What came over in M0 — and from where

All extracts were taken with `git archive` / `git show` from the old repo
at `~/workspace/finverse-ai`; no branch was checked out in this repo.

| What                                                                                                                                                                                 | New location                                        | Old source                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 0–4 contribution docs (6 files: `README.md` + `phase-0-deterministic-core.md`, `phase-1-llm-foundation.md`, `phase-2-rag.md`, `phase-3-guardrails.md`, `phase-4-readiness.md`) | `docs/vivek-bartwal-contributions/`                 | Branch `vivek/phase-4-readiness`, head `ff1ed11`. The docs themselves were authored across: `fff8a94` (Phase 0–2 docs), `1acbadb` (Phase 3 doc), `33f394b` (Phase 4 doc), on branches `vivek/phase-3-guardrails` and `vivek/phase-4-readiness`.                                                                                                                                     |
| LLM layer evaluation plan                                                                                                                                                            | `docs/llm-layer-plan.md`                            | Verbatim copy of `llm-layer-guardrails-readiness-evaluation-plan.md` from the project goal folder.                                                                                                                                                                                                                                                                                  |
| Sample UI — cream/forest-green/gold static prototype, 21 pages                                                                                                                       | `Vivek_frontend/` (45 files)                        | Old commit `1f22aff`. Verbatim: `index.html`, `app/*.html`, `assets/css/main.css`, `assets/js/*.js`, `README.md`. The old `.github/` dir was NOT copied (see §5).                                                                                                                                                                                                                   |
| Reference NestJS backend — `src/`, `prisma/`, `package.json` (109 files)                                                                                                             | `reference/nestjs-backend/`                         | Branch `vivek/phase-4-readiness`, head `ff1ed11`.                                                                                                                                                                                                                                                                                                                                   |
| Reference web math libs + tests — `indicators.ts`, `market.ts`, `optimization.ts`, `portfolio.ts`, `readiness.ts` and 4 test files (9 files, flat)                                   | `reference/web-math/`                               | Branch `vivek/phase-4-readiness`, head `ff1ed11` (old `apps/web/lib/` and `apps/web/test/`).                                                                                                                                                                                                                                                                                        |
| GitHub Pages deployment of the sample UI                                                                                                                                             | `gh-pages` branch (orphan, sample-UI files at root) | Pages serves the `gh-pages` branch (see §5). The Actions workflow (`.github/workflows/pages-sample-ui.yml`, adapted from the old `pages-vivek-frontend.yml` at `1f22aff`) is HELD, not committed: the migration token has no `workflow` scope, so GitHub rejected the push of any workflow file. The workflow file is saved outside the repo for later use once the scope is fixed. |

No `node_modules`, `dist`, `.next`, or `.env` files were copied — verified
none landed in any of the new directories.

---

## 2. What did NOT come over — and why

- **Groww-style UI clone — excluded.** The `Vivek_frontend_groww/` clone
  (old branch `vivek/groww-ui-clone`, 22 pages) was explicitly excluded
  per Vivek's call on 22 Nov 2026 ("grow clone ko rehne do"). It stays in
  the old repo only.
- **The old Next.js web app — superseded.** The old `apps/web` pages and
  components were not migrated. This repo's TanStack Start frontend is
  the live UI; porting old pages would duplicate it. Only the pure-math
  libraries were preserved, as reference (see §1).
- **No Prisma / Neon / NestJS service in the live app.** The old backend
  stack is preserved under `reference/` for audit only. The live data
  layer is Supabase; the live compute layer is TanStack server functions
  plus `src/lib/`. Nothing under `reference/` is imported, built, or
  deployed (see `reference/README.md`).
- **No credentials or secrets.** Nothing from the old repo's environment
  or secrets was carried over. The OpenRouter API key needed for live LLM
  testing is still outstanding (see the phase docs).

---

## 3. Mapping: old Phase 0–4 → new locations

| Old phase                                                                                                                                                               | Old implementation                                                    | New location / status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 0 — Deterministic core (SMA/EMA/RSI/MACD, CAGR/XIRR, Markowitz + Sharpe)                                                                                          | NestJS services + `apps/web/lib/`                                     | **Done in M1:** ported to `src/lib/calc/indicators.ts`, `src/lib/calc/portfolio-math.ts`, `src/lib/calc/optimization.ts` (pure functions, 37 new vitest tests; full suite 343/343 green). Original preserved in `reference/nestjs-backend/src/` and `reference/web-math/`. **Live market data done in M2 (see §7):** Yahoo quotes + history via the `market-data` Supabase Edge Function, wired behind the `getQuote`/`genHistory` seams with the simulated feed as fallback.                                                                                                                                   |
| Phase 1 — LLM foundation (OpenRouter provider, 7 typed tools, tool loop, rate limit + cache)                                                                            | NestJS `ai` module (`ai.provider.ts`, `ai.tools.ts`, `ai.service.ts`) | **Done in M3 (see §8):** `ai-chat` Supabase Edge Function — OpenRouter provider (primary `qwen/qwen-2.5-72b-instruct`), 8 typed tools (the old 7 + `searchKnowledge`, wired to RAG in M4 — see §9), tool loop ≤4 rounds, DB-backed rate limit (10/min/user) + 60s cache. Client: `EdgeFunctionAdapter` in `src/lib/ai/remote.ts` behind the existing `LLMAdapter` interface; chat prefers the function and falls back to the local regex engine.                                                                                                                                                                |
| Phase 2 — RAG (pgvector/Neon, embeddings, Yahoo news, Smart Screener, `searchKnowledge` tool)                                                                           | NestJS + Neon pgvector                                                | **Done in M4 (see §9):** pgvector migration 0006 (`rag_documents` + `match_documents` RPC) + `rag` Edge Function (index + search ops, bge-base-en-v1.5 embeddings via the same OpenRouter key) + real `searchKnowledge` tool in ai-chat (top 3 chunks, shared `_shared/rag.ts` search, no HTTP hop to the `rag` function). 8 seed guides indexed as shared docs (SIP, EMI, PPF, ELSS, emergency fund, readiness score, index vs active, diversification). News ingestion is a follow-up (needs a scheduled job — see §9).                                                                                       |
| Phase 3 — Guardrails (verification engine re-checking numeric claims against deterministic evidence, money exact to paise)                                              | NestJS verification engine                                            | **Done in M3 (see §8):** full verification-engine port in `supabase/functions/_shared/ai-guardrail.ts` (money exact to the paise, %/ratios ±0.1, one correction retry then a template answer built only from verified numbers), the 40-case corrupted-output suite ported to `src/lib/ai/guardrail.test.ts`, and the `guardrail_checks` log table in migration 0005.                                                                                                                                                                                                                                            |
| Phase 4 — Readiness (deterministic 0–100 score: emergency fund 25, debt-to-income 20, monthly surplus 25, concentration 15, volatility 15; bands 0–39 / 40–69 / 70–100) | NestJS `readiness` module + `GET /api/readiness`                      | **Done in M5:** merged 7-factor model in `src/lib/calc/readiness.ts` + `src/routes/readiness.tsx` (pure scorer + 28 new vitest tests). Merged weights (decided 22 Nov, see §6): emergency 20, savings rate 20, debt-to-income 15, budget discipline 10, fixed-cost ratio 10, concentration 15, volatility 10; existing 4 bands kept. Missing factor = unavailable, never zero; score rescales over available factors. Debt-to-income is unmeasured — this repo records no loans or outstanding debt. Volatility uses live price history where available, simulated otherwise (M2, see §7; disclosed in the UI). |

---

## 4. Phase-numbering collision

This repo already has its own **Phase 0–5** — the UI overhaul tracked in
PR #62 (103 files). Our backend phases (Phase 0–4 above) are a different
numbering for a different thing, and the two collide in conversation and
in docs.

**Proposal (not yet decided):** in this repo, refer to the backend phases
as **Backend Phases B0–B4** (B0 = deterministic core, B1 = LLM
foundation, B2 = RAG, B3 = guardrails, B4 = readiness). **Do not rename
any doc files** — `docs/vivek-bartwal-contributions/phase-0-…md` through
`phase-4-…md` keep their original names; only the spoken/written
shorthand in new docs and discussions changes, once agreed.

---

## 5. GitHub Pages — honest note

- The **TanStack app is SSR** (Nitro server). It cannot run on GitHub
  Pages, which serves static files only — not as-is. A static conversion
  is being feasibility-checked as a separate workstream; until that
  lands, there is no Pages build of the app.
- **Hosting decision (Vivek, 22 Nov 2026, 23:40 IST): ditch Vercel —
  GitHub Pages is the target host.** Vercel (`finverse-nu.vercel.app`)
  is the current host only; it is not the final state. The disconnect
  itself is a dashboard action for the repo owner.
- **Pages hosts the static `Vivek_frontend/` sample UI now**, served
  from an orphan `gh-pages` branch (sample-UI files at the branch root).
  **It does not build the TanStack app.** This step-one deployment stays
  valid regardless of the static-conversion outcome.
- **Why a branch, not a workflow:** the Actions workflow
  (`.github/workflows/pages-sample-ui.yml`, adapted from the old
  `pages-vivek-frontend.yml`) could not be pushed — GitHub rejected it
  because the migration token has no `workflow` scope ("refusing to
  allow a Personal Access Token to create or update workflow without
  `workflow` scope"). The workflow file is saved outside the repo; it
  can be committed later once a token with `workflow` scope (or the web
  UI) is available, and Pages can then switch its source to GitHub
  Actions.
- Pages is enabled with source `gh-pages` branch, `/` (root).

---

## 6. Decisions

Decisions taken by Vivek during the migration, recorded here so later
work does not re-litigate them.

### Readiness model — MERGE both models (22 Nov 2026, 23:39 IST)

The readiness score merges the two existing models instead of picking
one:

- **This repo's 4 factors stay:** emergency-fund coverage (35), savings
  rate (25), budget discipline (20), fixed-cost ratio (20) — as
  implemented in `src/routes/readiness.tsx`.
- **Our 3 additional factors join:** debt-to-income, portfolio
  concentration, volatility — from the old Phase 4 model.
- **Savings rate (theirs) and monthly surplus (ours) count as ONE
  factor** — they measure the same thing from two angles, so counting
  both would double-count surplus. The merged model has 7 factors, not 8.
- **Exact merged weights (7 factors, 100 points) are decided at M5**,
  not now. Do not invent weights before then.

### Hosting — ditch Vercel, GitHub Pages is the target (22 Nov 2026, 23:40 IST)

Vercel is dropped as the host; the website goes on GitHub Pages. The
honest status is in §5: the app is SSR and cannot run on Pages as-is,
and the static conversion is being feasibility-checked separately. The
sample UI on Pages (§5) is step one and stays valid regardless.

---

## 7. M2 — Live market data (Supabase Edge Function)

**Date:** 23 November 2026. **Status: code complete, function NOT yet
deployed** — deployment is an owner action (see below). Until the
function is deployed, every surface keeps showing simulated data; the
live layer fails soft and is invisible.

### What was built

- **Edge Function** `supabase/functions/market-data/index.ts` (Deno):
  fetches Yahoo Finance's public v8 chart API server-side (query1, with
  query2 fallback) and returns normalized JSON. `GET ?symbol=RELIANCE.NS`
  (quote + 5-day history), `?symbol=…&range=1y&interval=1d` (history),
  `?symbols=A,B,C` (batch quotes, max 20). Prices in rupees; the client
  converts to paise. 60s in-memory cache (per-instance — best-effort,
  not a guarantee). Errors are honest JSON (`{ error, code }`, never a
  stack trace): 400 bad symbol/range, 404 no data, 502 Yahoo
  unreachable. CORS allowlist: GitHub Pages origin, Vercel origin,
  localhost:8080/5173.
- **Shared parser** `supabase/functions/_shared/yahoo.ts`
  (runtime-agnostic, imported by both the function and the vitest
  suite): NSE symbol mapping (`RELIANCE` → `RELIANCE.NS`; indices
  `NIFTY50`/`SENSEX`/`BANKNIFTY` → `^NSEI`/`^BSESN`/`^NSEBANK`) and the
  Yahoo chart parser, ported from the old repo's `YahooFinanceProvider`
  (finite checks, null-close rows skipped, bars sorted ascending).
  `prevClose` is the second-to-last close — Yahoo's
  `meta.chartPreviousClose` is the close _before the range_, and using
  it would report the multi-day move as the day change (verified
  against the real fixture: +1.9, matching Yahoo's own `fulldayChange`).
- **`verify_jwt = false`** (`supabase/config.toml`, minimal — only the
  `[functions.market-data]` section): market data is public, the
  function holds no secrets and touches no user data, so requiring a
  JWT would add a failure mode for zero security benefit (the anon key
  is public by design). No other config was invented — migrations are
  still applied by hand in the SQL Editor.
- **Client** `src/lib/market/live.ts` + `src/lib/market/live-hooks.ts`:
  the Edge Function URL is derived from the existing
  `VITE_SUPABASE_URL` (no new env var); fetchers fail soft (null/empty
  on any failure); `resolveQuote`/`resolveHistory` pick live data when
  fetched and the simulated `getQuote`/`genHistory` otherwise, always
  reporting the `source`. React Query hooks (`useLiveQuote`,
  `useLiveQuotes`, `useLiveHistory`, `useLiveHistories`) with 60s
  staleTime, retry 1, no refocus refetch. Batch fetching is chunked to
  the function's 20-symbol cap client-side.
- **Wired surfaces:** stock detail (live price + 5Y chart + LIVE pill),
  markets/watchlist (live prices + change %, alerts evaluate on live
  prices), portfolio (live valuation + live prev-close for today's
  returns + live chart closes), screener (live LTP in results + search
  suggestions), readiness volatility (live 3M history per holding; the
  scorer is untouched — only its volatility input changed source, and
  the route adjusts the disclosure line). Every wired surface discloses
  live vs simulated in place (LIVE pill / subtitle / footer /
  methodology line). **Not wired (follow-up):** the ambient strips and
  snapshot cards (`MarketStrip`, `TickerStrip`, `MarketSnapshot`,
  `WatchlistCard`) still show simulated data — they are display-only
  and were out of the named scope.

### Yahoo reachability from this VM — VERIFIED

`query1` + `query2` both return HTTP 200 for `RELIANCE.NS` (raw fetch,
browser UA, no key, no crumb). Live smoke test through the real API +
the shared parser: RELIANCE.NS ₹1,377.50 (+1.90, +0.138%),
TCS.NS ₹2,376.20 (+33.50, +1.43%), ^NSEI 25,800.60 (+286.30, +1.122%)
— all 5-point series, last bar 2026-11-20. No `yahoo-finance2` needed.

### Verification

- Tests: 404/404 (371 baseline + 33 new in `src/lib/market/live.test.ts`
  — parser fixture is the real Yahoo response, mapping, URL derivation,
  mocked fetchers incl. chunking, resolvers). `bun run build` green
  (Nitro). tsc 45 total (baseline, zero in touched files). ESLint clean
  on touched files.
- **NOT verified:** the deployed function itself (needs the owner
  deploy below), the browser wiring against the live function (needs
  the deploy + a live Pages/Vercel URL), and Google sign-in style
  end-to-end flows. The Yahoo fetch + parse path IS verified live (see
  above); only the Supabase hosting hop is not.

### Owner deploy steps

1. Install the Supabase CLI and log in (`supabase login`), then link
   the project (`supabase link --project-ref txktgmzgpvymmostpmol`).
   Needs a Supabase access token — owner action.
2. From the repo root: `supabase functions deploy market-data`
   (the `verify_jwt = false` setting in `supabase/config.toml` is
   picked up automatically).
3. Smoke-test the deployed function (no auth needed):
   `curl "https://txktgmzgpvymmostpmol.supabase.co/functions/v1/market-data?symbol=RELIANCE.NS"`
   — expect HTTP 200 with a JSON quote. A 404 here means the deploy
   did not land.
4. Reload the app: stock detail should show the green LIVE pill and
   real prices; if it still shows SIMULATION, the function URL is
   wrong or the deploy failed — check the browser network tab for the
   `/functions/v1/market-data` call.

**Section-numbering note:** this is §7 on `main`. The M6 static
conversion (branch `feat/pages-static`) also added a §7 to this file;
M3 took §8 and M4 took §9 on main, so when that branch merges, the M6
§7 must be renumbered to §10.

---

## 8. M3 — Real OpenRouter LLM + guardrails (Supabase Edge Function)

**Date:** 23 November 2026. **Status: code complete, function NOT yet
deployed and the OpenRouter key does NOT exist yet** — the key is still
outstanding from Sarthak, and deployment is an owner action (see
below). Until both land, chat keeps answering from the local regex
engine; the remote path is invisible.

**Function URL (once deployed):**
`https://txktgmzgpvymmostpmol.supabase.co/functions/v1/ai-chat`

### What was built

- **Edge Function** `supabase/functions/ai-chat/index.ts` (Deno, zero
  dependencies — plain fetch only, like M2): holds the OpenRouter key
  as an env secret and runs the tool loop + guardrails server-side.
  The key never reaches the browser. `POST { "message": string }`
  (1–2000 chars) → `{ answer, claims, refused, refusalReason, model,
toolsUsed, disclaimer, verification }`. Errors are honest JSON
  (`{ error, code }`, never a stack trace): 400 bad message, 401 no
  JWT, 429 rate-limited, 502 OpenRouter unreachable, 503 key not
  configured (`AI_NOT_CONFIGURED` — the client renders guidance, not
  an error screen), 500 internal. CORS allowlist: same as
  market-data (Pages origin, Vercel origin, localhost:8080/5173).
- **8 tools** (`supabase/functions/_shared/ai-tools.ts`, the old
  Phase 1 seven + `searchKnowledge`): `getPortfolioSummary`,
  `getBudgetStatus`, `getTransactions`, `getStockQuote`,
  `getStockFundamentals`, `getCategorySpending`, `getGoalProgress`,
  `searchKnowledge`. Typed hand-rolled arg validation (no Zod — a
  bare `zod` import won't resolve in Deno and `npm:zod` won't
  resolve in vitest; the constraints and error strings match the
  Zod originals). The model reasons, the code calculates: tools
  return facts in rupees (paise/100) and never LLM-generated
  numbers. Tool loop: max 4 rounds, then a final structured answer
  or an honest failure. Simulated-brokerage rows (tag
  `simulated-brokerage`, or transfer + `investments` category) are
  excluded from spend/income math. Month/period boundaries use UTC
  dates (5:30h IST skew at month edges accepted, matching the old
  backend).
- **Guardrails** (`supabase/functions/_shared/ai-guardrail.ts`): full
  port of the Phase 3 verification engine — every numeric claim in
  the answer is re-checked against the tool evidence of THIS
  request by field name; money exact to the paise, %/ratios ±0.1.
  One retry with a correction prompt naming the failed claims and
  their correct values; if it still fails, the user gets a template
  answer built only from verified numbers
  (`supabase/functions/_shared/ai-templates.ts` — the template is
  pinned by test to pass the guardrail itself). Refusals (a
  prediction, a buy/sell question, missing data) skip verification.
  Every check is logged to `guardrail_checks`, fail-open: a logging
  failure is a warning, never a failed answer.
- **Data access** (`supabase/functions/_shared/postgrest.ts`): raw
  PostgREST via fetch — no supabase-js in the function, so esbuild
  can bundle-verify it without resolving remote imports. Every
  query carries the caller's JWT, so RLS enforces ownership. Live
  prices come from the `market-data` function (M2) over HTTP.
- **Migration 0005** (`supabase/migrations/0005_guardrail_checks.sql`,
  idempotent, 0003 style): `guardrail_checks` (append-only log:
  request/user/feature/attempt/claim/tool/check-type/expected/
  actual/verdict) + `ai_rate_limits` (one row per request, counted
  per user per minute window). RLS + "owner all" policy on both.
  **Manual-application queue:** 0003 and 0004 are still unapplied on
  the live database; 0005 joins the same queue. The function works
  without it (fail-open) but the check log stays empty and the
  limiter falls back to per-instance state until 0005 lands. M4
  takes migration 0006 (pgvector).
- **Client** (`src/lib/ai/remote.ts` + `src/routes/chat.tsx` +
  `src/components/ai/ChatMessage.tsx`): `EdgeFunctionAdapter`
  implements the existing `LLMAdapter` interface (the rule engine
  stays the fallback); the chat route prefers the function and
  falls back to the regex engine on any failure, with an honest
  degraded-state line under the header ("AI isn't set up yet —",
  "AI is busy —", "AI is unreachable — answering from your data").
  Verified answers carry a "Verified against your data" caption;
  template answers say they were built from verified numbers
  because the AI answer couldn't be checked. The function URL is
  derived from `VITE_SUPABASE_URL` (no new env var); the client
  passes the user's access token, fetched from the Supabase session.

### `verify_jwt = true` — and why it differs from market-data

`supabase/config.toml` gains `[functions.ai-chat]` with
`verify_jwt = true`. market-data is public (Yahoo quotes, no user
data, no secrets) so it needs no JWT; ai-chat reads USER data
(transactions, budgets, goals, holdings), so the Supabase gateway
must verify the JWT before the function runs. Inside, the same JWT
builds the PostgREST client — RLS applies to every query. The
service-role key is never used for user-data reads. (The user id is
decoded from the JWT `sub` claim only to key the rate limit and the
cache; the gateway and PostgREST both verify the signature.)

### Rate limit + cache — DB-backed, with honest limits

The old backend's in-memory 10/min limiter breaks on serverless
(per-instance state: with N isolates, a user could make N× the
limit). M3 therefore implements the limit in the database: one row
per request in `ai_rate_limits`, counted per user per 60-second
window (10/min), with opportunistic cleanup of rows older than an
hour. The in-memory limiter survives only as a backstop when the
table is unavailable (migration 0005 not applied) — documented as
best-effort in `_shared/ai-limits.ts`, never as a guarantee. The
60s identical-query cache is per-instance by the same token (a miss
just costs one more model call). Neither is silently shipped as if
it were global.

### Deviations from the old backend (deliberate, recorded)

- **No `getReadinessScore` tool yet:** the readiness score is
  computed client-side by `src/lib/calc/readiness.ts` (M5) and the
  Edge Function cannot import it. It joins when the scorer moves to
  a shared location.
- **No P/E / market-cap / 52-week fields in `getStockFundamentals`:**
  those came from Yahoo's quoteSummary endpoint, which needs a
  crumb session. Everything here is computed from the v8 chart
  history the `market-data` function already serves (price +
  technicals + 3-month range), and the tool description says exactly
  that — the model must not state any P/E.
- **No metrics-fallback in the function:** the old backend fell back
  to raw snapshot metrics when the model was unavailable. Here the
  client-side regex engine IS the fallback (the function returns a
  structured error and the chat degrades to local answers).
- **`getPortfolioSummary` values every holding** (live price when
  available, else avg buy price flagged `priced: false`) and totals
  include all holdings, with a top-level `priced` flag + note — a
  deviation from the old exclusion semantics, because avgPrice is a
  real number, not an absence.
- **Model defaults:** primary `qwen/qwen-2.5-72b-instruct`, reasoning
  `deepseek/deepseek-r1-0528` (reserved, unused in the chat path),
  timeout 30s/call, maxTokens 2048, temperature 0.2 — the same
  defaults as the old backend.

### Verification

- Tests: **495/495** (404 baseline + 91 new: 45 guardrail incl. the
  full corrupted-output suite, 26 tools incl. a fixed close series
  for the indicators, 20 answer-contract/template/client/limit
  tests). `bun run build` green (Nitro). tsc 45 total (baseline,
  zero in touched files). ESLint clean on touched files (one
  pre-existing react-refresh warning in `chat.tsx`).
- The Edge Function bundles cleanly with esbuild (88,779 bytes,
  zero dependencies resolved remotely). No `deno` on this VM — no
  Deno test run was possible; the function's pure logic is covered
  by vitest via the `_shared` modules.
- **NOT verified:** the live OpenRouter call (no API key exists
  yet), the deployed function itself (needs the owner deploy
  below), and the browser wiring against the deployed function
  (needs the deploy + a live Pages/Vercel URL). The tool loop,
  guardrail, templates, and parsers ARE verified by unit tests;
  only the hosted hop and the model itself are not.

### Owner deploy steps

1. Install the Supabase CLI and log in (`supabase login`), then link
   the project (`supabase link --project-ref txktgmzgpvymmostpmol`).
   Needs a Supabase access token — owner action. (Same step as M2;
   skip if already linked.)
2. From the repo root: `supabase functions deploy ai-chat`
   (the `verify_jwt = true` setting in `supabase/config.toml` is
   picked up automatically).
3. Set the OpenRouter key (once Sarthak provides it):
   `supabase secrets set OPENROUTER_API_KEY=...` — the key is an env
   secret on the function, never in the repo. Until it is set, the
   function answers 503 `AI_NOT_CONFIGURED` and chat keeps using the
   local engine.
4. Run `supabase/migrations/0005_guardrail_checks.sql` in the SQL
   Editor (same manual queue as 0003/0004). Without it, guardrail
   logging and the DB-backed rate limit stay inactive.
5. Smoke-test the deployed function with a signed-in user's JWT
   (the gateway rejects calls without one):
   `curl -X POST "https://txktgmzgpvymmostpmol.supabase.co/functions/v1/ai-chat" -H "apikey: <anon key>" -H "Authorization: Bearer <user JWT>" -H "Content-Type: application/json" -d '{"message": "How much did I spend this month?"}'`
   — expect HTTP 200 with a JSON answer. A 503 means the key is not
   set yet; a 401 means the JWT is missing/expired.
6. Reload the app and ask a money question in chat: a remote answer
   shows the "Verified against your data" caption. If the degraded
   line appears instead, check the browser network tab for the
   `/functions/v1/ai-chat` call.

---

## 9. M4 — RAG: pgvector + embeddings + `searchKnowledge` (Supabase Edge Function)

**Date:** 23 November 2026. **Status: code complete, function NOT yet
deployed, migration 0006 NOT applied, and the OpenRouter key does NOT
exist yet** — the key is still outstanding from Sarthak, and
deployment + migration are owner actions (see below). Until all three
land, `searchKnowledge` returns `available: false` and chat answers
concept questions from the local engine; the RAG layer is invisible.

**Function URL (once deployed):**
`https://txktgmzgpvymmostpmol.supabase.co/functions/v1/rag`

### What was built

- **Migration 0006** (`supabase/migrations/0006_rag_documents.sql`,
  idempotent, 0003 style): `create extension if not exists vector`
  (pgvector ships with Supabase Postgres) + a `rag_documents` table
  (one row per chunk: `owner_id`, `source_type`, `source_id`,
  `chunk_index`, `symbol`, `title`, `content`, `embedding`
  vector(768), `published_at`, `url`, `metadata`, `created_at`) + an
  ivfflat cosine index + a `match_documents(owner_id,
query_embedding, match_count, p_symbol)` RPC (cosine similarity,
  0.35 floor, top-N). `owner_id` NULL means a SHARED document (seed
  guides) — visible to every user through the RPC; a set owner
  means a user document, visible only to that user. The RPC is
  SECURITY DEFINER because RLS hides NULL-owner rows from direct
  PostgREST reads; it enforces the shared-or-owned rule in SQL.
  RLS + the "owner all" policy still apply to direct table access.
  **Manual-application queue:** 0003, 0004 and 0005 are still
  unapplied on the live database; 0006 joins the same queue. The
  functions degrade without it (no chunks, honest
  `available: false`) but return nothing until it lands.
- **Shared module** `supabase/functions/_shared/rag.ts` (ported from
  the old Phase 2 `src/rag/`): `chunkText` (~500 chars, 50-char
  overlap, sentence-aware with hard-splitting — see the
  chars-not-tokens note below), the news/profile/transaction chunk
  builders, an `OpenRouterEmbeddingsClient` (bge-base-en-v1.5,
  768d, same OpenRouter key as ai-chat; every returned vector's
  length is validated, and a mismatch fails loudly instead of
  storing a vector the column cannot hold), and `searchDocuments`
  (embed the query → `match_documents` RPC → parsed chunks).
  Search never throws: `available: false` is an outage, zero
  chunks is "no relevant context" — the two states are kept
  distinct on purpose, as in the old retrieval service.
- **Edge Function** `supabase/functions/rag/index.ts` (Deno, zero
  dependencies — plain fetch only, like M2/M3): two operations.
  `POST { "op": "index", ... }` chunks the content, embeds each
  chunk (batches of 25), deletes the document's old rows, and
  stores the new ones (re-indexing replaces; `shared: true` stores
  a NULL owner). `POST { "op": "search", "query", "match_count"?,
"symbol"? }` embeds the query and returns the top chunks with
  similarity scores. Errors are honest JSON (`{ error, code }`,
  never a stack trace): 400 bad request, 401 no JWT, 502
  embeddings unreachable, 503 key not configured
  (`AI_NOT_CONFIGURED` — same secret as ai-chat), 500 index
  failed. CORS allowlist: same as market-data / ai-chat.
  `verify_jwt = true` (`supabase/config.toml`, new
  `[functions.rag]` section): rag_documents are owner-scoped via
  RLS, so the gateway must verify the JWT — same reason as
  ai-chat.
- **`searchKnowledge` is real now** (`supabase/functions/_shared/ai-tools.ts`
  - `ai-chat/index.ts`): the M3 stub is gone. The tool asks for the
    top 3 chunks, normalises the symbol to Yahoo form, and returns
    the old shape (`{ available, chunks: [{ sourceType, title,
symbol, publishedAt (date-only), url, similarity (2dp), content
(capped 600 chars)] }`) the guardrail's `chunksFromToolResults`
    already expects. Its description now says what is actually
    indexed (guides; no news yet) and when to use it (concept /
    "what is…" / "how does … work" questions, market context — never
    for the user's own numbers). System prompt rule 8 was updated
    to match.
- **Seed documents** (`supabase/seed/rag-documents.json`): 8
  evergreen financial-literacy guides — what a SIP / EMI / PPF /
  ELSS is, emergency-fund basics, how the FinVerse readiness
  score works (7 factors, weights, bands — the app's own facts),
  index vs active funds, diversification. Content only — no
  embeddings stored (they are generated at index time), no market
  prices, no return figures, no interest rates. Indexed as shared
  docs by the owner (see the deploy steps).

### Why ai-chat does NOT call the rag function over HTTP

The `searchKnowledge` tool shares the `_shared/rag.ts` search code
in-process instead of calling the `rag` function server-to-server.
Three reasons: (1) no extra network hop inside the chat tool loop
(each tool round already waits on the model — a second HTTP
round-trip per search would add latency to every concept question);
(2) typed results — the tool gets `RetrievedChunk[]` directly
instead of parsing another function's JSON envelope; (3) one
implementation — the `rag` function's search op and the chat tool
cannot drift apart, because they are the same function. The `rag`
function stays the HTTP API for indexing (owner-invoked) and for
direct search from future clients; ai-chat just doesn't need the
HTTP hop to use the same logic. (M3's ai-chat DOES call market-data
over HTTP — but that function is public, keyless, and a genuinely
separate concern; the RAG search needs the same key and the same
PostgREST client ai-chat already has.)

### Chars, not tokens — a deliberate port decision

The old chunker caps chunks at 500 CHARS (~100–125 tokens), not 500
tokens: bge-base-en-v1.5 takes at most 512 tokens per input, so a
500-token chunk could exceed the model limit once tokenised, while
500 chars leaves generous headroom for any input. M4 ports the old
cap faithfully (same constant, same comment, same tests) rather than
raising it to 500 tokens.

### Verification

- Tests: **533/533** (495 baseline + 38 new: 34 in
  `src/lib/ai/rag.test.ts` — chunker incl. the ported old-spec
  cases, chunk builders, embedding request/response parsing,
  search-result parsing, `searchDocuments` behaviour with fake
  embed/RPC deps — and 6 rewritten `searchKnowledge` tool tests in
  `src/lib/ai/ai-tools.test.ts` replacing the 2 M3 stub tests).
  `bun run build` green (Nitro). tsc 45 total (baseline, zero in
  touched files). ESLint clean on touched files.
- Both functions bundle cleanly with esbuild (rag 22.1 KB, ai-chat
  94.4 KB, zero dependencies resolved remotely). No `deno` on this
  VM — no Deno test run was possible; the functions' pure logic is
  covered by vitest via the `_shared` modules.
- **NOT verified:** live embeddings (no API key exists yet), live
  pgvector search (no database access from here — the migration
  SQL, the RPC, and the ivfflat index are untested against a real
  Postgres with pgvector), the deployed functions, the seed
  indexing, or browser wiring against the deployed functions. The
  chunker, embeddings parsing, search parsing, and tool contract
  ARE verified by unit tests; only the hosted hop, the model, and
  the database are not.

### Owner deploy steps

1. Install the Supabase CLI and log in (`supabase login`), then link
   the project (`supabase link --project-ref txktgmzgpvymmostpmol`).
   Needs a Supabase access token — owner action. (Same step as
   M2/M3; skip if already linked.)
2. From the repo root: `supabase functions deploy rag`
   (the `verify_jwt = true` setting in `supabase/config.toml` is
   picked up automatically). The `OPENROUTER_API_KEY` secret is the
   same one ai-chat uses — set it once (step 3 of §8) and both
   functions share it. Until it is set, the rag function answers
   503 `AI_NOT_CONFIGURED` and `searchKnowledge` returns
   `available: false`.
3. Run `supabase/migrations/0006_rag_documents.sql` in the SQL
   Editor (same manual queue as 0003/0004/0005 — run them in
   order). Without it, indexing fails (no table) and search
   returns no chunks.
4. Index the 8 seed guides (once, after steps 2–3). Each document
   is one call with a signed-in user's JWT (sign in to the app,
   then copy the access token from the browser's local storage —
   the `sb-<project-ref>-auth-token` entry — or use any valid user
   JWT):
   `for doc in $(jq -c '.documents[]' supabase/seed/rag-documents.json); do body=$(echo "$doc" | jq '{op:"index", shared:true} + .'); curl -X POST "https://txktgmzgpvymmostpmol.supabase.co/functions/v1/rag" -H "apikey: <anon key>" -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" -d "$body"; done`
   Expect one `{ indexed: true, chunks: 2–3, shared: true }` per
   document. Re-running the loop replaces the old rows (safe to
   re-run).
5. Smoke-test search with the same JWT:
   `curl -X POST "https://txktgmzgpvymmostpmol.supabase.co/functions/v1/rag" -H "apikey: <anon key>" -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" -d '{"op":"search","query":"what is a SIP?"}'`
   — expect HTTP 200 with `available: true` and the SIP guide
   chunk. A 503 means the key is not set yet; a 401 means the JWT
   is missing/expired; `available: false` means the embeddings
   service or the database is unreachable.
6. Reload the app and ask a concept question in chat ("what is a
   SIP?"): the answer should cite the guide by title. If chat
   answers from the local engine instead, check the browser
   network tab for the `/functions/v1/ai-chat` call, and that the
   `rag` function + migration 0006 are both in place.

### Follow-ups (not built — recorded, not half-built)

- **News ingestion (out of scope for M4):** the old Phase 2
  ingested Yahoo news on a schedule. That needs a scheduled job
  (pg_cron calling the `rag` index op, or an external trigger) —
  an owner decision about where the scheduler lives. The chunk
  builder (`buildNewsChunkText`), the `news` source type, and the
  symbol filter are all in place; only the scheduled ingester is
  missing. Do not build a half-working version without the
  scheduler decision.
- **Rate limiting on the `rag` function:** none yet. Indexing is
  owner-invoked and search is cheap, and the chat path is already
  limited by ai-chat — but a direct caller with a valid JWT could
  call search/index without limit. A DB-backed limit (reusing the
  `ai_rate_limits` pattern from M3) belongs here when the function
  gets real traffic.
- **Shared-index restriction:** any signed-in user can currently
  index a `shared: true` document (visible to everyone). Shared
  indexing is owner-invoked by convention; restricting it needs an
  admin concept the app does not have yet (e.g. an allowlist of
  user ids checked in the function).
