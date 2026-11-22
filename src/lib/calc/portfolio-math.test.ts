import { describe, expect, it } from "vitest";
import { cagr, cagrFromDates, xirr } from "./portfolio-math";

describe("cagr", () => {
  it("matches the synopsis formula", () => {
    // (12100 / 10000) ^ (1/2) − 1 = 0.10 exactly.
    expect(cagr(10000, 12100, 2)).toBeCloseTo(0.1, 12);
    // Excel RRI example: (25000 / 10000) ^ (1/5) − 1 ≈ 0.2011.
    expect(cagr(10000, 25000, 5)).toBeCloseTo(0.2011, 4);
    // A total loss is −100%.
    expect(cagr(10000, 0, 3)).toBe(-1);
  });

  it("returns null for inputs with no defined rate", () => {
    expect(cagr(0, 10000, 2)).toBeNull();
    expect(cagr(-100, 10000, 2)).toBeNull();
    expect(cagr(10000, -100, 2)).toBeNull();
    expect(cagr(10000, 12100, 0)).toBeNull();
    expect(cagr(10000, 12100, -1)).toBeNull();
    expect(cagr(Number.NaN, 10000, 2)).toBeNull();
  });
});

describe("cagrFromDates", () => {
  it("measures years in 365-day years", () => {
    // Exactly two 365-day years: 10000 → 12100 is 10%.
    expect(cagrFromDates(10000, 12100, "2024-01-01", "2026-01-01")).toBeCloseTo(0.1, 3);
    expect(cagrFromDates(10000, 12100, "2026-01-01", "2024-01-01")).toBeNull();
    expect(cagrFromDates(10000, 12100, "2026-01-01", "2026-01-01")).toBeNull();
    expect(cagrFromDates(10000, 12100, "not-a-date", "2026-01-01")).toBeNull();
  });

  it("accepts Date objects", () => {
    expect(
      cagrFromDates(
        10000,
        12100,
        new Date("2024-01-01T00:00:00Z"),
        new Date("2026-01-01T00:00:00Z"),
      ),
    ).toBeCloseTo(0.1, 3);
    expect(
      cagrFromDates(10000, 12100, new Date("invalid"), new Date("2026-01-01T00:00:00Z")),
    ).toBeNull();
  });
});

describe("xirr", () => {
  it("matches Microsoft's documented Excel example: 37.34%", () => {
    // Microsoft Support, XIRR function: −10000 on 1 Jan 2008, then 2750
    // (1 Mar 08), 4250 (30 Oct 08), 3250 (15 Feb 09), 2750 (1 Apr 09).
    // Excel returns 0.373362535.
    const result = xirr([
      { amount: -10000, date: "2008-01-01" },
      { amount: 2750, date: "2008-03-01" },
      { amount: 4250, date: "2008-10-30" },
      { amount: 3250, date: "2009-02-15" },
      { amount: 2750, date: "2009-04-01" },
    ]);
    expect(result).toBeCloseTo(0.373362535, 4);
  });

  it("is exact for a single one-year round trip", () => {
    // −10000 on 2021-01-01, +11000 exactly 365 days later: 10%.
    expect(
      xirr([
        { amount: -10000, date: "2021-01-01" },
        { amount: 11000, date: "2022-01-01" },
      ]),
    ).toBeCloseTo(0.1, 9);
    // A leap-year span prices the extra day: 366 days for the same 10%.
    expect(
      xirr([
        { amount: -10000, date: "2020-01-01" },
        { amount: 11000, date: "2021-01-01" },
      ]),
    ).toBeCloseTo(Math.pow(1.1, 365 / 366) - 1, 9);
  });

  it("accepts Date objects and unsorted flows", () => {
    const result = xirr([
      { amount: 11000, date: new Date("2022-01-01T00:00:00Z") },
      { amount: -10000, date: new Date("2021-01-01T00:00:00Z") },
    ]);
    expect(result).toBeCloseTo(0.1, 9);
  });

  it("returns null when no rate exists", () => {
    expect(xirr([])).toBeNull();
    expect(xirr([{ amount: -1000, date: "2021-01-01" }])).toBeNull();
    // All flows on one side of zero: no sign change, no IRR.
    expect(
      xirr([
        { amount: -1000, date: "2021-01-01" },
        { amount: -2000, date: "2022-01-01" },
      ]),
    ).toBeNull();
    expect(
      xirr([
        { amount: 1000, date: "2021-01-01" },
        { amount: 2000, date: "2022-01-01" },
      ]),
    ).toBeNull();
    // A zero flow or a bad date invalidates the schedule.
    expect(
      xirr([
        { amount: -1000, date: "2021-01-01" },
        { amount: 0, date: "2022-01-01" },
      ]),
    ).toBeNull();
    expect(
      xirr([
        { amount: -1000, date: "2021-01-01" },
        { amount: 1100, date: "not-a-date" },
      ]),
    ).toBeNull();
  });

  it("returns null when the NPV has no root (non-convergence)", () => {
    // Both flows on the same day: NPV is a constant +100 at every rate, so
    // Newton stalls (zero derivative) and bisection finds no sign change.
    expect(
      xirr([
        { amount: -1000, date: "2021-01-01" },
        { amount: 1100, date: "2021-01-01" },
      ]),
    ).toBeNull();
  });
});
