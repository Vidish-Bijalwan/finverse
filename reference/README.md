# reference/ — Preserved Original Implementation

This directory preserves the **original NestJS backend implementation and
pure-math web libraries** from the first FinVerse AI codebase
(`FinverseAI/FinVerse-AI`, old repo), brought over during the M0 migration
step (22 Nov 2026) from branch `vivek/phase-4-readiness` (head `ff1ed11`).

## What is here

- `nestjs-backend/` — the original NestJS backend: `src/` (all modules,
  including the LLM provider, RAG, guardrail verification engine, and
  readiness scoring), the `prisma/` schema + migrations, and
  `package.json`. 109 files.
- `web-math/` — the pure, dependency-free math libraries from the old
  Next.js web app (`apps/web/lib/`): indicators (SMA/EMA/RSI/MACD),
  market data helpers, portfolio optimisation (Markowitz + Sharpe),
  portfolio math (CAGR/XIRR), and the readiness scorer — plus their
  original test files (`apps/web/test/`). 9 files.

## What this directory is NOT

- **The live code in this repo is the TanStack port** in `src/lib/` plus
  the server functions. That is the code that runs, is tested, and is
  deployed (currently Vercel; GitHub Pages is the target host — see
  `docs/MIGRATION.md` §6).
- **Nothing under `reference/` is wired into the build**, imported by the
  app, or deployed. No import in `src/` points here; no build step reads
  this directory; no deploy includes it.
- The NestJS backend here is **not a running service** in this repo.
  There is no Prisma/Neon/NestJS service in the live app — the live data
  layer is Supabase.

## Why keep it

So the original logic, tests, and Prisma schema remain **auditable**
while the port to TanStack Start + Supabase is underway:

- The deterministic math (Phase 0) and the guardrail verification rules
  (Phase 3) can be compared line-by-line against their ports in
  `src/lib/`.
- The Prisma schema documents the data model the Supabase migrations
  are derived from.
- The test files show the exact numeric expectations the original
  implementations were verified against.

Do not edit files under `reference/` to change app behaviour — they are
a frozen snapshot. If a port diverges from the original, document the
divergence in `docs/MIGRATION.md` or the relevant phase doc instead.
