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

| What                                                                                                                                                                                 | New location                            | Old source                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 0–4 contribution docs (6 files: `README.md` + `phase-0-deterministic-core.md`, `phase-1-llm-foundation.md`, `phase-2-rag.md`, `phase-3-guardrails.md`, `phase-4-readiness.md`) | `docs/vivek-bartwal-contributions/`     | Branch `vivek/phase-4-readiness`, head `ff1ed11`. The docs themselves were authored across: `fff8a94` (Phase 0–2 docs), `1acbadb` (Phase 3 doc), `33f394b` (Phase 4 doc), on branches `vivek/phase-3-guardrails` and `vivek/phase-4-readiness`. |
| LLM layer evaluation plan                                                                                                                                                            | `docs/llm-layer-plan.md`                | Verbatim copy of `llm-layer-guardrails-readiness-evaluation-plan.md` from the project goal folder.                                                                                                                                              |
| Sample UI — cream/forest-green/gold static prototype, 21 pages                                                                                                                       | `Vivek_frontend/` (45 files)            | Old commit `1f22aff`. Verbatim: `index.html`, `app/*.html`, `assets/css/main.css`, `assets/js/*.js`, `README.md`. The old `.github/` dir was NOT copied (see §5).                                                                               |
| Reference NestJS backend — `src/`, `prisma/`, `package.json` (109 files)                                                                                                             | `reference/nestjs-backend/`             | Branch `vivek/phase-4-readiness`, head `ff1ed11`.                                                                                                                                                                                               |
| Reference web math libs + tests — `indicators.ts`, `market.ts`, `optimization.ts`, `portfolio.ts`, `readiness.ts` and 4 test files (9 files, flat)                                   | `reference/web-math/`                   | Branch `vivek/phase-4-readiness`, head `ff1ed11` (old `apps/web/lib/` and `apps/web/test/`).                                                                                                                                                    |
| GitHub Pages deployment of the sample UI | `gh-pages` branch (orphan, sample-UI files at root) | Pages serves the `gh-pages` branch (see §5). The Actions workflow (`.github/workflows/pages-sample-ui.yml`, adapted from the old `pages-vivek-frontend.yml` at `1f22aff`) is HELD, not committed: the migration token has no `workflow` scope, so GitHub rejected the push of any workflow file. The workflow file is saved outside the repo for later use once the scope is fixed. |

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

| Old phase                                                                                                                                                               | Old implementation                                                    | New location / status                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 0 — Deterministic core (SMA/EMA/RSI/MACD, CAGR/XIRR, Markowitz + Sharpe)                                                                                          | NestJS services + `apps/web/lib/`                                     | **Done in M1:** ported to `src/lib/calc/indicators.ts`, `src/lib/calc/portfolio-math.ts`, `src/lib/calc/optimization.ts` (pure functions, 37 new vitest tests; full suite 343/343 green). Original preserved in `reference/nestjs-backend/src/` and `reference/web-math/`. |
| Phase 1 — LLM foundation (OpenRouter provider, 7 typed tools, tool loop, rate limit + cache)                                                                            | NestJS `ai` module (`ai.provider.ts`, `ai.tools.ts`, `ai.service.ts`) | Planned `OpenRouterAdapter` on `src/lib/ai/llm.ts` + a server function.                                                                                                                                                                                                    |
| Phase 2 — RAG (pgvector/Neon, embeddings, Yahoo news, Smart Screener, `searchKnowledge` tool)                                                                           | NestJS + Neon pgvector                                                | Planned Supabase pgvector migration.                                                                                                                                                                                                                                       |
| Phase 3 — Guardrails (verification engine re-checking numeric claims against deterministic evidence, money exact to paise)                                              | NestJS verification engine                                            | Planned pure-TypeScript port.                                                                                                                                                                                                                                              |
| Phase 4 — Readiness (deterministic 0–100 score: emergency fund 25, debt-to-income 20, monthly surplus 25, concentration 15, volatility 15; bands 0–39 / 40–69 / 70–100) | NestJS `readiness` module + `GET /api/readiness`                      | Planned port. **Decision made 22 Nov (see §6): MERGE both models** — the existing 4 factors plus our debt-to-income, concentration, and volatility; savings rate and monthly surplus count as one factor. Exact merged weights (7 factors, 100 points) decided at M5.      |

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
