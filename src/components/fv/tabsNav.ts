/**
 * Pure index helpers for the fv Tabs (arrow-key roving) and Carousel
 * (prev/next wrapping). Kept in a dependency-free module so unit tests run
 * in the node-only vitest environment.
 */

/** Clamp an index into [0, count). Returns -1 when count is 0. */
export function clampIndex(index: number, count: number): number {
  if (count <= 0) return -1;
  return Math.min(count - 1, Math.max(0, index));
}

/**
 * Next roving-tab index for an arrow-key direction. Wraps at both ends
 * (ARIA tablist guidance: arrow keys cycle through tabs).
 */
export function roveIndex(current: number, count: number, dir: 1 | -1): number {
  if (count <= 0) return -1;
  return (current + dir + count) % count;
}

/** Carousel step with wraparound: 1 = next, -1 = previous. */
export function stepIndex(current: number, count: number, step: 1 | -1): number {
  return roveIndex(current, count, step);
}

/** Slide index under a scroll position: nearest snap point. */
export function indexAtScroll(scrollLeft: number, slideWidth: number): number {
  if (slideWidth <= 0) return 0;
  return Math.max(0, Math.round(scrollLeft / slideWidth));
}
