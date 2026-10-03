import type { ThemeMode } from "@/lib/settings";

/**
 * Resolve a ThemeMode to a concrete dark/light boolean. "system" follows the
 * OS via matchMedia. SSR-safe: on the server (or where matchMedia is
 * unavailable) a "system" theme resolves to light — the ThemeApplier
 * reconciles on the client after mount.
 */
export function resolveIsDark(theme: ThemeMode): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  if (typeof window === "undefined" || typeof window.matchMedia === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Pure: one tap on the header theme toggle flips the RESOLVED theme. Called
 * with the theme as it is right now (system resolved via matchMedia at click
 * time), returns the theme to persist. Light -> dark, dark -> light.
 */
export function toggledTheme(currentlyDark: boolean): ThemeMode {
  return currentlyDark ? "light" : "dark";
}
