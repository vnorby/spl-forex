"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type { DepthAnalysis, DepthLevel } from "@solafx/types";
import { rateEngine } from "@/lib/sdk";
import { DEPTH_AMOUNTS } from "@/config/arbitrage";

export function useDepthAnalysis(params: {
  inputToken: string;
  outputToken: string;
  enabled?: boolean;
}): {
  analysis: DepthAnalysis | null;
  isLoading: boolean;
} {
  const { inputToken, outputToken, enabled = true } = params;

  const queries = useQueries({
    queries: DEPTH_AMOUNTS.map((amount) => ({
      queryKey: ["depth", inputToken, outputToken, amount] as const,
      queryFn: async () => {
        try {
          return await rateEngine.getComparison({
            inputToken,
            outputToken,
            amount,
          });
        } catch {
          return null;
        }
      },
      refetchInterval: 60_000,
      staleTime: 45_000,
      enabled,
      retry: 1,
      retryDelay: 1_000,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);

  const analysis = useMemo<DepthAnalysis | null>(() => {
    // All queries must have resolved with data to build the analysis
    const allResolved = queries.every((q) => q.data !== undefined);
    if (!allResolved) return null;

    // Filter out null results (no-liquidity levels)
    const validResults = queries
      .map((q, i) => (q.data ? { data: q.data, amount: DEPTH_AMOUNTS[i] } : null))
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (validResults.length === 0) return null;

    // Best rate comes from the smallest size level (first valid result)
    const bestRate = validResults[0].data.dexRate;

    const levels: DepthLevel[] = validResults.map(({ data, amount }) => {
      const priceImpact = Math.max(0, ((bestRate - data.dexRate) / bestRate) * 100);

      return {
        inputAmount: amount,
        outputAmount: data.outputAmount,
        dexRate: data.dexRate,
        oracleRate: data.oracleRate,
        spreadPercent: data.spreadPercent,
        spreadDirection: data.spreadDirection,
        priceImpact,
      };
    });

    return {
      inputToken,
      outputToken,
      levels,
      oracleRate: validResults[0].data.oracleRate,
      bestRate,
      timestamp: Date.now(),
    };
  }, [queries, inputToken, outputToken]);

  return { analysis, isLoading };
}
