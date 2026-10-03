import { describe, expect, it } from "vitest";

import { avatarInitials, AVATAR_FALLBACK_INITIALS } from "./names";

describe("avatarInitials", () => {
  it("uses the first letters of the first two words", () => {
    expect(avatarInitials("QA Test Beneficiary")).toBe("QT");
    expect(avatarInitials("Aarav Sharma")).toBe("AS");
  });
  it("ignores words beyond the second", () => {
    expect(avatarInitials("Mary Jane Watson Parker")).toBe("MJ");
  });
  it("uses the first two letters of a single-word name", () => {
    expect(avatarInitials("Aarav")).toBe("AA");
    expect(avatarInitials("Li")).toBe("LI");
  });
  it("handles extra whitespace", () => {
    expect(avatarInitials("  Li   Wei  ")).toBe("LW");
  });
  it("falls back to the FV monogram for blank input", () => {
    expect(avatarInitials("")).toBe(AVATAR_FALLBACK_INITIALS);
    expect(avatarInitials("   ")).toBe(AVATAR_FALLBACK_INITIALS);
    expect(avatarInitials(null)).toBe(AVATAR_FALLBACK_INITIALS);
    expect(avatarInitials(undefined)).toBe(AVATAR_FALLBACK_INITIALS);
  });
  it("uppercases lowercase input", () => {
    expect(avatarInitials("vidish bijalwan")).toBe("VB");
  });
});
