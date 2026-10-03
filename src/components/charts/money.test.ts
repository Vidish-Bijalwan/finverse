import { describe, expect, it } from "vitest";

import { axisTick, paiseAxisTick } from "./money";

describe("paiseAxisTick", () => {
  it("formats paise as rupees — the Phase 4 review 100× axis bug", () => {
    // A ₹1,578 portfolio plots 157800 paise; the old tickFormatter rendered
    // raw paise with a ₹ prefix, so the axis read ₹1,57,800.
    expect(paiseAxisTick(157800)).toBe("₹1,578");
    expect(paiseAxisTick(14400000)).toBe("₹1,44,000");
    expect(paiseAxisTick(16000000)).toBe("₹1,60,000");
  });

  it("rounds fractional paise to the nearest rupee", () => {
    expect(paiseAxisTick(157850)).toBe("₹1,579");
  });
});

describe("axisTick", () => {
  it("renders compact short-form labels", () => {
    expect(axisTick(4000000)).toBe("₹40K");
  });
});
