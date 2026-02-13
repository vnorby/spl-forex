import { describe, it, expect, vi, beforeEach } from "vitest";
import { FXRateEngine } from "../src/fx/rate-engine";
import { JupiterClient } from "../src/jupiter/client";
import { PythFXClient } from "../src/pyth/client";

vi.mock("../src/jupiter/client");
vi.mock("../src/pyth/client");

describe("FXRateEngine", () => {
  let engine: FXRateEngine;
  let mockJupiter: { getOrder: ReturnType<typeof vi.fn> };
  let mockPyth: { getRate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockJupiter = { getOrder: vi.fn() };
    mockPyth = { getRate: vi.fn() };
    engine = new FXRateEngine(
      mockJupiter as unknown as JupiterClient,
      mockPyth as unknown as PythFXClient,
    );
  });

  it("computes USDC->EURC comparison using EUR/USD feed", async () => {
    mockJupiter.getOrder.mockResolvedValue({
      inAmount: "1000000000",
      outAmount: "921500000",
      requestId: "test-123",
    });
    mockPyth.getRate.mockResolvedValue({
      price: 1.0845,
      confidence: 0.0005,
      expo: -8,
      publishTime: 1700000000,
    });

    const result = await engine.getComparison({
      inputToken: "USDC",
      outputToken: "EURC",
      amount: 1000,
    });

    expect(result.dexRate).toBeCloseTo(0.9215, 4);
    // Oracle rate for USD->EUR is 1/EUR_USD (how many EUR per 1 USD)
    expect(result.oracleRate).toBeCloseTo(1 / 1.0845, 4);
    expect(result.outputAmount).toBeCloseTo(921.5, 1);
    expect(result.inputToken).toBe("USDC");
    expect(result.outputToken).toBe("EURC");
  });

  it("computes USDC->USDT with oracle rate of 1.0", async () => {
    mockJupiter.getOrder.mockResolvedValue({
      inAmount: "1000000000",
      outAmount: "999800000",
      requestId: "test-456",
    });

    const result = await engine.getComparison({
      inputToken: "USDC",
      outputToken: "USDT",
      amount: 1000,
    });

    expect(result.oracleRate).toBe(1.0);
    expect(result.dexRate).toBeCloseTo(0.9998, 4);
    // Pyth should not be called for same-currency
    expect(mockPyth.getRate).not.toHaveBeenCalled();
  });

  it("computes USDC->GYEN using USD/JPY feed", async () => {
    mockJupiter.getOrder.mockResolvedValue({
      inAmount: "1000000000",
      outAmount: "155230000000",
      requestId: "test-789",
    });
    mockPyth.getRate.mockResolvedValue({
      price: 155.23,
      confidence: 0.01,
      expo: -8,
      publishTime: 1700000000,
    });

    const result = await engine.getComparison({
      inputToken: "USDC",
      outputToken: "GYEN",
      amount: 1000,
    });

    // DEX rate = 155230000000/1e6 / 1000000000/1e6 = 155230/1000 = 155.23
    expect(result.dexRate).toBeCloseTo(155.23, 2);
    expect(result.oracleRate).toBeCloseTo(155.23, 2);
  });

  it("includes jupiter order data when taker is provided", async () => {
    mockJupiter.getOrder.mockResolvedValue({
      inAmount: "1000000000",
      outAmount: "999800000",
      requestId: "test-exec",
      transaction: "base64tx",
    });

    const result = await engine.getComparison({
      inputToken: "USDC",
      outputToken: "USDT",
      amount: 1000,
      taker: "SomeWalletPubkey",
    });

    expect(result.jupiterOrderData).not.toBeNull();
    expect(result.jupiterOrderData?.transaction).toBe("base64tx");
    expect(result.jupiterOrderData?.requestId).toBe("test-exec");
  });
});
