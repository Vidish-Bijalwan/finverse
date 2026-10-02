import { useMemo, useState } from "react";
import { PiggyBank, TrendingUp, Wallet } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalcField } from "./CalcField";
import { ResultStat } from "./Stat";
import { calcSip, sipGrowthSeries, validateSip, type SipInput } from "@/lib/calc/sip";
import { formatINR, formatINRShort } from "@/lib/finance/format";
import { axisTick } from "@/components/charts/money";
import { ChartSkeleton, MoneyTooltip } from "@/components/charts/shared";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const toPaise = (rupees: number) => Math.round(rupees * 100);

export function SipTab() {
  const [input, setInput] = useState<SipInput>({
    monthlyAmount: 10000,
    annualRatePct: 12,
    years: 10,
  });
  const set = <K extends keyof SipInput>(k: K, v: SipInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const error = validateSip(input);
  const result = useMemo(() => calcSip(input), [input]);
  const series = useMemo(
    () =>
      sipGrowthSeries(input).map((p) => ({
        year: `Yr ${p.year}`,
        invested: toPaise(p.invested),
        value: toPaise(p.value),
      })),
    [input],
  );
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">SIP calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <CalcField
            id="sip-amount"
            label="Monthly investment"
            value={input.monthlyAmount}
            onChange={(v) => set("monthlyAmount", v)}
            min={500}
            max={1000000}
            step={500}
            format="rupees"
            error={
              error && (input.monthlyAmount <= 0 || input.monthlyAmount > 1_00_00_000)
                ? error
                : null
            }
            helper="How much you invest every month"
          />
          <CalcField
            id="sip-rate"
            label="Expected annual return"
            value={input.annualRatePct}
            onChange={(v) => set("annualRatePct", v)}
            min={1}
            max={30}
            step={0.5}
            format="percent"
            error={error && (input.annualRatePct < 0 || input.annualRatePct > 50) ? error : null}
          />
          <CalcField
            id="sip-years"
            label="Time period"
            value={input.years}
            onChange={(v) => set("years", Math.round(v))}
            min={1}
            max={30}
            step={1}
            format="years"
            error={error && (input.years < 1 || input.years > 60) ? error : null}
          />
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="p-4">
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ResultStat
              label="Maturity value"
              value={formatINR(toPaise(result.maturity))}
              accent="primary"
              icon={<PiggyBank className="size-5" aria-hidden />}
            />
            <ResultStat
              label="Total invested"
              value={formatINR(toPaise(result.invested))}
              icon={<Wallet className="size-5" aria-hidden />}
            />
            <ResultStat
              label="Est. gains"
              value={formatINR(toPaise(result.gains))}
              sub={`${formatINRShort(toPaise(result.gains))} over ${input.years}y`}
              accent="success"
              icon={<TrendingUp className="size-5" aria-hidden />}
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Growth over time</CardTitle>
            </CardHeader>
            <CardContent>
              {series.length === 0 ? (
                <ChartSkeleton className="h-64" />
              ) : (
                <div className="h-64" role="img" aria-label="SIP growth chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series} margin={{ top: 8, right: 4, bottom: 0, left: -8 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        dataKey="year"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={axisTick}
                        tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                        width={56}
                      />
                      <Tooltip content={<MoneyTooltip />} />
                      <Area
                        name="Invested"
                        dataKey="invested"
                        type="monotone"
                        fill="#94A3B8"
                        fillOpacity={0.25}
                        stroke="#94A3B8"
                        strokeWidth={2}
                        isAnimationActive={!reducedMotion}
                      />
                      <Area
                        name="Value"
                        dataKey="value"
                        type="monotone"
                        fill="#16A34A"
                        fillOpacity={0.25}
                        stroke="#16A34A"
                        strokeWidth={2}
                        isAnimationActive={!reducedMotion}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Assumes monthly investments at the start of each month and a constant annual return,
                compounded monthly. Actual market returns will vary.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
