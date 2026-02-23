"use client";

import { useQuery } from "@tanstack/react-query";
import { rateEngine } from "@/lib/sdk";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import type { RateComparison } from "@solafx/types";

export function useJupiterQuote(
  inputToken: string,
  outputToken: string,
  amount: number,
  options?: { forExecution?: boolean },
) {
  const { walletAddress } = useSolanaWallet();

  return useQuery<RateComparison>({
    queryKey: [
      "jupiter-quote",
      inputToken,
      outputToken,
      amount,
      options?.forExecution ? walletAddress : null,
    ],
    queryFn: () =>
      rateEngine.getComparison({
        inputToken,
        outputToken,
        amount,
        taker: options?.forExecution ? walletAddress ?? undefined : undefined,
      }),
    enabled: amount > 0 && !!inputToken && !!outputToken && inputToken !== outputToken,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}
