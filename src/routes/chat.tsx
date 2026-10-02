import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, SendHorizontal } from "lucide-react";

import { ChatMessage, type ChatMsg } from "@/components/ai/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { billStatuses, previousMonth } from "@/lib/ai/engine";
import { ALL_CATEGORIES, categoryById } from "@/lib/finance/categories";
import { formatINR, monthKey, monthLabel, todayISO } from "@/lib/finance/format";
import { getBudgets, listTransactions, seedIfEmpty } from "@/lib/finance/store";
import type { Category, FinanceDB, Transaction } from "@/lib/finance/types";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — FinVerse AI" },
      {
        name: "description",
        content: "Ask FinVerse AI about your spending, budgets, bills, goals and portfolio.",
      },
    ],
  }),
  component: ChatPage,
});

// ---------------------------------------------------------------------------
// answerQuery: deterministic intent matching over the real store data.
// Every number in an answer comes from formatINR over store data.
// ---------------------------------------------------------------------------

const sumT = (txns: Transaction[]): number => txns.reduce((s, t) => s + t.amountPaise, 0);
const pctOf = (v: number): string => `${Math.round(v * 100)}%`;
const catName = (id: string): string => categoryById(id)?.label ?? id;

/** Find a category mentioned in the query, by id or a label word (len >= 4). */
function detectCategory(t: string): Category | undefined {
  for (const c of ALL_CATEGORIES) {
    if (t.includes(c.id)) return c;
    const words = c.label
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((w) => w.length >= 4);
    if (words.some((w) => t.includes(w))) return c;
  }
  return undefined;
}

const FALLBACK =
  "I can answer questions about your spending, budgets, bills, goals and portfolio — try one of the suggestions.";

export function answerQuery(
  q: string,
  db: FinanceDB,
): { text: string; link?: { to: string; label: string } } {
  const t = q.toLowerCase().trim();
  if (!t) return { text: FALLBACK };

  const today = todayISO();
  const key = monthKey(today);
  const prev = previousMonth(key);
  const label = monthLabel(key);
  const prevLabel = monthLabel(prev);

  const expenses = (k: string) => listTransactions(db, k).filter((x) => x.type === "expense");
  const income = (k: string) => listTransactions(db, k).filter((x) => x.type === "income");

  // --- bills / due ---
  if (/bill|due/.test(t)) {
    const upcoming = billStatuses(db, today).filter((s) => !s.paid);
    if (upcoming.length === 0) return { text: "No upcoming bills — everything due is paid." };
    const lines = upcoming.slice(0, 6).map((s) => {
      const when =
        s.daysUntil < 0
          ? `overdue by ${-s.daysUntil} day${-s.daysUntil === 1 ? "" : "s"}`
          : s.daysUntil === 0
            ? "due today"
            : `due in ${s.daysUntil} day${s.daysUntil === 1 ? "" : "s"}`;
      return `• ${s.bill.name}: ${formatINR(s.bill.amountPaise)} — ${when} (${s.dueISO})`;
    });
    return { text: `Here are your upcoming bills:\n${lines.join("\n")}` };
  }

  // --- goals ---
  if (/goal/.test(t)) {
    if (db.goals.length === 0) return { text: "You haven't set any goals yet." };
    const lines = db.goals.map((g) => {
      const done = g.targetPaise > 0 ? Math.round((g.savedPaise / g.targetPaise) * 100) : 0;
      return `• ${g.name}: ${formatINR(g.savedPaise)} of ${formatINR(g.targetPaise)} (${done}%) — deadline ${g.deadline}`;
    });
    return { text: `Your goals:\n${lines.join("\n")}` };
  }

  // --- budgets ---
  if (/budget/.test(t)) {
    const budgets = getBudgets(db, key);
    if (budgets.length === 0) return { text: `No budgets are set for ${label} yet.` };
    const spend = new Map<string, number>();
    for (const x of expenses(key))
      spend.set(x.category, (spend.get(x.category) ?? 0) + x.amountPaise);
    const lines = budgets.map((b) => {
      const spent = spend.get(b.categoryId) ?? 0;
      const used = b.limitPaise > 0 ? Math.round((spent / b.limitPaise) * 100) : 0;
      const tail =
        spent > b.limitPaise
          ? ` — over by ${formatINR(spent - b.limitPaise)}`
          : ` — ${formatINR(b.limitPaise - spent)} left`;
      return `• ${catName(b.categoryId)}: ${formatINR(spent)} of ${formatINR(b.limitPaise)} (${used}%)${tail}`;
    });
    return { text: `Budget status for ${label}:\n${lines.join("\n")}` };
  }

  // --- savings rate ---
  if (/saving|save/.test(t)) {
    const inc = sumT(income(key));
    const exp = sumT(expenses(key));
    if (inc <= 0)
      return {
        text: `I couldn't find any income recorded for ${label}, so I can't compute a savings rate yet.`,
      };
    const rate = (inc - exp) / inc;
    const incPrev = sumT(income(prev));
    let extra = "";
    if (incPrev > 0) {
      const ratePrev = (incPrev - sumT(expenses(prev))) / incPrev;
      extra = `\nLast month it was ${pctOf(ratePrev)}.`;
    }
    return {
      text: `Your savings rate for ${label} is ${pctOf(rate)} — ${formatINR(inc)} income minus ${formatINR(exp)} expenses.${extra}`,
    };
  }

  // --- investments / portfolio ---
  if (/invest|portfolio/.test(t)) {
    if (db.holdings.length === 0) return { text: "You don't hold any investments yet." };
    const lines = db.holdings.map((h) => {
      const value = Math.round(h.qty * h.avgPricePaise);
      return `• ${h.symbol}: ${h.qty} × ${formatINR(h.avgPricePaise)} = ${formatINR(value)}`;
    });
    const total = db.holdings.reduce((s, h) => s + Math.round(h.qty * h.avgPricePaise), 0);
    return {
      text: `Your portfolio is worth ${formatINR(total)} at average buy price (not live market prices):\n${lines.join("\n")}\n\nWant the full picture?`,
      link: { to: "/readiness", label: "Check your investment readiness score" },
    };
  }

  // --- spending ---
  if (/spend|spent|expense/.test(t)) {
    const cat = detectCategory(t);
    const cur = expenses(key);
    if (cat) {
      const amt = sumT(cur.filter((x) => x.category === cat.id));
      const amtPrev = sumT(expenses(prev).filter((x) => x.category === cat.id));
      const vsPrev = amtPrev > 0 ? `, vs ${formatINR(amtPrev)} in ${prevLabel}` : "";
      return { text: `You spent ${formatINR(amt)} on ${cat.label} in ${label}${vsPrev}.` };
    }
    const total = sumT(cur);
    if (cur.length === 0) return { text: `You haven't logged any spending in ${label} yet.` };
    const totalPrev = sumT(expenses(prev));
    const byCat = new Map<string, number>();
    for (const x of cur) byCat.set(x.category, (byCat.get(x.category) ?? 0) + x.amountPaise);
    const top = [...byCat.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, a]) => `${catName(id)} ${formatINR(a)}`)
      .join(" · ");
    const vsPrev = totalPrev > 0 ? ` (vs ${formatINR(totalPrev)} in ${prevLabel})` : "";
    return {
      text: `You spent ${formatINR(total)} in ${label}${vsPrev}.${top ? `\nTop categories: ${top}` : ""}`,
    };
  }

  // --- greeting ---
  if (/\b(hi|hello|hey)\b/.test(t)) {
    return {
      text: "Hello! I'm FinVerse AI. Ask me about your spending, savings rate, budgets, bills, goals, or portfolio — or tap one of the suggestions below.",
    };
  }

  return { text: FALLBACK };
}

// ---------------------------------------------------------------------------
// Chat UI (mobile-first, reduced-motion safe)
// ---------------------------------------------------------------------------

const SUGGESTIONS = [
  "How much did I spend this month?",
  "What's my savings rate?",
  "Which bills are due soon?",
  "How are my goals doing?",
];

let msgSeq = 0;
const nextId = () => `msg-${Date.now()}-${(msgSeq += 1)}`;

function ChatPage() {
  const dbQuery = useQuery({
    queryKey: ["finverse", "ai-db"],
    queryFn: () => seedIfEmpty(),
  });

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      role: "ai",
      text: "Hi! I'm FinVerse AI. Ask me anything about your money — spending, savings, budgets, bills, goals, or your portfolio.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  // Instant scroll (no smooth animation) to respect reduced-motion preferences.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [messages, typing]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    setMessages((m) => [...m, { id: nextId(), role: "user", text }]);
    setInput("");
    setTyping(true);
    timer.current = setTimeout(() => {
      const answer = dbQuery.data
        ? answerQuery(text, dbQuery.data)
        : dbQuery.isError
          ? {
              text: "I couldn't load your data just now — please reload the page and try again.",
            }
          : { text: "Still loading your data — one moment…" };
      setMessages((m) => [...m, { id: nextId(), role: "ai", ...answer }]);
      setTyping(false);
    }, 600);
  };

  // The app shell renders the sticky AppHeader above and the bottom tab bar
  // below (mobile); size the chat to the remaining viewport height.
  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden px-4">
        <div className="pb-1 pt-3">
          <h1 className="text-lg font-black tracking-tight">FinVerse AI Chat</h1>
          <p className="text-xs text-muted-foreground">Answers computed from your real data</p>
        </div>
        <div
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
          className="flex-1 space-y-4 overflow-y-auto py-4"
        >
          {messages.map((m) => (
            <ChatMessage key={m.id} msg={m} />
          ))}
          {typing && (
            <div className="flex gap-2" aria-label="FinVerse AI is typing">
              <span
                aria-hidden
                className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10"
              >
                <Bot className="size-4 text-primary" />
              </span>
              <div className="rounded-2xl rounded-bl-sm border bg-card px-4 py-2.5 text-sm text-muted-foreground">
                typing…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="pb-3">
          <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Suggested questions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={typing}
                onClick={() => send(s)}
                className="shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your money…"
              aria-label="Ask FinVerse AI"
              autoComplete="off"
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={typing || !input.trim()}
              aria-label="Send message"
            >
              <SendHorizontal className="size-4" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
