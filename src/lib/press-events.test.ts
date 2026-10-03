import { describe, expect, it } from "vitest";
import { classifyPressEvent } from "./press-events";

describe("classifyPressEvent — keypad press routing", () => {
  it("handles every pointerdown (touch/mouse/pen tap)", () => {
    expect(classifyPressEvent("pointerdown", 0)).toBe("press");
    expect(classifyPressEvent("pointerdown", 1)).toBe("press");
  });

  it("ignores the compatibility click that follows a handled pointerdown", () => {
    // Real mouse/touch clicks carry detail >= 1 and always follow the
    // pointerdown we already acted on — counting them would double the digit.
    expect(classifyPressEvent("click", 1)).toBeNull();
    expect(classifyPressEvent("click", 2)).toBeNull();
  });

  it("handles keyboard Enter/Space activation (click with detail 0)", () => {
    expect(classifyPressEvent("click", 0)).toBe("press");
  });

  it("rapid-tap sequence: 3 pointerdowns register 3 presses, compat clicks ignored", () => {
    // Simulates taps arriving faster than React re-renders: each tap is a
    // pointerdown (+ a compat click the browser may or may not deliver).
    const events: Array<["pointerdown" | "click", number]> = [
      ["pointerdown", 1],
      ["click", 1], // compat click after tap 1 — must NOT double-count
      ["pointerdown", 1],
      ["pointerdown", 1], // tap 3 before any re-render
    ];
    const presses = events.filter(([kind, detail]) => classifyPressEvent(kind, detail) === "press");
    expect(presses).toHaveLength(3);
  });
});
