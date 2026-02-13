"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { TOKEN_REGISTRY } from "@solafx/sdk";
import type { ArbitrageOpportunity } from "@solafx/types";
import { rateEngine } from "@/lib/sdk";
import { generateArbitragePairs, ARB_REFERENCE_AMOUNT } from "@/config/arbitrage";

const arbitragePairs = generateArbitragePairs();

export function useArbitrageData(enabled = true): {
  opportunities: ArbitrageOpportunity[];
  isLoading: boolean;
} {
  const queries = useQueries({
    queries: arbitragePairs.map((pair, i) => ({
      queryKey: ["arbitrage", pair.inputToken, pair.outputToken, ARB_REFERENCE_AMOUNT] as const,
      queryFn: async () => {
        // Batch in groups of 6 with 25ms stagger — startup ~150ms vs 3.4s
        const batchIndex = Math.floor(i / 6);
        if (batchIndex > 0) await new Promise((r) => setTimeout(r, batchIndex * 25));
        try {
          return await rateEngine.getComparison({
            inputToken: pair.inputToken,
            outputToken: pair.outputToken,
            amount: ARB_REFERENCE_AMOUNT,
          });
        } catch {
          // Jupiter may error for pairs with no liquidity — return null so we
          // can still surface the pair with hasLiquidity: false.
          return null;
        }
      },
      refetchInterval: 60_000,
      staleTime: 30_000,
      enabled,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);

  const opportunities = useMemo<ArbitrageOpportunity[]>(() => {
    return queries.map((query, index) => {
      const pair = arbitragePairs[index];
      const data = query.data ?? null;

      const inputInfo = TOKEN_REGISTRY[pair.inputToken];
      const outputInfo = TOKEN_REGISTRY[pair.outputToken];
      const isPegArb =
        !!inputInfo && !!outputInfo && inputInfo.currency === outputInfo.currency;

      if (!data) {
        return {
          inputToken: pair.inputToken,
          outputToken: pair.outputToken,
          dexRate: 0,
          oracleRate: 0,
          spreadPercent: 0,
          spreadDirection: "par" as const,
          outputAmount: 0,
          favorable: false,
          isPegArb,
          hasLiquidity: false,
        };
      }

      return {
        inputToken: data.inputToken,
        outputToken: data.outputToken,
        dexRate: data.dexRate,
        oracleRate: data.oracleRate,
        spreadPercent: data.spreadPercent,
        spreadDirection: data.spreadDirection,
        outputAmount: data.outputAmount,
        favorable: data.spreadDirection === "premium",
        isPegArb,
        hasLiquidity: true,
      };
    });
  }, [queries]);

  return { opportunities, isLoading };
}
