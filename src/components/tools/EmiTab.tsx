import { useMemo, useState } from "react";
import { CalendarClock, CreditCard, PiggyBank } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalcField } from "./CalcField";
import { ResultRow, ResultStat } from "./Stat";
import { calcEmi, emiYearlyBuckets, validateEmi, type EmiInput } from "@/lib/calc/emi";
import { formatINR, formatINRShort } from "@/lib/finance/format";
import { axisTick } from "@/components/charts/money";
import { ChartSkeleton, MoneyTooltip } from "@/components/charts/shared";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const toPaise = (rupees: number) => Math.round(rupees * 100);

export function EmiTab() {
  const [input, setInput] = useState<EmiInput>({
    principal: 1000000,
    annualRatePct: 9.5,
    months: 120,
  });
  const set = <K extends keyof EmiInput>(k: K, v: EmiInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const error = validateEmi(input);
  const result = useMemo(() => calcEmi(input), [input]);
  const buckets = useMemo(() => emiYearlyBuckets(result.schedule), [result.schedule]);
  const reducedMotion = usePrefersReducedMotion();

  const interestShare =
    result.totalPayable > 0 ? (result.totalInterest / result.totalPayable) * 100 : 0;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">EMI calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <CalcField
            id="emi-principal"
            label="Loan amount"
            value={input.principal}
            onChange={(v) => set("principal", v)}
            min={10000}
            max={100000000}
            step={10000}
            format="rupees"
            error={error && (input.principal <= 0 || input.principal > 50_00_00_000) ? error : null}
          />
          <CalcField
            id="emi-rate"
            label="Annual interest rate"
            value={input.annualRatePct}
            onChange={(v) => set("annualRatePct", v)}
            min={1}
            max={24}
            step={0.1}
            format="percent"
            error={error && (input.annualRatePct < 0 || input.annualRatePct > 60) ? error : null}
          />
          <CalcField
            id="emi-months"
            label="Tenure"
            value={input.months}
            onChange={(v) => set("months", Math.round(v))}
            min={6}
            max={360}
            step={6}
            format="months"
            error={error && (input.months < 1 || input.months > 360) ? error : null}
            helper={`${Math.floor(input.months / 12)}y ${input.months % 12}m`}
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
              label="Monthly EMI"
              value={formatINR(toPaise(result.emi))}
              accent="primary"
              icon={<CreditCard className="size-5" aria-hidden />}
            />
            <ResultStat
              label="Total interest"
              value={formatINR(toPaise(result.totalInterest))}
              sub={`${interestShare.toFixed(1)}% of total payable`}
              accent="warning"
              icon={<CalendarClock className="size-5" aria-hidden />}
            />
            <ResultStat
              label="Total payable"
              value={formatINR(toPaise(result.totalPayable))}
              icon={<PiggyBank className="size-5" aria-hidden />}
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Principal vs interest per year</CardTitle>
            </CardHeader>
            <CardContent>
              {buckets.length === 0 ? (
                <ChartSkeleton className="h-56" />
              ) : (
                <div className="h-56" role="img" aria-label="Yearly principal vs interest chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={buckets.map((b) => ({
                        year: `Yr ${b.year}`,
                        principal: toPaise(b.principal),
                        interest: toPaise(b.interest),
                      }))}
                      margin={{ top: 8, right: 4, bottom: 0, left: -8 }}
                      barGap={2}
                    >
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
                      <Bar
                        name="Principal"
                        dataKey="principal"
                        stackId="a"
                        fill="#2563EB"
                        radius={[0, 0, 0, 0]}
                        maxBarSize={26}
                        isAnimationActive={!reducedMotion}
                      />
                      <Bar
                        name="Interest"
                        dataKey="interest"
                        stackId="a"
                        fill="#F59E0B"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={26}
                        isAnimationActive={!reducedMotion}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Amortisation schedule
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {result.schedule.length} months
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-4">
              <ScrollArea className="h-80 rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                      <TableHead className="w-16">Month</TableHead>
                      <TableHead className="text-right">EMI</TableHead>
                      <TableHead className="text-right">Principal</TableHead>
                      <TableHead className="text-right">Interest</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.schedule.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium tabular-nums">{row.month}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatINRShort(toPaise(row.emi))}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-blue-600 dark:text-blue-400">
                          {formatINRShort(toPaise(row.principal))}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-amber-600 dark:text-amber-400">
                          {formatINRShort(toPaise(row.interest))}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatINRShort(toPaise(row.balance))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <div className="px-2 pt-3">
                <ResultRow label="Loan amount" value={formatINR(toPaise(input.principal))} />
                <ResultRow
                  label="Total interest"
                  value={formatINR(toPaise(result.totalInterest))}
                />
                <div className="border-t">
                  <ResultRow
                    label="Total payable"
                    value={formatINR(toPaise(result.totalPayable))}
                    strong
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
