import { describe, expect, it } from "vitest";
import {
  allowedRequestTransitions,
  canTransitionRequest,
  pendingReceivablePaise,
  validateRequestInput,
  type PaymentRequest,
} from "./payment-requests";

function request(overrides: Partial<PaymentRequest>): PaymentRequest {
  return {
    id: "r1",
    personName: "Meera",
    amountPaise: 20000,
    note: "",
    status: "pending",
    settledTxnId: null,
    createdAt: "2026-10-02T10:00:00.000Z",
    ...overrides,
  };
}

describe("request status machine", () => {
  it("allows pending → paid | declined | cancelled", () => {
    expect(allowedRequestTransitions("pending")).toEqual(["paid", "declined", "cancelled"]);
    expect(canTransitionRequest("pending", "paid")).toBe(true);
    expect(canTransitionRequest("pending", "declined")).toBe(true);
    expect(canTransitionRequest("pending", "cancelled")).toBe(true);
  });

  it("freezes terminal states — no transitions out", () => {
    for (const s of ["paid", "declined", "cancelled"] as const) {
      expect(allowedRequestTransitions(s)).toEqual([]);
      expect(canTransitionRequest(s, "pending")).toBe(false);
      expect(canTransitionRequest(s, "paid")).toBe(false);
    }
  });
});

describe("validateRequestInput", () => {
  it("accepts a clean payload", () => {
    expect(
      validateRequestInput({ personName: "  Meera  ", amountPaise: 50000, note: " dinner " }),
    ).toEqual({ ok: true, personName: "Meera", amountPaise: 50000, note: "dinner" });
  });

  it("rejects missing person and bad amounts", () => {
    expect(validateRequestInput({ personName: "  ", amountPaise: 50000 }).ok).toBe(false);
    expect(validateRequestInput({ personName: "Meera", amountPaise: 0 }).ok).toBe(false);
    expect(validateRequestInput({ personName: "Meera", amountPaise: -5 }).ok).toBe(false);
    expect(validateRequestInput({ personName: "Meera", amountPaise: 10.5 }).ok).toBe(false);
  });
});

describe("pendingReceivablePaise", () => {
  it("sums only pending requests", () => {
    const requests = [
      request({ id: "a", amountPaise: 20000, status: "pending" }),
      request({ id: "b", amountPaise: 50000, status: "pending" }),
      request({ id: "c", amountPaise: 99999, status: "paid" }),
      request({ id: "d", amountPaise: 11111, status: "declined" }),
    ];
    expect(pendingReceivablePaise(requests)).toBe(70000);
    expect(pendingReceivablePaise([])).toBe(0);
  });
});
