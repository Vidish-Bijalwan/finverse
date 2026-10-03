import { describe, expect, it } from "vitest";

import {
  changePctLabel,
  ltpChangePct,
  mostActive,
  rangePctOf,
  sparklinePath,
  sparklineValues,
  splitMovers,
  topGainers,
  topLosers,
  type MoverRow,
} from "./movers";
import { dayChange, genHistory } from "./history";
import { STOCKS } from "./data";

const ROWS: MoverRow[] = [
  { symbol: "AAA", name: "Aaa Co", pricePaise: 10000, changePct: 2.5 },
  { symbol: "BBB", name: "Bbb Co", pricePaise: 20000, changePct: -4.0 },
  { symbol: "CCC", name: "Ccc Co", pricePaise: 30000, changePct: 5.1 },
  { symbol: "DDD", name: "Ddd Co", pricePaise: 40000, changePct: 0.4 },
  { symbol: "EEE", name: "Eee Co", pricePaise: 50000, changePct: -1.2 },
];

const hist = (closes: number[]) =>
  closes.map((closePaise, i) => ({
    date: `2026-09-${String(i + 1).padStart(2, "0")}`,
    closePaise,
  }));

describe("topGainers", () => {
  it("returns the n biggest day-changes, descending", () => {
    const out = topGainers(ROWS, 3);
    expect(out.map((r) => r.symbol)).toEqual(["CCC", "AAA", "DDD"]);
  });

  it("returns fewer when the universe is smaller than n", () => {
    expect(topGainers(ROWS.slice(0, 2), 5)).toHaveLength(2);
  });

  it("returns [] for an empty universe and never mutates the input", () => {
    expect(topGainers([], 3)).toEqual([]);
    const copy = [...ROWS];
    topGainers(ROWS, 3);
    expect(ROWS).toEqual(copy);
  });

  it("breaks ties by symbol for determinism", () => {
    const tied: MoverRow[] = [
      { symbol: "ZZZ", name: "Z", pricePaise: 1, changePct: 1 },
      { symbol: "AAA", name: "A", pricePaise: 1, changePct: 1 },
    ];
    expect(topGainers(tied, 2).map((r) => r.symbol)).toEqual(["AAA", "ZZZ"]);
  });
});

describe("topLosers", () => {
  it("returns the n worst day-changes, worst first", () => {
    const out = topLosers(ROWS, 3);
    expect(out.map((r) => r.symbol)).toEqual(["BBB", "EEE", "DDD"]);
  });

  it("returns [] for an empty universe", () => {
    expect(topLosers([], 3)).toEqual([]);
  });
});

describe("splitMovers", () => {
  it("splits one snapshot into mutually exclusive gainers + losers", () => {
    const { gainers, losers } = splitMovers(ROWS, 3);
    expect(gainers.map((r) => r.symbol)).toEqual(["CCC", "AAA", "DDD"]);
    expect(losers.map((r) => r.symbol)).toEqual(["BBB", "EEE"]);
    // ^ only 5 rows: DDD would naively land in both lists — it must not.
    const gainerSyms = new Set(gainers.map((r) => r.symbol));
    for (const l of losers) expect(gainerSyms.has(l.symbol)).toBe(false);
  });

  it("keeps price/change identical for a symbol wherever it appears", () => {
    const { gainers, losers } = splitMovers(ROWS, 5);
    const bySymbol = new Map<string, MoverRow>();
    for (const r of [...gainers, ...losers]) {
      const prev = bySymbol.get(r.symbol);
      if (prev) {
        expect(r.pricePaise).toBe(prev.pricePaise);
        expect(r.changePct).toBe(prev.changePct);
      } else {
        bySymbol.set(r.symbol, r);
      }
    }
    // …and with a full-size universe nothing is shared at all.
    const g = new Set(gainers.map((r) => r.symbol));
    expect(losers.every((r) => !g.has(r.symbol))).toBe(true);
  });

  it("never puts the same symbol in both lists on the real demo dataset", () => {
    const rows: MoverRow[] = STOCKS.map((s) => {
      const h = genHistory(s.symbol, 22);
      const prevClose = h.length > 1 ? h[h.length - 2]!.closePaise : undefined;
      // Same basis the MarketSnapshot component uses: displayed LTP + its %.
      const ltp = 100000; // basis consistency matters, not the value
      return {
        symbol: s.symbol,
        name: s.name,
        pricePaise: ltp,
        changePct: ltpChangePct(ltp, prevClose),
      };
    });
    const { gainers, losers } = splitMovers(rows, 3);
    expect(gainers).toHaveLength(3);
    expect(losers).toHaveLength(3);
    const g = new Set(gainers.map((r) => r.symbol));
    expect(losers.some((r) => g.has(r.symbol))).toBe(false);
    // Ordering preserved: gainers desc, losers worst-first.
    expect(gainers.map((r) => r.changePct)).toEqual(
      [...gainers.map((r) => r.changePct)].sort((a, b) => b - a),
    );
    expect(losers.map((r) => r.changePct)).toEqual(
      [...losers.map((r) => r.changePct)].sort((a, b) => a - b),
    );
  });

  it("returns empty lists for n = 0 or an empty universe, never mutating input", () => {
    expect(splitMovers(ROWS, 0)).toEqual({ gainers: [], losers: [] });
    expect(splitMovers([], 3)).toEqual({ gainers: [], losers: [] });
    const copy = [...ROWS];
    splitMovers(ROWS, 3);
    expect(ROWS).toEqual(copy);
  });
});

describe("ltpChangePct", () => {
  it("computes the displayed LTP's day change vs the previous close", () => {
    expect(ltpChangePct(10500, 10000)).toBeCloseTo(5, 10);
    expect(ltpChangePct(9500, 10000)).toBeCloseTo(-5, 10);
  });

  it("returns 0 for a zero or missing previous close (no fabricated move)", () => {
    expect(ltpChangePct(10500, 0)).toBe(0);
    expect(ltpChangePct(10500, undefined)).toBe(0);
  });
});

describe("mostActive", () => {
  it("ranks by intraday range, biggest swing first", () => {
    const ranged: MoverRow[] = [
      { symbol: "AAA", name: "A", pricePaise: 1, changePct: 5.0, rangePct: 1.0 },
      { symbol: "BBB", name: "B", pricePaise: 1, changePct: 0.1, rangePct: 9.0 },
      { symbol: "CCC", name: "C", pricePaise: 1, changePct: -0.2, rangePct: 4.0 },
    ];
    // BBB closed nearly flat but swung the most — it must lead, unlike
    // topGainers which would put AAA first.
    expect(mostActive(ranged, 3).map((r) => r.symbol)).toEqual(["BBB", "CCC", "AAA"]);
    expect(topGainers(ranged, 3).map((r) => r.symbol)).toEqual(["AAA", "BBB", "CCC"]);
  });

  it("falls back to |changePct| when rows carry no rangePct", () => {
    const out = mostActive(ROWS, 3);
    expect(out.map((r) => r.symbol)).toEqual(["CCC", "BBB", "AAA"]);
  });

  it("breaks ties by symbol for determinism", () => {
    const tied: MoverRow[] = [
      { symbol: "ZZZ", name: "Z", pricePaise: 1, changePct: 1, rangePct: 5 },
      { symbol: "AAA", name: "A", pricePaise: 1, changePct: 2, rangePct: 5 },
    ];
    expect(mostActive(tied, 2).map((r) => r.symbol)).toEqual(["AAA", "ZZZ"]);
  });

  it("returns [] for an empty universe and never mutates the input", () => {
    expect(mostActive([], 3)).toEqual([]);
    const copy = [...ROWS];
    mostActive(ROWS, 3);
    expect(ROWS).toEqual(copy);
  });

  it("is never byte-identical to top gainers or top losers on the demo dataset", () => {
    const rows: MoverRow[] = STOCKS.map((s) => {
      const h = genHistory(s.symbol, 22);
      return {
        symbol: s.symbol,
        name: s.name,
        pricePaise: 0,
        changePct: dayChange(h).changePct,
        rangePct: rangePctOf(sparklineValues(h, 20)),
      };
    });
    const gainers = topGainers(rows, 3).map((r) => r.symbol);
    const losers = topLosers(rows, 3).map((r) => r.symbol);
    const active = mostActive(rows, 3).map((r) => r.symbol);
    expect(active).not.toEqual(gainers);
    expect(active).not.toEqual(losers);
    // Sanity: the ranking actually keys off range, not |changePct|.
    const bySwing = [...rows].sort(
      (a, b) => (b.rangePct ?? 0) - (a.rangePct ?? 0) || a.symbol.localeCompare(b.symbol),
    );
    expect(active).toEqual(bySwing.slice(0, 3).map((r) => r.symbol));
  });
});

describe("rangePctOf", () => {
  it("returns (max − min) / first × 100", () => {
    expect(rangePctOf([100, 110, 95, 105])).toBeCloseTo(15, 10);
  });

  it("returns 0 for short series or a zero first value", () => {
    expect(rangePctOf([])).toBe(0);
    expect(rangePctOf([42])).toBe(0);
    expect(rangePctOf([0, 5, 10])).toBe(0);
  });

  it("returns 0 for a flat series", () => {
    expect(rangePctOf([7, 7, 7])).toBe(0);
  });
});

describe("sparklineValues", () => {
  it("keeps every point when the history is short", () => {
    const h = hist([100, 110, 105]);
    expect(sparklineValues(h, 20)).toEqual([100, 110, 105]);
  });

  it("downsamples to exactly `points`, keeping first and last", () => {
    const closes = Array.from({ length: 100 }, (_, i) => 100 + i);
    const h = hist(closes);
    const out = sparklineValues(h, 20);
    expect(out).toHaveLength(20);
    expect(out[0]).toBe(100);
    expect(out[out.length - 1]).toBe(199);
  });

  it("is monotonic-index spaced (no duplicate skips at the ends)", () => {
    const h = hist([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const out = sparklineValues(h, 5);
    expect(out).toHaveLength(5);
    expect(out[0]).toBe(1);
    expect(out[4]).toBe(10);
  });

  it("returns [] for empty history or non-positive points", () => {
    expect(sparklineValues([], 20)).toEqual([]);
    expect(sparklineValues(hist([1, 2]), 0)).toEqual([]);
  });
});

describe("sparklinePath", () => {
  it("emits an M…L… path with one segment per value", () => {
    const d = sparklinePath([10, 20, 15], 72, 28);
    expect(d.startsWith("M")).toBe(true);
    expect(d.split(" L")).toHaveLength(3);
  });

  it("inverts Y: higher values sit higher (smaller y) in the viewport", () => {
    const d = sparklinePath([10, 30], 100, 50, 0);
    const [, , y1, , y2] = d.match(/M([\d.]+),([\d.]+) L([\d.]+),([\d.]+)/) ?? [];
    expect(Number(y2)).toBeLessThan(Number(y1));
    expect(y1).toBe("50"); // min value -> bottom edge
    expect(y2).toBe("0"); // max value -> top edge
  });

  it("renders a flat midline for a constant series (no NaN)", () => {
    const d = sparklinePath([5, 5, 5], 72, 28);
    expect(d).not.toMatch(/NaN/);
    const ys = [...d.matchAll(/,([\d.]+)/g)].map((m) => m[1]);
    expect(new Set(ys).size).toBe(1);
    expect(Number(ys[0])).toBe(14); // midline of a 28px viewport
  });

  it("returns '' for empty input or an impossibly small viewport", () => {
    expect(sparklinePath([], 72, 28)).toBe("");
    expect(sparklinePath([1, 2], 3, 28)).toBe("");
  });
});

describe("changePctLabel", () => {
  it("signs positive and negative moves with the Indian minus", () => {
    expect(changePctLabel(2.345)).toBe("+2.35%");
    expect(changePctLabel(-2.345)).toBe("−2.35%");
    expect(changePctLabel(0)).toBe("+0.00%");
  });
});
