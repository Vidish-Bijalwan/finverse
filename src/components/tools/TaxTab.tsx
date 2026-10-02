import { useMemo, useState } from "react";
import { CircleCheck, Scale, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalcField } from "./CalcField";
import { ResultRow } from "./Stat";
import {
  compareRegimes,
  validateTax,
  type OldAgeCategory,
  type RegimeTaxResult,
  type TaxInput,
} from "@/lib/calc/tax";
import { formatINR } from "@/lib/finance/format";
import { cn } from "@/lib/utils";

const toPaise = (rupees: number) => Math.round(rupees * 100);

const AGE_OPTIONS: { value: OldAgeCategory; label: string }[] = [
  { value: "below-60", label: "Below 60 years" },
  { value: "senior", label: "Senior citizen (60–80)" },
  { value: "super-senior", label: "Super senior (80+)" },
];

function SlabTable({ result }: { result: RegimeTaxResult }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Slab</TableHead>
          <TableHead className="text-right">Taxable</TableHead>
          <TableHead className="text-right">Tax</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {result.rows.map((row) => (
          <TableRow key={row.label} className={cn(row.taxableInSlab === 0 && "opacity-40")}>
            <TableCell className="text-xs font-medium">{row.label}</TableCell>
            <TableCell className="text-right text-xs tabular-nums">
              {formatINR(toPaise(row.taxableInSlab))}
            </TableCell>
            <TableCell className="text-right text-xs font-semibold tabular-nums">
              {formatINR(toPaise(row.tax))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RegimeCard({ result, isWinner }: { result: RegimeTaxResult; isWinner: boolean }) {
  return (
    <Card className={cn(isWinner && "border-emerald-500/50 ring-1 ring-emerald-500/30")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {result.regime === "new" ? "New regime" : "Old regime"}
          </CardTitle>
          {isWinner && (
            <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400">
              <Trophy className="mr-1 size-3" aria-hidden />
              Wins
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total tax payable
          </p>
          <p className="text-2xl font-bold tabular-nums">{formatINR(toPaise(result.totalTax))}</p>
          <p className="text-xs text-muted-foreground">
            Effective rate {result.effectiveRatePct.toFixed(2)}% of gross income
          </p>
        </div>
        <ResultRow label="Gross income" value={formatINR(toPaise(result.grossIncome))} />
        <ResultRow
          label="Standard deduction"
          value={formatINR(toPaise(result.standardDeduction))}
        />
        {result.regime === "old" && (
          <ResultRow
            label="Other deductions (80C/D)"
            value={formatINR(toPaise(result.otherDeductions))}
          />
        )}
        <ResultRow label="Taxable income" value={formatINR(toPaise(result.taxableIncome))} strong />
        {result.rebateApplied > 0 && (
          <ResultRow
            label="87A rebate applied"
            value={`−${formatINR(toPaise(result.rebateApplied))}`}
          />
        )}
        {result.surcharge > 0 && (
          <ResultRow label="Surcharge" value={formatINR(toPaise(result.surcharge))} />
        )}
        <ResultRow label="Health & education cess (4%)" value={formatINR(toPaise(result.cess))} />
        <div className="pt-1">
          <SlabTable result={result} />
        </div>
      </CardContent>
    </Card>
  );
}

export function TaxTab() {
  const [input, setInput] = useState<TaxInput>({
    grossIncome: 1500000,
    salaried: true,
    oldRegimeDeductions: 150000,
    age: "below-60",
  });
  const set = <K extends keyof TaxInput>(k: K, v: TaxInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const error = validateTax(input);
  const comparison = useMemo(() => compareRegimes(input), [input]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Income-tax estimator · FY 2026-27</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <CalcField
            id="tax-income"
            label="Gross annual income"
            value={input.grossIncome}
            onChange={(v) => set("grossIncome", v)}
            min={0}
            max={100000000}
            step={25000}
            format="rupees"
            error={error && input.grossIncome > 500_00_00_000 ? error : null}
          />
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label className="text-sm font-medium text-foreground">Salaried income</Label>
              <p className="text-xs text-muted-foreground">
                Enables standard deduction (₹75K new / ₹50K old regime)
              </p>
            </div>
            <Switch
              checked={input.salaried}
              onCheckedChange={(v) => set("salaried", v)}
              aria-label="Salaried income"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax-age" className="text-sm font-medium text-foreground">
              Age category (old regime slabs)
            </Label>
            <Select value={input.age} onValueChange={(v) => set("age", v as OldAgeCategory)}>
              <SelectTrigger id="tax-age" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CalcField
            id="tax-deductions"
            label="Deductions (80C, 80D, etc.)"
            value={input.oldRegimeDeductions}
            onChange={(v) => set("oldRegimeDeductions", v)}
            min={0}
            max={500000}
            step={5000}
            format="rupees"
            error={
              error &&
              (input.oldRegimeDeductions < 0 || input.oldRegimeDeductions > input.grossIncome)
                ? error
                : null
            }
            helper="Honoured only under the old regime"
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
          <Card
            className={cn(
              comparison.winner === "tie"
                ? "border-border"
                : "border-emerald-500/50 bg-emerald-500/5",
            )}
          >
            <CardContent className="flex items-center gap-3 p-4">
              {comparison.winner === "tie" ? (
                <Scale className="size-6 shrink-0 text-muted-foreground" aria-hidden />
              ) : (
                <CircleCheck
                  className="size-6 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                />
              )}
              <div>
                <p className="font-semibold">
                  {comparison.winner === "tie"
                    ? "Both regimes cost the same"
                    : `The ${comparison.winner} regime wins`}
                </p>
                {comparison.winner !== "tie" && (
                  <p className="text-sm text-muted-foreground">
                    You save {formatINR(toPaise(comparison.savings))} a year vs the other regime.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RegimeCard result={comparison.newRegime} isWinner={comparison.winner === "new"} />
            <RegimeCard result={comparison.oldRegime} isWinner={comparison.winner === "old"} />
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            FY 2026-27 slabs (AY 2027-28). New regime: no tax up to ₹12L taxable income via 87A
            rebate (with marginal relief); ₹75K standard deduction for salaried. Old regime: 87A
            rebate up to ₹5L taxable; ₹50K standard deduction for salaried. Includes 4% health &amp;
            education cess and surcharge. Estimate only — special-rate incomes (capital gains), TDS
            and state nuances are not modelled.
          </p>
        </>
      )}
    </div>
  );
}
