import { describe, expect, it } from "vitest";

import { QUICK_ACTIONS, targetFor, type QuickActionId } from "./quick-actions";

const EXISTING_ROUTES = new Set([
  "/payments",
  "/accounts",
  "/bills",
  "/more",
  "/portfolio",
  "/expenses",
  "/goals",
]);

describe("quick-actions", () => {
  it("every action has a unique id and label", () => {
    const ids = QUICK_ACTIONS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of QUICK_ACTIONS) expect(a.label.length).toBeGreaterThan(0);
  });

  it("every route target points at an existing route", () => {
    for (const a of QUICK_ACTIONS) {
      const t = targetFor(a.id);
      if (t.kind === "route") expect(EXISTING_ROUTES).toContain(t.to);
    }
  });

  it("routes every action: no dead buttons", () => {
    const expected: QuickActionId[] = [
      "scan-qr",
      "pay-contact",
      "upi-id",
      "bank-transfer",
      "recharge",
      "bills",
      "request",
      "more",
      "invest",
      "add-expense",
      "add-goal",
    ];
    for (const id of expected) {
      expect(() => targetFor(id)).not.toThrow();
    }
  });

  it("scan-qr and recharge open real dialogs", () => {
    expect(targetFor("scan-qr")).toEqual({ kind: "dialog", dialog: "qr-scan" });
    expect(targetFor("recharge")).toEqual({ kind: "dialog", dialog: "recharge" });
  });

  it("deep-links carry the flow search params", () => {
    expect(targetFor("pay-contact")).toEqual({
      kind: "route",
      to: "/payments",
      search: { flow: "recipient" },
    });
    expect(targetFor("request")).toEqual({
      kind: "route",
      to: "/payments",
      search: { tab: "razorpay" },
    });
    expect(targetFor("bank-transfer")).toEqual({
      kind: "route",
      to: "/accounts",
      search: { transfer: "1" },
    });
    expect(targetFor("add-expense")).toEqual({
      kind: "route",
      to: "/expenses",
      search: { add: "1" },
    });
    expect(targetFor("add-goal")).toEqual({
      kind: "route",
      to: "/goals",
      search: { add: "1" },
    });
  });

  it("throws for unknown actions", () => {
    expect(() => targetFor("teleport" as QuickActionId)).toThrow();
  });
});
