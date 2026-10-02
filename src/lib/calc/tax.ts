/**
 * India income-tax estimator for FY 2026-27 (AY 2027-28) — pure functions.
 *
 * Slabs verified 2026-10-03 against Economic Times, Business Today and
 * Mathrubhumi (Budget 2026 made no changes; Income-tax Act, 2025 applies
 * from 1 Apr 2026 with the same structure).
 *
 * NEW regime (default):
 *   0–4L: 0% · 4–8L: 5% · 8–12L: 10% · 12–16L: 15% · 16–20L: 20%
 *   20–24L: 25% · >24L: 30%
 *   • 87A rebate: taxable income ≤ ₹12L → zero tax, with marginal relief
 *     (tax above ₹12L never exceeds the income above ₹12L).
 *   • Salaried standard deduction: ₹75,000 → salary up to ₹12.75L is tax-free.
 *   • Surcharge capped: 10% (50L–1Cr), 15% (1–2Cr), 25% (>2Cr).
 *
 * OLD regime (individual <60 / senior / super-senior):
 *   Below 60: 0–2.5L: 0% · 2.5–5L: 5% · 5–10L: 20% · >10L: 30%
 *   Senior (60–80): 0–3L exempt · Super senior (80+): 0–5L exempt
 *   • Salaried standard deduction: ₹50,000.
 *   • 87A rebate: taxable income ≤ ₹5L → zero tax.
 *   • 80C/80D-style deductions honoured; surcharge: 10%/15%/25%/37%.
 *
 * Cess: 4% health & education cess on (tax + surcharge) in both regimes.
 * Amounts are RUPEES.
 */

export interface TaxSlab {
  /** Slab floor in rupees (inclusive). */
  from: number;
  /** Slab ceiling in rupees (exclusive), null = no ceiling. */
  to: number | null;
  ratePct: number;
}

export interface TaxSlabRow {
  /** Human label, e.g. "₹4L – ₹8L @ 5%". */
  label: string;
  /** Income falling in this slab (rupees). */
  taxableInSlab: number;
  /** Tax on this slab (rupees). */
  tax: number;
}

export interface RegimeTaxResult {
  regime: "new" | "old";
  grossIncome: number;
  standardDeduction: number;
  otherDeductions: number;
  taxableIncome: number;
  rows: TaxSlabRow[];
  /** Slab tax before rebate/surcharge/cess. */
  baseTax: number;
  rebateApplied: number;
  surcharge: number;
  cess: number;
  /** Final payable tax (rupees). */
  totalTax: number;
  /** totalTax / grossIncome * 100. */
  effectiveRatePct: number;
}

const NEW_SLABS: TaxSlab[] = [
  { from: 0, to: 4_00_000, ratePct: 0 },
  { from: 4_00_000, to: 8_00_000, ratePct: 5 },
  { from: 8_00_000, to: 12_00_000, ratePct: 10 },
  { from: 12_00_000, to: 16_00_000, ratePct: 15 },
  { from: 16_00_000, to: 20_00_000, ratePct: 20 },
  { from: 20_00_000, to: 24_00_000, ratePct: 25 },
  { from: 24_00_000, to: null, ratePct: 30 },
];

const REBATE_LIMIT_NEW = 12_00_000;
const STD_DEDUCTION_NEW = 75_000;
const STD_DEDUCTION_OLD = 50_000;
const REBATE_LIMIT_OLD = 5_00_000;

export type OldAgeCategory = "below-60" | "senior" | "super-senior";

function oldSlabs(age: OldAgeCategory): TaxSlab[] {
  const exemption = age === "super-senior" ? 5_00_000 : age === "senior" ? 3_00_000 : 2_50_000;
  return [
    { from: 0, to: exemption, ratePct: 0 },
    { from: exemption, to: 5_00_000, ratePct: 5 },
    { from: 5_00_000, to: 10_00_000, ratePct: 20 },
    { from: 10_00_000, to: null, ratePct: 30 },
  ];
}

function slabLabel(s: TaxSlab): string {
  const lakh = (v: number) =>
    v % 10_00_000 === 0 ? `₹${v / 10_00_000}L` : `₹${(v / 1_00_000).toFixed(1)}L`;
  const range = s.to === null ? `Above ${lakh(s.from)}` : `${lakh(s.from)} – ${lakh(s.to)}`;
  return `${range} @ ${s.ratePct}%`;
}

/** Spread taxable income across slabs; returns rows + raw slab tax. */
function applySlabs(taxable: number, slabs: TaxSlab[]): { rows: TaxSlabRow[]; baseTax: number } {
  const rows: TaxSlabRow[] = [];
  let baseTax = 0;
  for (const s of slabs) {
    const upper = s.to ?? Number.POSITIVE_INFINITY;
    const inSlab = Math.max(0, Math.min(taxable, upper) - s.from);
    const tax = (inSlab * s.ratePct) / 100;
    rows.push({ label: slabLabel(s), taxableInSlab: inSlab, tax });
    baseTax += tax;
    if (taxable <= upper) break;
  }
  return { rows, baseTax };
}

function newRegimeSurcharge(taxable: number, baseTax: number): number {
  if (taxable > 2_00_00_000) return baseTax * 0.25;
  if (taxable > 1_00_00_000) return baseTax * 0.15;
  if (taxable > 50_00_000) return baseTax * 0.1;
  return 0;
}

function oldRegimeSurcharge(taxable: number, baseTax: number): number {
  if (taxable > 5_00_00_000) return baseTax * 0.37;
  if (taxable > 2_00_00_000) return baseTax * 0.25;
  if (taxable > 1_00_00_000) return baseTax * 0.15;
  if (taxable > 50_00_000) return baseTax * 0.1;
  return 0;
}

export interface TaxInput {
  /** Gross annual income in rupees. */
  grossIncome: number;
  /** Whether income is salary (enables standard deduction). */
  salaried: boolean;
  /** 80C/80D-style deductions — honoured ONLY under the old regime. */
  oldRegimeDeductions: number;
  age: OldAgeCategory;
}

export function calcNewRegime(input: TaxInput): RegimeTaxResult {
  const std = input.salaried ? STD_DEDUCTION_NEW : 0;
  const taxable = Math.max(0, Math.round(input.grossIncome - std));
  const { rows, baseTax } = applySlabs(taxable, NEW_SLABS);

  // 87A rebate: zero tax up to ₹12L, with marginal relief just above it.
  let rebateApplied = 0;
  let taxedBase = baseTax;
  if (taxable <= REBATE_LIMIT_NEW) {
    rebateApplied = baseTax;
    taxedBase = 0;
  } else if (taxable > REBATE_LIMIT_NEW) {
    const excess = taxable - REBATE_LIMIT_NEW;
    if (baseTax > excess) {
      // Marginal relief: tax can't exceed the income above ₹12L.
      rebateApplied = baseTax - excess;
      taxedBase = excess;
    }
  }

  const surcharge = newRegimeSurcharge(taxable, taxedBase);
  const net = taxedBase;
  const withSurcharge = net + surcharge;
  const cess = withSurcharge * 0.04;
  const totalTax = withSurcharge + cess;
  return {
    regime: "new",
    grossIncome: input.grossIncome,
    standardDeduction: std,
    otherDeductions: 0,
    taxableIncome: taxable,
    rows,
    baseTax,
    rebateApplied,
    surcharge,
    cess,
    totalTax,
    effectiveRatePct: input.grossIncome > 0 ? (totalTax / input.grossIncome) * 100 : 0,
  };
}

export function calcOldRegime(input: TaxInput): RegimeTaxResult {
  const std = input.salaried ? STD_DEDUCTION_OLD : 0;
  const deductions = Math.max(0, Math.min(input.oldRegimeDeductions, input.grossIncome - std));
  const taxable = Math.max(0, Math.round(input.grossIncome - std - deductions));
  const { rows, baseTax } = applySlabs(taxable, oldSlabs(input.age));

  let rebateApplied = 0;
  if (taxable <= REBATE_LIMIT_OLD) rebateApplied = baseTax;

  const taxedBase = Math.max(0, baseTax - rebateApplied);
  const surcharge = oldRegimeSurcharge(taxable, taxedBase);
  const withSurcharge = taxedBase + surcharge;
  const cess = withSurcharge * 0.04;
  const totalTax = withSurcharge + cess;
  return {
    regime: "old",
    grossIncome: input.grossIncome,
    standardDeduction: std,
    otherDeductions: deductions,
    taxableIncome: taxable,
    rows,
    baseTax,
    rebateApplied,
    surcharge,
    cess,
    totalTax,
    effectiveRatePct: input.grossIncome > 0 ? (totalTax / input.grossIncome) * 100 : 0,
  };
}

export interface TaxComparison {
  newRegime: RegimeTaxResult;
  oldRegime: RegimeTaxResult;
  winner: "new" | "old" | "tie";
  savings: number;
}

export function compareRegimes(input: TaxInput): TaxComparison {
  const newRegime = calcNewRegime(input);
  const oldRegime = calcOldRegime(input);
  const diff = oldRegime.totalTax - newRegime.totalTax;
  const winner = Math.abs(diff) < 1 ? "tie" : diff > 0 ? "new" : "old";
  return { newRegime, oldRegime, winner, savings: Math.abs(diff) };
}

export function validateTax(input: TaxInput): string | null {
  if (!Number.isFinite(input.grossIncome) || input.grossIncome < 0)
    return "Annual income can't be negative.";
  if (input.grossIncome > 500_00_00_000)
    return "Income looks too large — keep it under ₹500 crore.";
  if (!Number.isFinite(input.oldRegimeDeductions) || input.oldRegimeDeductions < 0)
    return "Deductions can't be negative.";
  if (input.oldRegimeDeductions > input.grossIncome)
    return "Deductions can't exceed your gross income.";
  return null;
}
