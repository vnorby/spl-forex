import { describe, it, expect } from "vitest";
import { calculateSpread } from "../src/fx/spread";

describe("calculateSpread", () => {
  it("returns par for identical rates", () => {
    const result = calculateSpread(1.0845, 1.0845);
    expect(result.direction).toBe("par");
    expect(result.favorable).toBe(true);
  });

  it("returns premium when DEX rate is higher", () => {
    const result = calculateSpread(1.09, 1.08);
    expect(result.direction).toBe("premium");
    expect(result.percent).toBeCloseTo(0.926, 2);
  });

  it("returns discount when DEX rate is lower", () => {
    const result = calculateSpread(1.07, 1.08);
    expect(result.direction).toBe("discount");
    expect(result.percent).toBeLessThan(0);
  });

  it("marks spread as favorable when under 0.5%", () => {
    const result = calculateSpread(1.084, 1.085);
    expect(result.favorable).toBe(true);
  });

  it("marks spread as unfavorable when over 0.5%", () => {
    const result = calculateSpread(1.07, 1.085);
    expect(result.favorable).toBe(false);
  });

  it("handles zero oracle rate", () => {
    const result = calculateSpread(1.08, 0);
    expect(result.direction).toBe("par");
    expect(result.percent).toBe(0);
  });
});
