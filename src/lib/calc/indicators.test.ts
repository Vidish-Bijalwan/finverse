import { describe, expect, it } from "vitest";
import { ema, macd, rsi, sma } from "./indicators";

describe("sma", () => {
  it("averages the last N closes and aligns with nulls", () => {
    expect(sma([10, 11, 12, 13, 14], 3)).toEqual([null, null, 11, 12, 13]);
    expect(sma([5, 5, 5, 5], 1)).toEqual([5, 5, 5, 5]);
    expect(sma([10, 11], 3)).toEqual([null, null]);
    expect(sma([], 3)).toEqual([]);
  });

  it("of a constant series equals the constant", () => {
    expect(sma([7, 7, 7, 7, 7], 3)).toEqual([null, null, 7, 7, 7]);
  });
});

describe("ema", () => {
  it("seeds with the SMA and smooths with k = 2 / (n + 1)", () => {
    // Seed SMA(10, 11, 12) = 11; k = 0.5; EMA(13) = 12; EMA(14) = 13.
    expect(ema([10, 11, 12, 13, 14], 3)).toEqual([null, null, 11, 12, 13]);
    // EMA(2): k = 2/3; seed SMA(10, 12) = 11; EMA(11) = 11; EMA(13) = 37/3.
    const values = ema([10, 12, 11, 13], 2);
    expect(values[1]).toBeCloseTo(11, 9);
    expect(values[2]).toBeCloseTo(11, 9);
    expect(values[3]).toBeCloseTo(37 / 3, 9);
  });

  it("of a constant series equals the constant", () => {
    expect(ema([7, 7, 7, 7, 7], 3)).toEqual([null, null, 7, 7, 7]);
  });

  it("returns all nulls when the period exceeds the data length", () => {
    expect(ema([10, 11], 3)).toEqual([null, null]);
    expect(ema([], 3)).toEqual([]);
  });
});

describe("rsi", () => {
  it("matches the Investopedia example: 55.55", () => {
    // Investopedia: seven up days averaging a 1% gain and seven down days
    // averaging a 0.8% loss over 14 periods gives RSI 55.55. The same ratio
    // in absolute terms: seven +1 moves and seven −0.8 moves.
    const closes = [100];
    for (let i = 0; i < 7; i++) {
      closes.push(closes[closes.length - 1]! + 1);
      closes.push(closes[closes.length - 1]! - 0.8);
    }
    const values = rsi(closes, 14);
    expect(values.slice(0, 14).every((v) => v === null)).toBe(true);
    expect(values[14]).toBeCloseTo(55.555555, 2);
  });

  it("applies Wilder smoothing after the first value", () => {
    // Hand-computed: changes +1, −1, +1, −1 with period 2.
    // First averages: gain 0.5, loss 0.5 → RSI 50.
    // Smooth with +1: gain 0.75, loss 0.25 → RS 3 → RSI 75.
    // Smooth with −1: gain 0.375, loss 0.625 → RS 0.6 → RSI 37.5.
    expect(rsi([10, 11, 10, 11, 10], 2)).toEqual([null, null, 50, 75, 37.5]);
  });

  it("handles one-sided and flat markets", () => {
    // All gains, no losses → 100; all losses, no gains → 0.
    expect(rsi([10, 11, 12, 13], 2)).toEqual([null, null, 100, 100]);
    expect(rsi([13, 12, 11, 10], 2)).toEqual([null, null, 0, 0]);
    // No moves at all → 50.
    expect(rsi([10, 10, 10, 10], 2)).toEqual([null, null, 50, 50]);
  });

  it("needs period + 1 closes for its first value", () => {
    expect(rsi([10, 11, 12], 3)).toEqual([null, null, null]);
    expect(rsi([10, 11, 12, 13], 3)).toHaveLength(4);
    expect(rsi([], 14)).toEqual([]);
    expect(rsi([10], 14)).toEqual([null]);
  });
});

describe("macd", () => {
  it("matches hand-computed exact fractions", () => {
    // Closes [10, 12, 11, 13, 12, 14], fast 2, slow 3, signal 2.
    // MACD line: 0, 1/3, 1/9, 10/27. Signal: seed 1/6, then 7/54, 47/162.
    const values = macd([10, 12, 11, 13, 12, 14], 2, 3, 2);
    expect(values.slice(0, 3)).toEqual([null, null, null]);
    // The first full row is the signal seed: MACD 1/3, signal 1/6.
    expect(values[3]!.macd).toBeCloseTo(1 / 3, 9);
    expect(values[3]!.signal).toBeCloseTo(1 / 6, 9);
    expect(values[3]!.histogram).toBeCloseTo(1 / 6, 9);
    expect(values[4]!.macd).toBeCloseTo(1 / 9, 9);
    expect(values[4]!.signal).toBeCloseTo(7 / 54, 9);
    expect(values[4]!.histogram).toBeCloseTo(-1 / 54, 9);
    expect(values[5]!.macd).toBeCloseTo(10 / 27, 9);
    expect(values[5]!.signal).toBeCloseTo(47 / 162, 9);
    expect(values[5]!.histogram).toBeCloseTo(13 / 162, 9);
  });

  it("on a straight line is constant with a zero histogram", () => {
    const values = macd([10, 11, 12, 13, 14, 15], 2, 3, 2);
    for (const point of values.slice(3)) {
      expect(point!.macd).toBeCloseTo(0.5, 9);
      expect(point!.signal).toBeCloseTo(0.5, 9);
      expect(point!.histogram).toBeCloseTo(0, 9);
    }
  });

  it("returns all nulls when there is not enough data for a signal row", () => {
    expect(macd([10, 12, 11], 2, 3, 2)).toEqual([null, null, null]);
    expect(macd([], 2, 3, 2)).toEqual([]);
  });
});

describe("indicator validation", () => {
  it("rejects invalid periods and non-finite input", () => {
    expect(() => sma([1, 2], 0)).toThrow(RangeError);
    expect(() => sma([1, 2], 1.5)).toThrow(RangeError);
    expect(() => ema([1, Number.NaN], 2)).toThrow(TypeError);
    expect(() => rsi([1, Number.POSITIVE_INFINITY], 2)).toThrow(TypeError);
    expect(() => macd([1, 2, 3], 26, 12, 9)).toThrow(RangeError);
    expect(() => macd([1, 2, 3], 12, 12, 9)).toThrow(RangeError);
  });
});
