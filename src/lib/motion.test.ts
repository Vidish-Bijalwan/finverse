import { describe, expect, it } from "vitest";

import { MOTION, motionIf } from "./motion";

describe("motion contract (§18 timing bands)", () => {
  it("micro interactions stay in the 100–180ms band", () => {
    expect(MOTION.micro).toBeGreaterThanOrEqual(100);
    expect(MOTION.micro).toBeLessThanOrEqual(180);
  });

  it("standard transitions stay in the 160–240ms band", () => {
    expect(MOTION.standard).toBeGreaterThanOrEqual(160);
    expect(MOTION.standard).toBeLessThanOrEqual(240);
  });

  it("sheet/dialog entrances stay in the 200–320ms band", () => {
    expect(MOTION.sheet).toBeGreaterThanOrEqual(200);
    expect(MOTION.sheet).toBeLessThanOrEqual(320);
  });

  it("motionIf returns the class only when motion is enabled", () => {
    expect(motionIf(true, "fv-check-pop")).toBe("fv-check-pop");
    expect(motionIf(false, "fv-check-pop")).toBeUndefined();
  });
});
