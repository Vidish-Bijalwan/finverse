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

  it("shows one quiet simulated-prices disclosure, not a badge", () => {
    render(<MarketStrip symbols={["RELIANCE"]} />);
    expect(screen.getByText("Simulated prices — not live data")).toBeTruthy();
    expect(screen.queryByText("Simulated data")).toBeNull();
  });

  it("appends watched stocks after the indices", () => {
    render(<MarketStrip symbols={["RELIANCE"]} />);
    expect(screen.getByText("RELIANCE")).toBeTruthy();
  });

  it("renders labeled Indices and Watchlist groups", () => {
    render(<MarketStrip symbols={["RELIANCE"]} />);
    expect(screen.getByRole("heading", { name: "Indices" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Watchlist" })).toBeTruthy();
    // Indices stay in their own group; watched stocks don't mingle with them.
    const indicesGroup = screen.getByRole("group", { name: "Indices" });
    expect(indicesGroup.textContent ?? "").toMatch(/SENSEX/);
    expect(indicesGroup.textContent ?? "").not.toMatch(/RELIANCE/);
    const watchlistGroup = screen.getByRole("group", { name: "Watchlist" });
    expect(watchlistGroup.textContent ?? "").toMatch(/RELIANCE/);
  });

  it("shows a compact empty hint in the Watchlist group when no stocks are watched", () => {
    render(<MarketStrip symbols={[]} />);
    expect(screen.getByText(/No watched stocks yet/)).toBeTruthy();
  });

  it("hides the empty hint when watched stocks are present", () => {
    render(<MarketStrip symbols={["RELIANCE"]} />);
    expect(screen.queryByText(/No watched stocks yet/)).toBeNull();
  });

  it("labels the strip as simulated data for assistive tech", () => {
    render(<MarketStrip />);
    expect(screen.getByRole("region", { name: "Market strip — simulated data" })).toBeTruthy();
  });
});
