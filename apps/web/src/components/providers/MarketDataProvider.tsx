"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import type { FXPairId, OraclePrice, MarketRow, PricePoint } from "@solafx/types";
import { FX_MARKETS } from "@solafx/sdk";
import { pythClient } from "@/lib/sdk";
import { OHLCAggregator } from "@/lib/ohlc";
import { useToast } from "./ToastProvider";

// ─── Connection Status ──────────────────────────────────────────────
export type ConnectionStatus = "connecting" | "live" | "stale" | "offline";

// ─── Split Contexts for Performance ─────────────────────────────────
// PriceContext updates at ~5fps (RAF-batched SSE ticks)
// HistoryContext updates every 5s (for sparklines + candle charts)

interface PriceContextValue {
  markets: MarketRow[];
  connectionStatus: ConnectionStatus;
  lastUpdate: number | null;
}

interface HistoryContextValue {
  priceHistory: Record<string, PricePoint[]>;
  ohlcAggregator: OHLCAggregator | null;
}

const PriceContext = createContext<PriceContextValue>({
  markets: [],
  connectionStatus: "connecting",
  lastUpdate: null,
});

const HistoryContext = createContext<HistoryContextValue>({
  priceHistory: {},
  ohlcAggregator: null,
});

/** Fast-changing price data (~5fps). Use for rates, market rows, status. */
export function usePriceContext() {
  return useContext(PriceContext);
}

/** Slow-changing history data (~0.2fps). Use for sparklines, candle charts. */
export function useHistoryContext() {
  return useContext(HistoryContext);
}

/** Backward-compatible merged context. Prefer usePriceContext or useHistoryContext. */
export function useMarketDataContext() {
  const price = usePriceContext();
  const history = useHistoryContext();
  return {
    ...price,
    ...history,
    connected: price.connectionStatus === "live",
  };
}

const MAX_HISTORY_POINTS = 200;
const STALE_THRESHOLD_MS = 10_000;

export function MarketDataProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [prices, setPrices] = useState<Record<string, OraclePrice>>({});
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const priceHistoryRef = useRef<Record<string, PricePoint[]>>({});
  const [priceHistory, setPriceHistory] = useState<Record<string, PricePoint[]>>({});
  const initialPricesRef = useRef<Record<string, number>>({});
  const ohlcRef = useRef<OHLCAggregator>(new OHLCAggregator());

  // ─── RAF-batched price updates ──────────────────────────────────
  const pendingUpdatesRef = useRef<Record<string, OraclePrice>>({});
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const hasReceivedFirstMessage = useRef(false);
  const wasStaleRef = useRef(false);

  const flushPrices = useCallback(() => {
    const pending = pendingUpdatesRef.current;
    if (Object.keys(pending).length === 0) {
      rafIdRef.current = null;
      return;
    }
    setPrices((prev) => ({ ...prev, ...pending }));
    setLastUpdate(Date.now());
    pendingUpdatesRef.current = {};
    rafIdRef.current = null;
  }, []);

  const handlePriceUpdate = useCallback(
    (pair: FXPairId, price: OraclePrice) => {
      // Mark connected on first message
      if (!hasReceivedFirstMessage.current) {
        hasReceivedFirstMessage.current = true;
        setConnectionStatus("live");
      }

      lastUpdateTimeRef.current = Date.now();

      // If we were stale, we're back to live — fire reconnection toast
      if (wasStaleRef.current) {
        wasStaleRef.current = false;
        toast({ type: "info", title: "Reconnected", message: "Price feed restored" });
      }
      setConnectionStatus((prev) => (prev === "stale" ? "live" : prev));

      // Buffer the update (no React state change here)
      pendingUpdatesRef.current[pair] = price;

      // Store initial price for session change approximation
      if (!initialPricesRef.current[pair]) {
        initialPricesRef.current[pair] = price.price;
      }

      // Feed OHLC aggregator (ref-based, cheap)
      ohlcRef.current.addTick(pair, price.price, price.publishTime);

      // Accumulate history (ref-based, cheap)
      const history = priceHistoryRef.current[pair] ?? [];
      history.push({ price: price.price, timestamp: price.publishTime });
      if (history.length > MAX_HISTORY_POINTS) {
        history.shift();
      }
      priceHistoryRef.current[pair] = history;

      // Schedule single RAF flush (~5fps max)
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(flushPrices);
      }
    },
    [flushPrices],
  );

  // ─── Initial fetch ──────────────────────────────────────────────
  useEffect(() => {
    const allPairs = FX_MARKETS.map((m) => m.pair);
    pythClient
      .getRates(allPairs)
      .then((rates) => {
        setPrices(rates);
        for (const [pair, price] of Object.entries(rates)) {
          initialPricesRef.current[pair] = price.price;
          priceHistoryRef.current[pair] = [
            { price: price.price, timestamp: price.publishTime },
          ];
        }
        setPriceHistory({ ...priceHistoryRef.current });
        setLastUpdate(Date.now());
        lastUpdateTimeRef.current = Date.now();
      })
      .catch(() => {});
  }, []);

  // ─── SSE stream ─────────────────────────────────────────────────
  useEffect(() => {
    const allPairs = FX_MARKETS.map((m) => m.pair);
    const unsubscribe = pythClient.createPriceStream(allPairs, handlePriceUpdate);

    // Sync history to state every 5s (for sparklines + charts)
    const historyInterval = setInterval(() => {
      setPriceHistory({ ...priceHistoryRef.current });
    }, 5000);

    return () => {
      unsubscribe();
      setConnectionStatus("offline");
      clearInterval(historyInterval);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [handlePriceUpdate]);

  // ─── Staleness watchdog ─────────────────────────────────────────
  useEffect(() => {
    const watchdog = setInterval(() => {
      if (
        lastUpdateTimeRef.current > 0 &&
        Date.now() - lastUpdateTimeRef.current > STALE_THRESHOLD_MS
      ) {
        setConnectionStatus((prev) => {
          if (prev !== "stale") {
            wasStaleRef.current = true;
            toast({
              type: "warning",
              title: "Connection Stale",
              message: "Price feed not updating — data may be outdated",
              duration: 0, // persist until reconnection
            });
          }
          return "stale";
        });
      }
    }, 5_000);
    return () => clearInterval(watchdog);
  }, [toast]);

  // ─── Compute markets array ──────────────────────────────────────
  const markets: MarketRow[] = FX_MARKETS.map((market) => {
    const price = prices[market.pair];
    const initialPrice = initialPricesRef.current[market.pair];
    const rawChange =
      price && initialPrice ? ((price.price - initialPrice) / initialPrice) * 100 : null;
    const change24h = rawChange !== null && Math.abs(rawChange) > 0.0001 ? rawChange : null;

    return {
      market,
      rate: price?.price ?? 0,
      confidence: price?.confidence ?? 0,
      previousRate: initialPrice ?? null,
      change24h,
      publishTime: price?.publishTime ?? 0,
      tradeable: market.solanaMapping !== null,
    };
  });

  return (
    <PriceContext.Provider value={{ markets, connectionStatus, lastUpdate }}>
      <HistoryContext.Provider
        value={{ priceHistory, ohlcAggregator: ohlcRef.current }}
      >
        {children}
      </HistoryContext.Provider>
    </PriceContext.Provider>
  );
}
