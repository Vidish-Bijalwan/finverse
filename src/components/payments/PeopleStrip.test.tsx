// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PeopleStrip } from "./PeopleStrip";
import type { PayeePerson } from "@/lib/payment-contacts";

afterEach(() => cleanup());

const people: PayeePerson[] = [
  { name: "Aarav Sharma", rail: "upi", lastAt: "2026-10-03T10:00:00Z" },
  { name: "Rohan Verma", rail: "bank", detail: "A/c …4821", lastAt: "2026-10-02T10:00:00Z" },
];

describe("PeopleStrip", () => {
  it("renders avatar + name for each person", () => {
    render(<PeopleStrip people={people} onSelect={() => {}} />);
    expect(screen.getByText("Aarav Sharma")).toBeTruthy();
    expect(screen.getByText("Rohan Verma")).toBeTruthy();
    // Initials avatar
    expect(screen.getByText("AS")).toBeTruthy();
    expect(screen.getByText("RV")).toBeTruthy();
    // Bank detail line
    expect(screen.getByText("A/c …4821")).toBeTruthy();
  });

  it("selects a person on tap", () => {
    const onSelect = vi.fn();
    render(<PeopleStrip people={people} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "Pay Aarav Sharma" }));
    expect(onSelect).toHaveBeenCalledWith(people[0]);
  });

  it("shows an honest empty state with no fake people", () => {
    render(<PeopleStrip people={[]} onSelect={() => {}} />);
    expect(screen.getByText(/People you pay will appear here/)).toBeTruthy();
    // No fake seed names.
    expect(screen.queryByText("Aarav Sharma")).toBeNull();
  });
});
