import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ChevronDown,
  CircleDollarSign,
  Goal,
  HandCoins,
  Headphones,
  Lightbulb,
  Menu,
  Plus,
  ReceiptIndianRupee,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinVerse AI — Your Money, Clearly Explained" },
      { name: "description", content: "Track spending, understand investments, and make clearer financial decisions with explainable AI." },
      { property: "og:title", content: "FinVerse AI — Your Money, Clearly Explained" },
      { property: "og:description", content: "One clear view of your spending, investments, goals, and financial health." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FinVerseDashboard,
});

type Tab = "Expenses" | "Investments" | "Insights";

const quickActions = [
  { label: "Add Expense", icon: Plus },
  { label: "Budget", icon: WalletCards },
  { label: "Portfolio", icon: BriefcaseBusiness },
  { label: "Screener", icon: Search },
  { label: "AI Chatbot", icon: Bot },
  { label: "Goals", icon: Goal },
];

const transactions = [
  { name: "Grocery & essentials", note: "Today · UPI", amount: "− ₹2,480", icon: ReceiptIndianRupee },
  { name: "Monthly salary", note: "18 Sep · Bank transfer", amount: "+ ₹85,000", icon: CircleDollarSign, positive: true },
  { name: "Index fund SIP", note: "16 Sep · Investment", amount: "− ₹12,000", icon: TrendingUp },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5" aria-label="FinVerse home">
      <div className="grid size-9 place-items-center rounded-md bg-primary-dark shadow-logo">
        <ChartNoAxesCombined className="size-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <span className="text-xl font-black text-primary-dark">Fin<span className="text-primary">Verse</span></span>
    </div>
  );
}

function FinVerseDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Expenses");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const handleAction = (label: string) => {
    setNotice(`${label} is ready for your next entry.`);
    window.setTimeout(() => setNotice(""), 2200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 shadow-header backdrop-blur">
        <div className="mx-auto flex h-17 max-w-dashboard items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {["Dashboard", "Portfolio", "Insights", "Screener"].map((item, index) => (
              <button key={item} className={cn("text-sm font-medium transition-colors hover:text-primary", index === 0 ? "text-primary" : "text-foreground")}>{item}</button>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="outline" size="sm" onClick={() => handleAction("Sign in")}>Sign In</Button>
            <Button size="sm" onClick={() => handleAction("FinVerse app")}>Get the App</Button>
          </div>
          <Button variant="icon" size="icon" className="md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-background px-5 py-4 md:hidden">
            <nav className="grid gap-1" aria-label="Mobile navigation">
              {["Dashboard", "Portfolio", "Insights", "Screener"].map((item) => <button key={item} className="rounded-sm px-3 py-3 text-left text-sm font-medium hover:bg-muted">{item}</button>)}
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="border-b border-border bg-surface-soft">
          <div className="mx-auto grid max-w-dashboard gap-8 px-5 py-10 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:py-12">
            <div className="self-center">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-primary"><Sparkles className="size-4" /> YOUR FINANCIAL OVERVIEW</div>
              <h1 className="max-w-2xl text-3xl font-black leading-tight text-primary-dark sm:text-4xl">Your money, in one clear view.</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">Track spending, understand your investments, and make confident decisions with AI that always explains why.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => handleAction("Add Expense")}><Plus className="size-4" /> Add Expense</Button>
                <Button variant="outline" size="lg" onClick={() => setActiveTab("Insights")}>View AI Insights <ArrowRight className="size-4" /></Button>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 shadow-card sm:p-7">
              <div className="flex items-start justify-between">
                <div><p className="text-xs font-medium text-muted-foreground">TOTAL NET WORTH</p><p className="mt-2 text-3xl font-bold text-primary-dark">₹ 8,42,310</p></div>
                <div className="rounded-md bg-success-soft p-2.5"><TrendingUp className="size-5 text-success" /></div>
              </div>
              <div className="mt-3 flex items-center gap-2"><span className="font-bold text-success">+ ₹24,680</span><span className="text-sm text-muted-foreground">this month</span></div>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[72%] rounded-full bg-primary" /></div>
              <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>Assets ₹10.7L</span><span>Liabilities ₹2.3L</span></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-dashboard px-5 py-10 lg:px-8">
          <div className="flex items-end justify-between"><div><p className="text-sm font-bold text-primary">QUICK ACTIONS</p><h2 className="mt-1 text-2xl font-bold text-primary-dark">What would you like to do?</h2></div><button className="hidden items-center gap-1 text-sm font-bold text-primary hover:text-primary-hover sm:flex">View all <ArrowRight className="size-4" /></button></div>
          <div className="scrollbar-none mt-7 flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-6 sm:overflow-visible">
            {quickActions.map(({ label, icon: Icon }) => (
              <button key={label} onClick={() => handleAction(label)} className="group flex min-w-24 flex-col items-center gap-2.5 rounded-md p-2 text-center transition-transform hover:-translate-y-0.5">
                <span className="grid size-15 place-items-center rounded-md bg-tint shadow-tile transition-colors group-hover:bg-primary"><Icon className="size-6 text-primary transition-colors group-hover:text-primary-foreground" /></span>
                <span className="text-xs font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-surface-soft py-10">
          <div className="mx-auto max-w-dashboard px-5 lg:px-8">
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
              <div className="flex overflow-x-auto border-b border-border px-4 sm:px-7">
                {(["Expenses", "Investments", "Insights"] as Tab[]).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={cn("relative min-w-max px-4 py-5 text-sm font-bold transition-colors", activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground")}>{tab}{activeTab === tab && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-primary" />}</button>
                ))}
              </div>
              <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[1fr_320px]">
                <TabContent activeTab={activeTab} />
                <aside className="rounded-md bg-tint p-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-primary-dark"><Sparkles className="size-4 text-primary" /> FinVerse AI says</div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">Your dining spend is 18% lower than last month. Moving that difference to your emergency fund could complete it 3 weeks sooner.</p>
                  <button onClick={() => setActiveTab("Insights")} className="mt-4 flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-hover">See full insight <ArrowRight className="size-4" /></button>
                </aside>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-dashboard px-5 py-12 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            <FeatureCard icon={<Target className="size-6" />} eyebrow="KNOW YOUR NEXT MOVE" title="Investment Readiness Score" description="See if you're financially ready to invest more, explained in plain language." score="78" action="Check readiness" onClick={() => handleAction("Readiness score")} />
            <FeatureCard icon={<ChartNoAxesCombined className="size-6" />} eyebrow="BALANCE RISK & GROWTH" title="AI Portfolio Health" description="Diversification, risk, and fundamentals combined into one explainable score." score="84" action="View portfolio score" onClick={() => handleAction("Portfolio score")} />
          </div>
        </section>

        <section className="border-y border-border bg-tint/60">
          <div className="mx-auto grid max-w-dashboard gap-7 px-5 py-8 sm:grid-cols-3 lg:px-8">
            <Trust icon={<ShieldCheck />} title="Bank-grade security" detail="Encrypted and protected" />
            <Trust icon={<Lightbulb />} title="AI, explained" detail="No black-box scores" />
            <Trust icon={<Headphones />} title="24×7 help" detail="Support when you need it" />
          </div>
        </section>
      </main>

      <footer className="bg-background">
        <div className="mx-auto max-w-dashboard px-5 py-10 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div><Logo /><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">Decision support for better money habits. FinVerse does not provide financial advice.</p></div>
            {[["Product", "Dashboard", "Portfolio", "AI Insights"], ["Company", "About", "Security", "Contact"], ["Resources", "Help Centre", "Privacy", "Terms"]].map(([heading, ...links]) => <div key={heading}><h3 className="text-xs font-bold text-foreground">{heading}</h3><div className="mt-3 grid gap-2">{links.map((link) => <button key={link} className="w-fit text-left text-xs text-muted-foreground hover:text-primary">{link}</button>)}</div></div>)}
          </div>
          <div className="mt-10 flex flex-col gap-3 border-t border-border pt-5 text-xs text-faint sm:flex-row sm:items-center sm:justify-between"><span>© 2026 FinVerse AI. All rights reserved.</span><span>Data encrypted · Explainable AI · Decision support only</span></div>
        </div>
      </footer>

      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-sm bg-primary-dark px-4 py-3 text-sm font-medium text-primary-foreground shadow-modal">{notice}</div>}
    </div>
  );
}

function TabContent({ activeTab }: { activeTab: Tab }) {
  if (activeTab === "Investments") return <div><div className="flex items-end justify-between"><div><p className="text-xs font-medium text-muted-foreground">INVESTED VALUE</p><p className="mt-1 text-2xl font-bold text-primary-dark">₹ 4,18,600</p></div><span className="font-bold text-success">+12.4%</span></div><div className="mt-6 flex h-28 items-end gap-2">{[38,52,47,64,58,74,68,83,77,91,87,96].map((h,i)=><div key={i} className="flex-1 rounded-t-sm bg-primary/20" style={{height:`${h}%`}}><div className="h-1.5 rounded-sm bg-primary" /></div>)}</div></div>;
  if (activeTab === "Insights") return <div><h3 className="text-lg font-bold text-primary-dark">Three things worth your attention</h3><div className="mt-4 grid gap-3">{["Your savings rate rose to 31% this month.","Technology funds now form 28% of your portfolio.","You are ₹7,400 away from your emergency-fund goal."].map((text,i)=><div key={text} className="flex gap-3 rounded-md border border-border p-4"><span className="grid size-7 shrink-0 place-items-center rounded-sm bg-tint text-xs font-bold text-primary">{i+1}</span><p className="text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div></div>;
  return <div><div className="flex items-end justify-between"><div><p className="text-xs font-medium text-muted-foreground">SPENT THIS MONTH</p><p className="mt-1 text-2xl font-bold text-primary-dark">₹ 38,240</p></div><button className="flex items-center gap-1 text-xs font-bold text-muted-foreground">September <ChevronDown className="size-3.5" /></button></div><div className="mt-5 divide-y divide-border">{transactions.map(({name,note,amount,icon:Icon,positive})=><div key={name} className="flex items-center gap-3 py-3"><span className="grid size-9 shrink-0 place-items-center rounded-sm bg-muted"><Icon className="size-4 text-primary-dark" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{name}</p><p className="text-xs text-muted-foreground">{note}</p></div><span className={cn("text-sm font-bold",positive?"text-success":"text-foreground")}>{amount}</span></div>)}</div></div>;
}

function FeatureCard({ icon, eyebrow, title, description, score, action, onClick }: { icon: ReactNode; eyebrow: string; title: string; description: string; score: string; action: string; onClick: () => void }) {
  return <article className="group flex gap-5 rounded-lg border border-border bg-surface-soft p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-modal"><div className="grid size-12 shrink-0 place-items-center rounded-md bg-tint text-primary">{icon}</div><div className="min-w-0 flex-1"><p className="text-xs font-bold text-primary">{eyebrow}</p><h3 className="mt-1 text-lg font-bold text-primary-dark">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p><button onClick={onClick} className="mt-4 flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-hover">{action} <ArrowRight className="size-4" /></button></div><div className="hidden size-14 shrink-0 place-items-center rounded-full border-4 border-primary/20 text-lg font-bold text-primary-dark sm:grid">{score}</div></article>;
}

function Trust({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return <div className="flex items-center gap-3 sm:justify-center"><span className="text-primary [&>svg]:size-6">{icon}</span><div><p className="text-sm font-bold text-primary-dark">{title}</p><p className="text-xs text-muted-foreground">{detail}</p></div></div>;
}