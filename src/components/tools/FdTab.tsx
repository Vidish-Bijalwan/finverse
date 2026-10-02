import { useMemo, useState } from "react";
import { Landmark, Percent, Wallet } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalcField } from "./CalcField";
import { ResultStat } from "./Stat";
import {
  calcFd,
  fdGrowthSeries,
  validateFd,
  COMPOUNDING_LABELS,
  type CompoundingFrequency,
  type FdInput,
} from "@/lib/calc/fd";
import { formatINR, formatINRShort } from "@/lib/finance/format";
import { axisTick } from "@/components/charts/money";
import { ChartSkeleton, MoneyTooltip } from "@/components/charts/shared";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const toPaise = (rupees: number) => Math.round(rupees * 100);

export function FdTab() {
  const [input, setInput] = useState<FdInput>({
    principal: 100000,
    annualRatePct: 7.25,
    years: 5,
    compounding: "quarterly",
  });
  const set = <K extends keyof FdInput>(k: K, v: FdInput[K]) => setInput((p) => ({ ...p, [k]: v }));

  const error = validateFd(input);
  const result = useMemo(() => calcFd(input), [input]);
  const series = useMemo(
    () =>
      fdGrowthSeries(input).map((p) => ({
        year: `Yr ${p.year}`,
        value: toPaise(p.value),
      })),
    [input],
  );
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">FD / lump-sum calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <CalcField
            id="fd-principal"
            label="Deposit amount"
            value={input.principal}
            onChange={(v) => set("principal", v)}
            min={1000}
            max={100000000}
            step={5000}
            format="rupees"
            error={
              error && (input.principal <= 0 || input.principal > 100_00_00_000) ? error : null
            }
          />
          <CalcField
            id="fd-rate"
            label="Annual interest rate"
            value={input.annualRatePct}
            onChange={(v) => set("annualRatePct", v)}
            min={1}
            max={15}
            step={0.05}
            format="percent"
            error={error && (input.annualRatePct < 0 || input.annualRatePct > 20) ? error : null}
          />
          <CalcField
            id="fd-years"
            label="Tenure"
            value={input.years}
            onChange={(v) => set("years", Math.round(v))}
            min={1}
            max={30}
            step={1}
            format="years"
            error={error && (input.years < 0.25 || input.years > 30) ? error : null}
          />
          <div className="space-y-2">
            <Label htmlFor="fd-compounding" className="text-sm font-medium text-foreground">
              Compounding frequency
            </Label>
            <Select
              value={input.compounding}
              onValueChange={(v) => set("compounding", v as CompoundingFrequency)}
            >
              <SelectTrigger id="fd-compounding" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(COMPOUNDING_LABELS) as CompoundingFrequency[]).map((f) => (
                  <SelectItem key={f} value={f}>
                    {COMPOUNDING_LABELS[f]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
              icon={<Landmark className="size-5" aria-hidden />}
            />
            <ResultStat
              label="Interest earned"
              value={formatINR(toPaise(result.interest))}
              accent="success"
              icon={<Percent className="size-5" aria-hidden />}
            />
            <ResultStat
              label="Effective annual yield"
              value={`${result.effectiveAnnualPct.toFixed(2)}%`}
              sub={`On a deposit of ${formatINRShort(toPaise(input.principal))}`}
              icon={<Wallet className="size-5" aria-hidden />}
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Value over time</CardTitle>
            </CardHeader>
            <CardContent>
              {series.length === 0 ? (
                <ChartSkeleton className="h-64" />
              ) : (
                <div className="h-64" role="img" aria-label="FD growth chart">
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
                        name="Value"
                        dataKey="value"
                        type="monotone"
                        fill="#2563EB"
                        fillOpacity={0.25}
                        stroke="#2563EB"
                        strokeWidth={2}
                        isAnimationActive={!reducedMotion}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Tax on FD interest is not included — interest is taxed at your slab rate.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
