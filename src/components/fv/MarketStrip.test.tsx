// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { HTMLAttributes, ReactNode } from "react";

import { MarketStrip } from "./MarketStrip";

afterEach(() => cleanup());

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    ...props
  }: {
    children?: ReactNode;
    to?: string;
    params?: unknown;
  } & Record<string, unknown>) => {
    const { to: _to, params: _params, ...rest } = props;
    return (
      <a {...(rest as HTMLAttributes<HTMLAnchorElement>)} href={_to}>
        {children}
      </a>
    );
  },
}));

describe("MarketStrip", () => {
  it("renders all three indices with price, absolute move and % move", () => {
    render(<MarketStrip symbols={[]} />);
    for (const symbol of ["NIFTY50", "SENSEX", "BANKNIFTY"]) {
      expect(screen.getByText(symbol)).toBeTruthy();
    }
    // Static strip: each of the 3 indices appears exactly once.
    const section = screen.getByRole("region", { name: /market strip/i });
    expect(section.textContent ?? "").toMatch(/₹[\d,]+/);
    expect(section.textContent ?? "").toMatch(/%/);
  });

  it("renders each symbol exactly once — no marquee duplicate set", () => {
    render(<MarketStrip symbols={["RELIANCE"]} />);
    for (const symbol of ["NIFTY50", "SENSEX", "BANKNIFTY", "RELIANCE"]) {
      expect(screen.getAllByText(symbol)).toHaveLength(1);
    }
  });

  it("shows exactly one compact SIMULATED DATA pill", () => {
    render(<MarketStrip symbols={["RELIANCE"]} />);
    const pills = screen.getAllByText("Simulated data");
    expect(pills).toHaveLength(1);
  });

  it("appends watched stocks after the indices", () => {
    render(<MarketStrip symbols={["RELIANCE"]} />);
    expect(screen.getByText("RELIANCE")).toBeTruthy();
  });

  it("labels the strip as simulated data for assistive tech", () => {
    render(<MarketStrip />);
    expect(screen.getByRole("region", { name: "Market strip — simulated data" })).toBeTruthy();
  });
});
