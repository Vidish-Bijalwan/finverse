/**
 * Press-event routing for keypads (NumericKeypad, PinPad).
 *
 * Why this exists: on touch devices the browser may swallow the `click`
 * that follows a fast tap when it suspects a double-tap-zoom gesture, so a
 * keypad must act on `pointerdown` (fires immediately, once per tap).
 * Calling `preventDefault()` on the pointerdown suppresses the
 * compatibility mouse events (mousedown/mouseup/click), so the press can
 * never be double-counted — but the component must still handle activation
 * paths that never produce a pointerdown:
 *   - keyboard Enter/Space: fires `click` with `detail === 0`
 *   - assistive tech / synthetic `el.click()`: also `detail === 0`
 *
 * `classifyPressEvent` is the single decision point both keypads use, so the
 * routing is unit-testable without a DOM.
 */

export type PressEventKind = "pointerdown" | "click";

/**
 * Returns "press" when the DOM event should trigger the key, or null when it
 * must be ignored (a compatibility click arriving after its pointerdown was
 * already handled — acting on it would double-count the digit).
 */
export function classifyPressEvent(kind: PressEventKind, detail: number): "press" | null {
  if (kind === "pointerdown") return "press";
  // Keyboard (Enter/Space) and assistive-tech activation: click with no
  // preceding pointerdown. The spec sets detail to 0 for these.
  if (kind === "click" && detail === 0) return "press";
  return null;
}
