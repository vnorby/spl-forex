"use client";

import { useMemo } from "react";
import { usePriceContext, type ConnectionStatus } from "@/components/providers/MarketDataProvider";

export type SortField = "pair" | "rate" | "change24h" | "tradeable" | "globalVolume";
export type SortDirection = "asc" | "desc";

export function useMarketData(options?: {
  search?: string;
  sortField?: SortField;
  sortDirection?: SortDirection;
  tradeableOnly?: boolean;
}) {
  const { markets, connectionStatus, lastUpdate } = usePriceContext();

  const filtered = useMemo(() => {
    let result = markets;

    if (options?.tradeableOnly) {
      result = result.filter((r) => r.tradeable);
    }

    if (options?.search) {
      const term = options.search.toUpperCase();
      result = result.filter(
        (r) =>
          r.market.pair.includes(term) ||
          r.market.base.includes(term) ||
          r.market.quote.includes(term),
      );
    }

    const field = options?.sortField ?? "pair";
    const dir = options?.sortDirection ?? "asc";
    const mult = dir === "asc" ? 1 : -1;

    result = [...result].sort((a, b) => {
      switch (field) {
        case "pair":
          return mult * a.market.pair.localeCompare(b.market.pair);
        case "rate":
          return mult * (a.rate - b.rate);
        case "change24h":
          return mult * ((a.change24h ?? 0) - (b.change24h ?? 0));
        case "tradeable": {
          // Primary: tradeable first (always), secondary: volume descending
          const tradeableDiff = Number(b.tradeable) - Number(a.tradeable);
          if (tradeableDiff !== 0) return tradeableDiff;
          return b.market.globalVolume24h - a.market.globalVolume24h;
        }
        case "globalVolume":
          return mult * (a.market.globalVolume24h - b.market.globalVolume24h);
        default:
          return 0;
      }
    });

    return result;
  }, [markets, options?.search, options?.sortField, options?.sortDirection, options?.tradeableOnly]);

  return { markets: filtered, connectionStatus, lastUpdate };
}
