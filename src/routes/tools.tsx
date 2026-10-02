import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CreditCard,
  Landmark,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmiTab } from "@/components/tools/EmiTab";
import { EmergencyTab } from "@/components/tools/EmergencyTab";
import { FdTab } from "@/components/tools/FdTab";
import { ForecastTab } from "@/components/tools/ForecastTab";
import { SipTab } from "@/components/tools/SipTab";
import { TaxTab } from "@/components/tools/TaxTab";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Tools — FinVerse AI" },
      {
        name: "description",
        content:
          "Financial calculators: SIP, EMI, FD, income-tax estimator, emergency-fund planner and cash-flow forecast.",
      },
    ],
  }),
  component: ToolsPage,
});

const TOOLS = [
  { id: "sip", label: "SIP", icon: PiggyBank, blurb: "Grow a monthly investment" },
  { id: "emi", label: "EMI", icon: CreditCard, blurb: "Loan instalments & schedule" },
  { id: "fd", label: "FD", icon: Landmark, blurb: "Lump-sum growth" },
  { id: "tax", label: "Tax", icon: ReceiptText, blurb: "FY 2026-27 estimator" },
  { id: "emergency", label: "Safety net", icon: ShieldCheck, blurb: "Emergency-fund planner" },
  { id: "forecast", label: "Forecast", icon: TrendingUp, blurb: "3-month cash flow" },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

function ToolsPage() {
  const [active, setActive] = useState<ToolId>("sip");
  const current = TOOLS.find((t) => t.id === active);

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10">
          <Wrench className="size-5 text-primary" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial tools</h1>
          <p className="text-sm text-muted-foreground">
            {current?.blurb ?? "Plan, compare and project your money"}
          </p>
        </div>
      </div>

      <Tabs value={active} onValueChange={(v) => setActive(v as ToolId)}>
        <TabsList
          aria-label="Financial calculators"
          className="flex h-auto w-full justify-start gap-1 overflow-x-auto p-1"
        >
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const selected = active === tool.id;
            return (
              <TabsTrigger
                key={tool.id}
                value={tool.id}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm",
                  selected && "shadow-sm",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {tool.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="pt-2">
          <TabsContent value="sip" className="mt-0">
            <SipTab />
          </TabsContent>
          <TabsContent value="emi" className="mt-0">
            <EmiTab />
          </TabsContent>
          <TabsContent value="fd" className="mt-0">
            <FdTab />
          </TabsContent>
          <TabsContent value="tax" className="mt-0">
            <TaxTab />
          </TabsContent>
          <TabsContent value="emergency" className="mt-0">
            <EmergencyTab />
          </TabsContent>
          <TabsContent value="forecast" className="mt-0">
            <ForecastTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
