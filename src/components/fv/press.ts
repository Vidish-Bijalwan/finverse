/**
 * Shared press feedback for tappable elements: ~120ms scale + brightness dip.
 * The scale is motion-safe (skipped for prefers-reduced-motion); the
 * brightness dip is an instant state change, not an animation.
 */
export const pressable =
  "transition-all duration-120 motion-safe:active:scale-[0.97] active:brightness-95";
