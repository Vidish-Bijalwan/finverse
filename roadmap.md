# FinVerse dashboard roadmap

- [x] Apply the uploaded visual system and original FinVerse branding
- [x] Build responsive navigation, overview, quick actions, tabbed finance panel, feature scores, trust row, and footer
- [x] Add interactive controls and illustrative finance data
- [x] Add page metadata
- [x] Verify desktop and mobile layouts, interactions, overflow, runtime, and build status

# FinVerse app roadmap (current)

Done:
- [x] Supabase backend (Postgres + Auth + Storage) replaces localStorage
- [x] Google OAuth + email/password, onboarding wizard, route guards
- [x] Fintech UI overhaul (PR #62): payments hub, markets/portfolio, net-worth hero
- [x] Immersive login (PRs #64/#65)
- [x] Deep audit + robustness fixes (PR #66): forgot-password, error states, balance blocking, security headers, 0004 constraints migration

Pending owner actions:
- [ ] Run migrations 0003 + 0004 in the Supabase SQL Editor
- [ ] Supabase dashboard: signup rate limits, confirm-email decision, HaveIBeenPwned + min length 8
- [ ] Delete QA Auth accounts (audit-probe-1..20, audit-deep1/2, weakpw2, earlier QA accounts)

Next (Modules 2–3):
- [ ] Real LLM via `LLMAdapter` (Ollama / OpenRouter)
- [ ] Live market-data feed (currently simulated with disclosures)
- [ ] PWA / offline install, bill-due push reminders
- [ ] Multi-currency, live Razorpay test keys
