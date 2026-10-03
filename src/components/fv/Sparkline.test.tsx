// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Sparkline } from "./Sparkline";
import { directionForChangePct } from "../../lib/market/movers";

afterEach(() => cleanup());

const strokeOf = (container: HTMLElement): string | null =>
  container.querySelector("svg path[stroke]")?.getAttribute("stroke") ?? null;

describe("directionForChangePct", () => {
  it("maps positive days to up and negative days to down", () => {
    expect(directionForChangePct(2.5)).toBe("up");
    expect(directionForChangePct(0)).toBe("flat");
    expect(directionForChangePct(-0.77)).toBe("down");
  });

  it("renders near-zero moves (|changePct| < 0.05) muted-flat", () => {
    expect(directionForChangePct(0.049)).toBe("flat");
    expect(directionForChangePct(-0.049)).toBe("flat");
    expect(directionForChangePct(0.05)).toBe("up");
    expect(directionForChangePct(-0.05)).toBe("down");
  });
});

describe("Sparkline direction contract", () => {
  it("paints the stroke from the day's direction, not the series' shape", () => {
    // Intraday series that ends ABOVE its start on a down day — the old
    // first→last inference would have painted this green.
    const { container } = render(
      <Sparkline values={[100, 102, 101, 103]} direction={directionForChangePct(-0.77)} />,
    );
    expect(strokeOf(container)).toBe("var(--loss)");
  });

  it("paints gain for up days and muted for flat days", () => {
    const up = render(
      <Sparkline values={[103, 101, 100]} direction={directionForChangePct(1.2)} />,
    );
    expect(strokeOf(up.container)).toBe("var(--gain)");
    const flat = render(<Sparkline values={[100, 100]} direction={directionForChangePct(0)} />);
    expect(strokeOf(flat.container)).toBe("var(--muted-foreground)");
  });
});
