import { describe, expect, it } from "vitest";

import { clampIndex, indexAtScroll, roveIndex, stepIndex } from "./tabsNav";

describe("clampIndex", () => {
  it("clamps into range and returns -1 for empty", () => {
    expect(clampIndex(2, 5)).toBe(2);
    expect(clampIndex(-3, 5)).toBe(0);
    expect(clampIndex(9, 5)).toBe(4);
    expect(clampIndex(0, 0)).toBe(-1);
  });
});

describe("roveIndex", () => {
  it("moves and wraps at both ends", () => {
    expect(roveIndex(1, 4, 1)).toBe(2);
    expect(roveIndex(3, 4, 1)).toBe(0);
    expect(roveIndex(0, 4, -1)).toBe(3);
    expect(roveIndex(2, 4, -1)).toBe(1);
  });

  it("returns -1 for empty lists", () => {
    expect(roveIndex(0, 0, 1)).toBe(-1);
  });
});

describe("stepIndex", () => {
  it("steps with wraparound for carousels", () => {
    expect(stepIndex(0, 3, 1)).toBe(1);
    expect(stepIndex(2, 3, 1)).toBe(0);
    expect(stepIndex(0, 3, -1)).toBe(2);
  });
});

describe("indexAtScroll", () => {
  it("snaps to the nearest slide", () => {
    expect(indexAtScroll(0, 320)).toBe(0);
    expect(indexAtScroll(300, 320)).toBe(1);
    expect(indexAtScroll(480, 320)).toBe(2);
    expect(indexAtScroll(-40, 320)).toBe(0);
  });

  it("guards against zero slide width", () => {
    expect(indexAtScroll(100, 0)).toBe(0);
  });
});
