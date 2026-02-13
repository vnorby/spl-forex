import type { FXPairId, OraclePrice } from "@solafx/types";
import { FX_FEED_IDS } from "./feed-ids";
import { normalizePythPrice } from "./price-math";

export class PythFXClient {
  private baseUrl: string;

  constructor(endpoint?: string) {
    this.baseUrl = endpoint ?? "https://hermes.pyth.network";
  }

  async getRate(pair: FXPairId): Promise<OraclePrice> {
    const feedId = FX_FEED_IDS[pair];
    if (!feedId) {
      throw new Error(`No Pyth feed ID for pair: ${pair}`);
    }

    const url = `${this.baseUrl}/v2/updates/price/latest?ids[]=${feedId}&parsed=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Pyth API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const parsed = data.parsed?.[0];
    if (!parsed) {
      throw new Error(`No price data returned for ${pair}`);
    }

    return normalizePythPrice(parsed);
  }

  async getRates(pairs: FXPairId[]): Promise<Record<FXPairId, OraclePrice>> {
    const feedIds = pairs.map((p) => {
      const id = FX_FEED_IDS[p];
      if (!id) throw new Error(`No Pyth feed ID for pair: ${p}`);
      return id;
    });

    const idsParam = feedIds.map((id) => `ids[]=${id}`).join("&");
    const url = `${this.baseUrl}/v2/updates/price/latest?${idsParam}&parsed=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Pyth API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const result: Record<string, OraclePrice> = {};

    for (let i = 0; i < pairs.length; i++) {
      const parsed = data.parsed?.[i];
      if (parsed) {
        result[pairs[i]] = normalizePythPrice(parsed);
      }
    }

    return result as Record<FXPairId, OraclePrice>;
  }

  createPriceStream(
    pairs: FXPairId[],
    onUpdate: (pair: FXPairId, price: OraclePrice) => void,
  ): () => void {
    const feedIds = pairs.map((p) => FX_FEED_IDS[p]).filter(Boolean);
    const idsParam = feedIds.map((id) => `ids[]=${id}`).join("&");
    const url = `${this.baseUrl}/v2/updates/price/stream?${idsParam}&parsed=true`;

    const feedIdToPair: Record<string, FXPairId> = {};
    for (const pair of pairs) {
      const feedId = FX_FEED_IDS[pair];
      if (feedId) {
        feedIdToPair[feedId.replace("0x", "")] = pair;
      }
    }

    let aborted = false;
    const abortController = new AbortController();

    const connect = async () => {
      try {
        const response = await fetch(url, { signal: abortController.signal });
        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!aborted) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            try {
              const data = JSON.parse(line.slice(5));
              const parsed = data.parsed?.[0];
              if (!parsed) continue;

              const id = parsed.id;
              const pair = feedIdToPair[id];
              if (pair) {
                onUpdate(pair, normalizePythPrice(parsed));
              }
            } catch {
              // skip malformed SSE messages
            }
          }
        }
      } catch (err: unknown) {
        if (!aborted && err instanceof Error && err.name !== "AbortError") {
          // Reconnect after delay
          setTimeout(connect, 3000);
        }
      }
    };

    connect();

    return () => {
      aborted = true;
      abortController.abort();
    };
  }
}
