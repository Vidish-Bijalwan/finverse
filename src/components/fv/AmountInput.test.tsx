// @vitest-environment jsdom
/**
 * Component-level test for the amount keypad: exercises the REAL wired
 * handler path (KeyButton pointerdown routing -> AmountInput ref-mirrored
 * commit -> readout), simulating taps arriving faster than React re-renders.
 *
 * Background: unit tests on the extracted pure functions (amount-keys.ts)
 * passed while live QA still saw dropped digits — the bug was in event
 * delivery (touch browsers swallowing fast-tap clicks), not in the digit
 * math. This test guards the wired path against regressions.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AmountInput } from "./AmountInput";

afterEach(() => cleanup());

function tap(label: string) {
  const key = screen.getByRole("button", { name: label });
  // pointerdown is the real press path on touch; the compat click that may
  // follow must not double-count the digit.
  fireEvent.pointerDown(key);
  fireEvent.click(key, { detail: 1 });
}

function readout(): string {
  return screen.getByRole("status").textContent ?? "";
}

describe("AmountInput keypad — rapid-tap handling", () => {
  it("registers every digit of rapid 5,0,0 taps (digits are paise: 500 = ₹5)", () => {
    const onChange = vi.fn();
    render(<AmountInput onConfirm={() => {}} onChange={onChange} />);

    // Fire all three taps synchronously — faster than any re-render.
    // If a tap were dropped (the live-QA bug), onChange would end at 5.
    tap("5");
    tap("0");
    tap("0");

    expect(readout()).toBe("₹5");
    expect(onChange).toHaveBeenLastCalledWith(500);
    expect(onChange.mock.calls.map((c) => c[0])).toEqual([5, 50, 500]);
  });

  it("rapid 5,0,0,0,0 reaches ₹500", () => {
    render(<AmountInput onConfirm={() => {}} />);
    tap("5");
    tap("0");
    tap("0");
    tap("0");
    tap("0");
    expect(readout()).toBe("₹500");
  });

  it("does not double-count the compatibility click after pointerdown", () => {
    render(<AmountInput onConfirm={() => {}} />);
    tap("7");
    expect(readout()).toBe("₹0.07");
  });

  it("keyboard activation (click with detail 0) still enters the digit", () => {
    render(<AmountInput onConfirm={() => {}} />);
    // Enter/Space on a focused key fires click with detail === 0 and no
    // preceding pointerdown.
    fireEvent.click(screen.getByRole("button", { name: "3" }), { detail: 0 });
    expect(readout()).toBe("₹0.03");
  });

  it("backspace removes the last digit", () => {
    render(<AmountInput onConfirm={() => {}} />);
    tap("1");
    tap("2");
    const back = screen.getByRole("button", { name: "Backspace" });
    fireEvent.pointerDown(back);
    expect(readout()).toBe("₹0.01");
  });

  it("confirm stays disabled until a valid amount is entered", () => {
    const onConfirm = vi.fn();
    render(<AmountInput onConfirm={onConfirm} confirmLabel="Continue" />);
    const confirm = screen.getByRole("button", { name: "Continue" }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    tap("5");
    tap("0");
    tap("0");
    expect(confirm.disabled).toBe(false);
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith(500);
  });
});
