/**
 * Client-side OHLC candle aggregator.
 *
 * Since Pyth only streams latest prices (no OHLCV), we build candles
 * by bucketing incoming price ticks into time intervals.
 * Candles accumulate from session start only.
 */

export interface OHLCCandle {
  time: number; // Unix seconds (start of candle)
  open: number;
  high: number;
  low: number;
  close: number;
}

export type Timeframe = "1m" | "5m" | "15m" | "1h";

const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
};

const MAX_CANDLES = 200;

export class OHLCAggregator {
  private candles: Map<string, Map<Timeframe, OHLCCandle[]>> = new Map();

  /**
   * Feed a new price tick into the aggregator.
   */
  addTick(pair: string, price: number, timestampSeconds: number): void {
    if (!this.candles.has(pair)) {
      this.candles.set(pair, new Map());
    }
    const pairCandles = this.candles.get(pair)!;

    for (const tf of Object.keys(TIMEFRAME_SECONDS) as Timeframe[]) {
      if (!pairCandles.has(tf)) {
        pairCandles.set(tf, []);
      }
      const candles = pairCandles.get(tf)!;
      const interval = TIMEFRAME_SECONDS[tf];
      const bucketStart = Math.floor(timestampSeconds / interval) * interval;

      const last = candles[candles.length - 1];

      if (last && last.time === bucketStart) {
        // Update existing candle
        last.high = Math.max(last.high, price);
        last.low = Math.min(last.low, price);
        last.close = price;
      } else {
        // New candle
        candles.push({
          time: bucketStart,
          open: price,
          high: price,
          low: price,
          close: price,
        });
        // Trim to MAX_CANDLES
        if (candles.length > MAX_CANDLES) {
          candles.shift();
        }
      }
    }
  }

  /**
   * Get candle data for a pair and timeframe.
   */
  getCandles(pair: string, timeframe: Timeframe): OHLCCandle[] {
    return this.candles.get(pair)?.get(timeframe) ?? [];
  }

  /**
   * Check if we have any data for a pair.
   */
  hasData(pair: string): boolean {
    const pairCandles = this.candles.get(pair);
    if (!pairCandles) return false;
    for (const candles of pairCandles.values()) {
      if (candles.length > 0) return true;
    }
    return false;
  }
}
