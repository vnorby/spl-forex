import { describe, it, expect } from "vitest";
import { deriveCrossPrice, normalizePythPrice } from "../src/pyth/price-math";

describe("deriveCrossPrice", () => {
  const eurUsd = { price: 1.08, confidence: 0.000108, expo: -5, publishTime: 1700000002 };
  const usdChf = { price: 0.88, confidence: 0.000176, expo: -5, publishTime: 1700000001 };

  it("multiplies legs and adds relative confidences", () => {
    const result = deriveCrossPrice(eurUsd, usdChf, "mul");
    expect(result.price).toBeCloseTo(0.9504, 6);
    // 0.01% + 0.02% of the cross price
    expect(result.confidence).toBeCloseTo(0.9504 * 0.0003, 9);
    expect(result.publishTime).toBe(1700000001);
  });

  it("divides legs", () => {
    expect(deriveCrossPrice(eurUsd, usdChf, "div").price).toBeCloseTo(1.08 / 0.88, 6);
  });
});

describe("normalizePythPrice", () => {
  it("normalizes EUR/USD price correctly", () => {
    const raw = {
      price: {
        price: "108450000",
        conf: "50000",
        expo: -8,
        publish_time: 1700000000,
      },
    };
    const result = normalizePythPrice(raw);
    expect(result.price).toBeCloseTo(1.0845, 4);
    expect(result.confidence).toBeCloseTo(0.0005, 4);
    expect(result.publishTime).toBe(1700000000);
  });

  it("normalizes USD/JPY price correctly", () => {
    const raw = {
      price: {
        price: "15523000000",
        conf: "1000000",
        expo: -8,
        publish_time: 1700000000,
      },
    };
    const result = normalizePythPrice(raw);
    expect(result.price).toBeCloseTo(155.23, 2);
    expect(result.confidence).toBeCloseTo(0.01, 2);
  });

  it("handles negative exponent correctly", () => {
    const raw = {
      price: {
        price: "100000",
        conf: "100",
        expo: -5,
        publish_time: 1700000000,
      },
    };
    const result = normalizePythPrice(raw);
    expect(result.price).toBeCloseTo(1.0, 4);
  });
});
