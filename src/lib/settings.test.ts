import { describe, expect, it } from "vitest";

import { validateBackup } from "./settings";

function makeBackup(overrides: Record<string, unknown> = {}) {
  return {
    app: "finverse",
    kind: "finverse-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: { theme: "system", monthStartDay: 1 },
    db: {
      transactions: [],
      budgets: [],
      bills: [],
      goals: [],
      holdings: [],
      accounts: [],
      customCategories: [],
      recurringRules: [],
      ...overrides,
    },
  };
}

describe("validateBackup", () => {
  it("accepts a well-formed backup", () => {
    expect(validateBackup(makeBackup())).toEqual([]);
  });

  it("requires the accounts/customCategories/recurringRules sections", () => {
    const b = makeBackup({ accounts: undefined });
    const errors = validateBackup(b);
    expect(errors.some((e) => e.includes('"accounts"'))).toBe(true);

    const b2 = makeBackup();
    // @ts-expect-error testing a malformed backup
    delete b2.db.recurringRules;
    expect(validateBackup(b2).some((e) => e.includes('"recurringRules"'))).toBe(true);
  });

  it("rejects zero-amount transaction rows (must not restore)", () => {
    const b = makeBackup({
      transactions: [{ id: "t1", type: "expense", amountPaise: 0, dateISO: "2026-10-01" }],
    });
    const errors = validateBackup(b);
    expect(errors.some((e) => e.includes("Transaction #1") && e.includes("amount"))).toBe(true);
  });

  it("rejects zero-amount recurring-rule rows", () => {
    const b = makeBackup({
      recurringRules: [
        {
          id: "r1",
          type: "expense",
          amountPaise: 0,
          category: "food",
          startDateISO: "2026-10-01",
        },
      ],
    });
    expect(validateBackup(b).length).toBeGreaterThan(0);
  });

  it("accepts zero opening balances on accounts (legitimate)", () => {
    const b = makeBackup({
      accounts: [{ id: "a1", name: "Cash", openingBalancePaise: 0 }],
    });
    expect(validateBackup(b)).toEqual([]);
  });

  it("rejects malformed account/category/rule rows", () => {
    const b = makeBackup({
      accounts: [{ id: "a1" }], // missing name + openingBalancePaise
      customCategories: [{ id: "c1", label: "", kind: "bogus" }],
      recurringRules: [{ id: "r1", type: "expense", amountPaise: 500, startDateISO: "not-a-date" }],
    });
    const errors = validateBackup(b);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes("Account #1"))).toBe(true);
    expect(errors.some((e) => e.includes("Category #1"))).toBe(true);
    expect(errors.some((e) => e.includes("Recurring rule #1"))).toBe(true);
  });
});
