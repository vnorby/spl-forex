import type { FXPairId, OraclePrice } from "@solafx/types";
import { FX_FEED_IDS, DERIVED_FX_PAIRS } from "./feed-ids";
import { deriveCrossPrice, normalizePythPrice } from "./price-math";

const STREAM_RETRY_MIN_MS = 3_000;
const STREAM_RETRY_MAX_MS = 60_000;

// Hermes returns feed ids without the 0x prefix
const PAIR_BY_FEED_ID: Record<string, FXPairId> = {};
for (const [pair, id] of Object.entries(FX_FEED_IDS)) {
  if (id) PAIR_BY_FEED_ID[id.replace("0x", "")] = pair as FXPairId;
}

/** The published feeds needed to price a pair: itself, or a derived cross's two legs. */
function sourcePairs(pair: FXPairId): FXPairId[] {
  const derived = DERIVED_FX_PAIRS[pair];
  if (derived) return derived.legs;
  return FX_FEED_IDS[pair] ? [pair] : [];
}

function resolvePrice(
  pair: FXPairId,
  prices: Partial<Record<FXPairId, OraclePrice>>,
): OraclePrice | undefined {
  const derived = DERIVED_FX_PAIRS[pair];
  if (!derived) return prices[pair];
  const [a, b] = derived.legs.map((leg) => prices[leg]);
  return a && b ? deriveCrossPrice(a, b, derived.op) : undefined;
}

export class PythFXClient {
  private baseUrl: string;

  constructor(endpoint?: string) {
    this.baseUrl = endpoint ?? "https://hermes.pyth.network";
  }

  async getRate(pair: FXPairId): Promise<OraclePrice> {
    const rate = (await this.getRates([pair]))[pair];
    if (!rate) {
      throw new Error(`No price data returned for ${pair}`);
    }
    return rate;
  }

  async getRates(pairs: FXPairId[]): Promise<Record<FXPairId, OraclePrice>> {
    const sources = new Set<FXPairId>();
    for (const pair of pairs) {
      const needed = sourcePairs(pair);
      if (needed.length === 0) throw new Error(`No Pyth feed ID for pair: ${pair}`);
      needed.forEach((p) => sources.add(p));
    }

    const idsParam = [...sources].map((p) => `ids[]=${FX_FEED_IDS[p]}`).join("&");
    const url = `${this.baseUrl}/v2/updates/price/latest?${idsParam}&parsed=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Pyth API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const sourcePrices: Partial<Record<FXPairId, OraclePrice>> = {};
    for (const parsed of data.parsed ?? []) {
      const pair = PAIR_BY_FEED_ID[parsed.id];
      if (pair) sourcePrices[pair] = normalizePythPrice(parsed);
    }

    const result: Record<string, OraclePrice> = {};
    for (const pair of pairs) {
      const price = resolvePrice(pair, sourcePrices);
      if (price) result[pair] = price;
    }

    return result as Record<FXPairId, OraclePrice>;
  }

  /**
   * Streams price updates over SSE, reconnecting with exponential backoff.
   * `onError` fires on every failed attempt; 401/403 (missing or rejected
   * API key) stop the stream since retrying cannot succeed.
   */
  createPriceStream(
    pairs: FXPairId[],
    onUpdate: (pair: FXPairId, price: OraclePrice) => void,
    onError?: (error: Error) => void,
  ): () => void {
    // Published feed -> requested pairs priced from it
    const dependents: Partial<Record<FXPairId, FXPairId[]>> = {};
    for (const pair of pairs) {
      for (const source of sourcePairs(pair)) {
        (dependents[source] ??= []).push(pair);
      }
    }
    const sources = Object.keys(dependents) as FXPairId[];
    if (sources.length === 0) return () => {};

    const idsParam = sources.map((p) => `ids[]=${FX_FEED_IDS[p]}`).join("&");
    const url = `${this.baseUrl}/v2/updates/price/stream?${idsParam}&parsed=true`;
    const latest: Partial<Record<FXPairId, OraclePrice>> = {};

    let aborted = false;
    let retryDelay = STREAM_RETRY_MIN_MS;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const abortController = new AbortController();

    const scheduleReconnect = () => {
      if (aborted) return;
      retryTimer = setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 2, STREAM_RETRY_MAX_MS);
    };

    const connect = async () => {
      try {
        const response = await fetch(url, { signal: abortController.signal });
        if (!response.ok || !response.body) {
          onError?.(new Error(`Pyth API error: ${response.status} ${response.statusText}`));
          if (response.status !== 401 && response.status !== 403) scheduleReconnect();
          return;
        }

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
              // One message can carry updates for several feeds
              for (const parsed of data.parsed ?? []) {
                const source = PAIR_BY_FEED_ID[parsed.id];
                if (!source) continue;
                latest[source] = normalizePythPrice(parsed);
                retryDelay = STREAM_RETRY_MIN_MS;
                for (const pair of dependents[source] ?? []) {
                  const price = resolvePrice(pair, latest);
                  if (price) onUpdate(pair, price);
                }
              }
            } catch {
              // skip malformed SSE messages
            }
          }
        }

        // Server closed the stream (e.g. proxy timeout) — reconnect
        scheduleReconnect();
      } catch (err: unknown) {
        if (!aborted && !(err instanceof Error && err.name === "AbortError")) {
          onError?.(err instanceof Error ? err : new Error(String(err)));
          scheduleReconnect();
        }
      }
    };

    connect();

    return () => {
      aborted = true;
      clearTimeout(retryTimer);
      abortController.abort();
    };
  }
}
