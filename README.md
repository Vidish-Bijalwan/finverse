# FinVerse AI — Personal Finance Intelligence

**Live demo:** https://finverse-nu.vercel.app/

FinVerse AI is a personal-finance intelligence web app: track spending, manage bills and
budgets, set savings goals, get explainable AI insights, and analyse investments —
with a fast, Paytm-inspired mobile-first experience built for India.

This is **Module 1 (personal expense tracking)** of a 3-module college major project.

---

## Features

### Money management
- **Dashboard** — net worth, monthly P&L, income-vs-expenses, category breakdown, quick actions
- **Expenses** — add / edit / delete transactions, month picker, search, category filters,
  swipe-to-delete on mobile, undo-friendly confirms
- **Smart entry** — natural-language input ("lunch 250 at office"), voice-input fallback,
  mock receipt extraction
- **Bills** — recurring bills with due dates; "mark paid" creates the matching expense
- **Budgets** — per-category monthly limits with 80% / 100% progress states
- **Goals** — savings goals with progress tracking and monthly-pace guidance

### AI (explainable, no API keys needed)
- **Insights** — 6+ insight cards computed from your real data, each with evidence
  ("Why this?") and a confidence level — never a bare unexplained score
- **AI Chat** — ask "how much did I spend on food this month?" or "what's my savings rate?"
  and get answers computed from your stored data
- **LLM-ready** — a typed `LLMAdapter` abstraction ships with the deterministic engine,
  so Ollama / OpenRouter can be plugged in later without touching the UI

### Investments
- **Portfolio** — holdings with quantity, average price, LTP, value, P&L, allocation donut
- **Screener** — 41-stock table with sector, P/E, dividend-yield and market-cap filters
- **Stock detail** — price history chart, 52-week range, fundamentals, rule-based AI analysis
- **Readiness score** — 0–100 investment-readiness score with explained factor cards
  (emergency-fund coverage, savings rate, budget discipline, fixed-cost ratio)
  plus a "Can I invest ₹X this month?" calculator

### Experience
- Paytm-inspired design language: bottom tab bar on mobile, bottom sheets, ₹ formatting
  (Indian numbering), quick actions, count-up numbers
- Loading skeletons, empty states with working CTAs, error states, toast notifications
- Touch gestures, reduced-motion support, responsive desktop / tablet / mobile layouts

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
| Persistence | Versioned `localStorage` store (`finverse:v1`), amounts in integer paise |
| Runtime | Bun |
| Deployment | Vercel (auto-deploys from `main`) |

---

## Architecture

```
┌─ Presentation ─────────────────────────────┐
│ routes/*  (11 routes: /, expenses, bills,   │
│  budgets, goals, insights, chat, portfolio, │
│  screener, stocks/$symbol, readiness, more) │
│ components/* (ui, money, ai, markets, shell)│
├─ Application ──────────────────────────────┤
│ lib/finance/hooks.ts  (React Query hooks)  │
│ lib/ai/engine.ts      (insight engine)     │
│ lib/ai/adapter.ts     (LLMAdapter stub)    │
├─ Domain ───────────────────────────────────┤
│ lib/finance/types.ts  (Transaction, Bill,  │
│   Budget, Goal, Holding — paise ints)      │
│ lib/finance/categories.ts                  │
├─ Infrastructure ───────────────────────────┤
│ lib/finance/store.ts  (localStorage CRUD,  │
│   seed data, versioned migrations)         │
└────────────────────────────────────────────┘
```

**Data flow:** UI → React Query hooks → `store.ts` (CRUD over `localStorage`) →
components re-render. The AI engine is a pure function over the store snapshot:
every insight carries its evidence and confidence, and the chat answers are
computed from the same data — no black boxes.

**Money handling:** all amounts are stored and computed as integer paise to avoid
float errors; formatting (`formatINR`) applies the Indian digit grouping (lakh/crore).

**AI design:** deterministic, explainable rules today (works offline, zero cost, no
keys). The `LLMAdapter` interface mirrors the engine's input/output contract so a
real model can replace or augment rules later.

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
    finance/         # types, store, hooks, categories, format
    ai/              # engine (insights), adapter (LLM stub)
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

No environment variables or API keys are required — the app seeds realistic demo
data on first launch. Your data stays in your browser's `localStorage`.

## Deployment

Pushes to `main` auto-deploy to production on Vercel:

- **Production:** https://finverse-nu.vercel.app/
- **Repo:** https://github.com/Vidish-Bijalwan/finverse

---

## Status & roadmap

All 14 tracked issues (#2–#15) are closed; 12 PRs merged. See
[PROGRESS_REPORT.md](./PROGRESS_REPORT.md) for the full build log, system design,
verification evidence, and what's next.

**Planned next steps (Modules 2–3 and hardening):**
- Real backend + auth (currently localStorage-only, single device)
- Plug a real LLM into `LLMAdapter` (Ollama / OpenRouter) for open-ended chat
- Live market-data feed (currently realistic seed data)
- PWA / offline install, push reminders for bills
- Export / import (CSV), multi-currency

---

## License

College major-project submission. All rights reserved by the author.
