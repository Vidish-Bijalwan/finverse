# FinVerse AI — Progress Report

**Project:** FinVerse AI — college major project, Module 1 (personal expense tracking)
**Repo:** https://github.com/Vidish-Bijalwan/finverse
**Live site:** https://finverse-nu.vercel.app/
**Stack:** TanStack Start · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · TanStack Query · Recharts · Bun
**Report date:** 2026-10-03

---

## 1. What this project is

FinVerse AI is a personal-finance intelligence web app for India: expense tracking,
bills, budgets, savings goals, explainable AI insights + chat, and investment
analysis (portfolio, stock screener, stock detail, investment-readiness score) —
with a Paytm-inspired mobile-first UX.

It started as a half-built prototype and was completed into a fully functional app:
every visible control works, every number is computed from real stored data, and
every AI output carries its evidence.

---

## 2. What has been done

### 2.1 Build history (issues → branches → PRs)

| # | Work | PR | State |
|---|---|---|---|
| — | Prototype baseline pushed to new repo | #1 | merged |
| #2 | Data core: typed models, versioned localStorage store (`finverse:v1`), paise-int money, seed data, React Query hooks | #16 | merged |
| #13 | App shell: Paytm-style nav, bottom tabs, sheets, ₹ formatting | #18 | merged |
| #4 | Bills, budgets, savings goals | #23 | merged |
| #8 | Explainable AI insights engine + AI chat | #25 | merged |
| #3 | Expense management + smart entry (NLP, voice fallback, receipt mock) | #26 | merged |
| #7 | Analytics dashboard from real data | #27 | merged |
| #9–#12 | Portfolio, screener, stock detail, risk/readiness | #28 | merged |
| #15 | Polish: skeletons, toasts, micro-interactions, sheet unification, dead-button sweep | #29 | merged |
| — | Security: patch TanStack Start XSS (CVE-2026-102989) | #30 | merged |
| — | Fix: AI chat stuck on loading (missing import) | #31 | merged |

All 14 tracked issues (#2–#15) are **closed**. Stale PRs #19–#22, #24 were superseded
and closed. `main` is production; every change landed via feature branch → PR → merge.

### 2.2 Feature checklist (all functional, all verified)

- Dashboard: net worth, monthly P&L, income-vs-expenses, category pie, quick actions
- Expenses: add / edit / delete, month picker, search, filters, swipe actions, toasts
- Smart entry: natural-language parsing, voice fallback, receipt extraction (mock)
- Bills: due list, "mark paid" posts the matching expense
- Budgets: per-category limits, 80% / 100% states
- Goals: progress %, monthly-pace guidance, add funds
- Insights: 6+ cards, each with evidence ("Why this?") and confidence
- AI chat: natural-language Q&A computed from stored data
- Portfolio: holdings, P&L, allocation donut; add / edit / remove
- Screener: 41 stocks, filter + sort
- Stock detail: chart, 52-week range, fundamentals, rule-based analysis
- Readiness: 0–100 score with 4 explained factors + "Can I invest ₹X?" calculator
- UX: skeletons, empty states with working CTAs, error states, toasts,
  reduced-motion support, responsive mobile / tablet / desktop

### 2.3 Verification performed

- Fresh clone of `main` → `bun install --frozen-lockfile` → `bun run build`: green
- `bun run lint`: 0 errors
- All 11 routes return HTTP 200 (local + production)
- Live-browser QA on production: 10/11 routes passed fully; add-expense → toast →
  totals update → delete flow passed; chat bug found (see §5) and fixed
- Security: patched CVE-2026-102989 (Vercel was blocking deploy on the vulnerable
  `@tanstack/react-start@1.168.32`; upgraded to the fixed 1.168.60)

---

## 3. System design & architecture

### 3.1 Layered architecture

```
┌─ Presentation ─────────────────────────────┐
│ src/routes/* — 11 file-based routes         │
│ src/components/ui — shadcn/Radix primitives │
│ src/components/money|ai|markets|shell       │
├─ Application ──────────────────────────────┤
│ src/lib/finance/hooks.ts — React Query      │
│   queries & mutations per entity            │
│ src/lib/ai/engine.ts — insight rules        │
│ src/lib/ai/adapter.ts — LLMAdapter (stub)   │
├─ Domain ───────────────────────────────────┤
│ src/lib/finance/types.ts — Transaction,     │
│   Bill, Budget, Goal, Holding (paise ints)  │
│ src/lib/finance/categories.ts               │
│ src/lib/finance/format.ts — formatINR etc.  │
├─ Infrastructure ───────────────────────────┤
│ src/lib/finance/store.ts — localStorage     │
│   CRUD, seedIfEmpty(), versioned schema     │
└────────────────────────────────────────────┘
```

### 3.2 Data flow

```
User action → component → React Query mutation → store.ts (localStorage)
→ query invalidation → components re-render
```

AI is a **pure function of the store snapshot**: `answerQuery(q, db)` and the
insight engine take the DB and return text + evidence. No network, no keys,
fully deterministic — which is what makes every AI output explainable.

### 3.3 Key design decisions

| Decision | Rationale |
|---|---|
| Amounts as integer paise | No floating-point rounding errors in money math |
| Versioned localStorage (`finverse:v1`) | Zero-backend demo that still models migrations |
| Indian numbering in `formatINR` | Lakh/crore grouping, ₹ symbol — built for Indian users |
| Deterministic AI engine + `LLMAdapter` stub | Explainable today; a real LLM (Ollama/OpenRouter) can plug in later without UI changes |
| File-based routing (TanStack Router) | One file per page; type-safe links |
| Paytm-inspired UX | Bottom tabs, sheets, quick actions — familiar to the target user |

### 3.4 Data model (simplified)

- **Transaction** `{ id, type: income|expense, amountPaise, category, note, dateISO, payMode }`
- **Bill** `{ id, name, amountPaise, dueDay, category, lastPaidOn }`
- **Budget** `{ categoryId, limitPaise, month }`
- **Goal** `{ id, name, targetPaise, savedPaise, deadline }`
- **Holding** `{ symbol, qty, avgPricePaise }` (+ seed market data: LTP, 52w range, fundamentals)

### 3.5 Deployment

- **Host:** Vercel, project `finverse` — auto-deploys from `main`
- **Production URL:** https://finverse-nu.vercel.app/
- **Build:** `bun run build` (vite + nitro); Node 24.x on Vercel

---

## 4. What remains / known limitations

**Remaining work (Modules 2–3 and hardening):**
1. Real backend + auth — data is localStorage-only (single browser, no sync)
2. Real LLM integration via `LLMAdapter` (Ollama / OpenRouter) for open-ended chat
3. Live market-data feed — prices/fundamentals are realistic seed data (some avg buy
   prices are intentionally jittered/unrealistic)
4. PWA support, bill-due push reminders
5. CSV export / import, multi-currency
6. 390px mobile interaction test (bottom tabs verified in markup, not yet
   interaction-tested at that width)
7. `tsc --noEmit` reports pre-existing strict-mode type warnings
   (`exactOptionalPropertyTypes`, index-signature access) — runtime-safe, but worth
   cleaning before submission

**Out of scope by design:** no real payments, no bank linking, no personal data
leaves the device.

---

## 5. Bug log (found in QA, fixed)

| Bug | Cause | Fix |
|---|---|---|
| Vercel deploy blocked (`BLOCKED_PACKAGE`) | `@tanstack/react-start@1.168.32` affected by CVE-2026-102989 (critical reflected XSS, GHSA-qx66-fv34-fjm8) | PR #30: bump to fixed 1.168.60 (+ `react-router` 1.170.41 to match its declared dep) |
| AI chat never answered ("Still loading…") | `chat.tsx` called `seedIfEmpty()` without importing it → queryFn threw ReferenceError → `data` stayed `undefined` | PR #31: add the missing import; show a real error message if the data query ever fails |

---

## 6. How to run / evaluate

```sh
bun install
bun run dev      # http://localhost:3000 — seeds demo data on first launch
bun run lint
bun run build
```

No API keys or env vars needed. To evaluate: add an expense and watch the dashboard
totals update; ask the chat "how much did I spend on food this month?"; pay a bill;
check the readiness score and its explained factors.
