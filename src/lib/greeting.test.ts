import { describe, expect, it } from "vitest";

import { greetingFor, greetingName } from "./greeting";

describe("greetingFor", () => {
  it("returns morning before noon", () => {
    expect(greetingFor(new Date(2026, 9, 3, 9, 30))).toBe("Good morning");
  });
  it("returns afternoon between 12 and 17", () => {
    expect(greetingFor(new Date(2026, 9, 3, 14, 0))).toBe("Good afternoon");
  });
  it("returns evening after 17", () => {
    expect(greetingFor(new Date(2026, 9, 3, 19, 0))).toBe("Good evening");
  });
});

describe("greetingName", () => {
  it("uses the first token of a real full name", () => {
    expect(greetingName("Vidish Bijalwan", "vidish@gmail.com")).toBe("Vidish");
  });
  it("rejects the malformed 2-letter fragment 'ee'", () => {
    expect(greetingName("ee", "x@y.com")).toBe("");
  });
  it("rejects a full_name that is actually an email address", () => {
    expect(greetingName("vidish.bijalwan@gmail.com", "vidish.bijalwan@gmail.com")).toBe("Vidish");
  });
  it("falls back to the email local part, capitalized", () => {
    expect(greetingName(null, "sirus-test@finverse.app")).toBe("Sirus");
  });
  it("returns empty when nothing is name-like", () => {
    expect(greetingName(null, "a@b.co")).toBe("");
    expect(greetingName("  ", null)).toBe("");
    expect(greetingName("X1", "!!@x.com")).toBe("");
  });
  it("accepts a capitalized short name", () => {
    expect(greetingName("Li Wei", null)).toBe("Li");
  });
  it("preserves all-caps tokens instead of mangling them", () => {
    expect(greetingName("QA Reviewer", null)).toBe("QA");
    expect(greetingName("QA Reviewer", "qa@finverse.app")).toBe("QA");
  });
  it("preserves mixed-case names exactly", () => {
    expect(greetingName("McDonald Smith", null)).toBe("McDonald");
    expect(greetingName("eBay Seller", null)).toBe("eBay");
  });
  it("title-cases an all-lowercase name", () => {
    expect(greetingName("vidish bijalwan", null)).toBe("Vidish");
    expect(greetingName("  aarav  ", null)).toBe("Aarav");
  });
});
