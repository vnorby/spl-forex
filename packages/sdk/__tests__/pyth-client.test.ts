import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { FXPairId } from "@solafx/types";
import { PythFXClient } from "../src/pyth/client";
import { FX_FEED_IDS, DERIVED_FX_PAIRS } from "../src/pyth/feed-ids";

const rawPrice = (feedPair: FXPairId, price: string) => ({
  id: FX_FEED_IDS[feedPair]!.replace("0x", ""),
  price: { price, conf: "50000", expo: -8, publish_time: 1700000000 },
});

describe("Pyth feed table", () => {
  it("prices every derived cross from two published feeds", () => {
    for (const [pair, derived] of Object.entries(DERIVED_FX_PAIRS)) {
      expect(FX_FEED_IDS[pair as FXPairId], pair).toBeUndefined();
      for (const leg of derived!.legs) {
        expect(FX_FEED_IDS[leg], `${pair} leg ${leg}`).toBeDefined();
      }
    }
  });
});

describe("PythFXClient.getRates", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("derives a dropped cross from its USD legs and only requests the legs", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({ parsed: [rawPrice("GBP/USD", "125000000"), rawPrice("USD/JPY", "15000000000")] }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const rates = await new PythFXClient("https://hermes.test").getRates(["GBP/USD", "GBP/JPY"]);

    expect(rates["GBP/USD"].price).toBeCloseTo(1.25, 6);
    expect(rates["GBP/JPY"].price).toBeCloseTo(187.5, 6);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url.match(/ids\[\]=/g)).toHaveLength(2);
  });
});

function sseResponse(...events: unknown[]) {
  const body = events.map((e) => `data:${JSON.stringify(e)}\n\n`).join("");
  return new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } });
}

describe("PythFXClient.createPriceStream", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: PythFXClient;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    client = new PythFXClient("https://hermes.test");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("emits an update for every feed in a message", async () => {
    fetchMock.mockImplementation(async () =>
      sseResponse({ parsed: [rawPrice("EUR/USD", "108450000"), rawPrice("USD/JPY", "15523000000")] }),
    );
    const onUpdate = vi.fn();

    const unsubscribe = client.createPriceStream(["EUR/USD", "USD/JPY"], onUpdate);
    await vi.advanceTimersByTimeAsync(0);
    unsubscribe();

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[0][0]).toBe("EUR/USD");
    expect(onUpdate.mock.calls[0][1].price).toBeCloseTo(1.0845, 4);
    expect(onUpdate.mock.calls[1][0]).toBe("USD/JPY");
    expect(onUpdate.mock.calls[1][1].price).toBeCloseTo(155.23, 2);
  });

  it("emits a derived cross once both of its legs have a price", async () => {
    fetchMock.mockImplementation(async () =>
      sseResponse(
        { parsed: [rawPrice("EUR/USD", "108000000")] },
        { parsed: [rawPrice("USD/CHF", "88000000")] },
      ),
    );
    const onUpdate = vi.fn();

    const unsubscribe = client.createPriceStream(["EUR/USD", "EUR/CHF"], onUpdate);
    await vi.advanceTimersByTimeAsync(0);
    unsubscribe();

    expect(onUpdate.mock.calls.map(([pair]) => pair)).toEqual(["EUR/USD", "EUR/CHF"]);
    expect(onUpdate.mock.calls[1][1].price).toBeCloseTo(1.08 * 0.88, 6);
  });

  it("stops retrying when the API key is missing or rejected", async () => {
    fetchMock.mockImplementation(async () => new Response("unauthorized", { status: 401 }));
    const onError = vi.fn();

    client.createPriceStream(["EUR/USD"], vi.fn(), onError);
    await vi.advanceTimersByTimeAsync(120_000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toContain("401");
  });

  it("backs off exponentially on server errors", async () => {
    fetchMock.mockImplementation(async () => new Response("unavailable", { status: 503 }));
    const onError = vi.fn();

    const unsubscribe = client.createPriceStream(["EUR/USD"], vi.fn(), onError);
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(3_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Next retry waits 6s, not 3s
    await vi.advanceTimersByTimeAsync(3_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(3_000);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    expect(onError).toHaveBeenCalledTimes(3);
    unsubscribe();
  });

  it("reconnects when the server closes the stream", async () => {
    fetchMock.mockImplementation(async () =>
      sseResponse({ parsed: [rawPrice("EUR/USD", "108450000")] }),
    );

    const unsubscribe = client.createPriceStream(["EUR/USD"], vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(3_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it("cancels a pending retry on unsubscribe", async () => {
    fetchMock.mockImplementation(async () => new Response("unavailable", { status: 503 }));

    const unsubscribe = client.createPriceStream(["EUR/USD"], vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    unsubscribe();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
