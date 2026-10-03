import { describe, expect, it } from "vitest";

import { axisTick, paiseAxisTick, paiseTicks } from "./money";

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

describe("paiseTicks — unique labels", () => {
  const labels = (ticks: number[]) => ticks.map(paiseAxisTick);

  it("never emits duplicate labels on a flat series (the reported ₹1,578×2 bug)", () => {
    // Flat ₹1,578 history: recharts auto ticks emitted 157750/157800 paise,
    // both rounding to "₹1,578".
    const ticks = paiseTicks([157800, 157800, 157800, 157800]);
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    const ls = labels(ticks);
    expect(new Set(ls).size).toBe(ls.length);
  });

  it("keeps labels unique on near-flat series", () => {
    const ticks = paiseTicks([157790, 157795, 157800, 157805, 157810]);
    const ls = labels(ticks);
    expect(new Set(ls).size).toBe(ls.length);
  });

  it("spans the data range on a normal series", () => {
    const ticks = paiseTicks([140000, 145000, 150000, 160000, 155000]);
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    const ls = labels(ticks);
    expect(new Set(ls).size).toBe(ls.length);
    expect(Math.min(...ticks)).toBeLessThanOrEqual(140000);
    expect(Math.max(...ticks)).toBeGreaterThanOrEqual(160000);
  });

  it("returns [] for empty input", () => {
    expect(paiseTicks([])).toEqual([]);
  });
});
