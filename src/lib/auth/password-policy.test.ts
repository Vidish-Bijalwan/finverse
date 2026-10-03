import { describe, expect, it } from "vitest";

import { BLOCKED_PASSWORDS, MIN_PASSWORD_LENGTH, validatePassword } from "./password-policy";

describe("validatePassword", () => {
  it("rejects passwords shorter than the minimum length", () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
    expect(validatePassword("")).not.toBeNull();
    expect(validatePassword("abc123")).not.toBeNull(); // 6 chars
    expect(validatePassword("1234567")).not.toBeNull(); // 7 chars
  });

  it("rejects every blocklist entry (exact case)", () => {
    for (const pw of BLOCKED_PASSWORDS) {
      expect(validatePassword(pw), `blocklist entry ${pw}`).not.toBeNull();
    }
  });

  it("rejects blocklist entries in mixed case (case-insensitive)", () => {
    expect(validatePassword("Password")).not.toBeNull();
    expect(validatePassword("QWERTY123")).not.toBeNull();
    expect(validatePassword("FinVerse")).not.toBeNull();
    expect(validatePassword("LetMeIn")).not.toBeNull();
  });

  it("accepts strong passwords", () => {
    expect(validatePassword("G0lden$parrow-7")).toBeNull();
    expect(validatePassword("Correct Horse Battery 9")).toBeNull();
    expect(validatePassword("a".repeat(8))).toBeNull(); // exactly 8, not blocklisted
  });

  it("returns a human-readable message, not the raw check result", () => {
    const short = validatePassword("short");
    const common = validatePassword("qwerty");
    expect(typeof short).toBe("string");
    expect(typeof common).toBe("string");
    expect(short!.length).toBeGreaterThan(0);
    expect(common!.length).toBeGreaterThan(0);
  });
});
