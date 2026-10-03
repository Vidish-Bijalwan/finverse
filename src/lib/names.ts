/**
 * Name-display helpers shared by every avatar in the app.
 *
 * There is exactly ONE initials rule: the first letters of the first two
 * whitespace-separated words, uppercased. "QA Test Beneficiary" -> "QT",
 * "Aarav Sharma" -> "AS". (An earlier variant used first+LAST word, which
 * produced "QB" for "QA Test Beneficiary" — wrong.)
 *
 * A single-word name contributes its first two letters ("Aarav" -> "AA").
 * A blank name falls back to the "FV" monogram.
 */

/** Avatar fallback monogram when no name is available. */
export const AVATAR_FALLBACK_INITIALS = "FV";

/**
 * Initials for an avatar circle from a display name.
 * Pure and total: null/undefined/blank input yields the FV monogram.
 */
export function avatarInitials(name: string | null | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return AVATAR_FALLBACK_INITIALS;
  const first = words[0] ?? "";
  if (words.length === 1) {
    const two = first.slice(0, 2).toUpperCase();
    return two || AVATAR_FALLBACK_INITIALS;
  }
  const second = words[1] ?? "";
  return (first.charAt(0) + second.charAt(0)).toUpperCase() || AVATAR_FALLBACK_INITIALS;
}
