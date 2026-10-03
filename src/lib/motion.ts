/**
 * Canonical motion contract for FinVerse (brief §18).
 *
 * Restrained, purposeful motion only: micro 100–180ms, standard 160–240ms,
 * sheets/dialogs 200–320ms. No glow, no pulsing loops, no bounce/spring.
 *
 * Every animation in the app must:
 *  1. use a duration from MOTION (or the matching Tailwind class), and
 *  2. be gated on `useReducedMotion()` (hook) or the global
 *     `prefers-reduced-motion` media query in styles.css (CSS keyframes).
 *
 * Keyframe utilities live in the design tokens (src/styles.css):
 * `.fv-check-pop`, `.fv-check-draw` (success check), `fv-shimmer-sweep`,
 * `fv-mesh-drift`, `fv-marquee`.
 */
export { usePrefersReducedMotion as useReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/** Motion durations in milliseconds, per the §18 timing bands. */
export const MOTION = {
  /** Button press feedback, keypad, chip toggles (100–180ms). */
  micro: 120,
  /** Page transitions, tab indicators, card hovers (160–240ms). */
  standard: 220,
  /** Bottom-sheet / dialog entrances (200–320ms). */
  sheet: 280,
  /** Hero number count-up glide. */
  countUp: 800,
} as const;

/** Shared ease-out curve for entrances. */
export const MOTION_EASE_OUT = "cubic-bezier(0.32, 0.72, 0, 1)";

/**
 * Returns the animation class only when the user has NOT requested reduced
 * motion — the tiny helper behind "gate EVERYTHING" so call sites stay
 * one-liners: `className={motionIf(!reduced, "fv-check-pop")}`.
 */
export function motionIf(enabled: boolean, cls: string): string | undefined {
  return enabled ? cls : undefined;
}
