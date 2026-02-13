"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { rateEngine } from "@/lib/sdk";
import type { RateComparison } from "@solafx/types";

export function useJupiterQuote(
  inputToken: string,
  outputToken: string,
  amount: number,
  options?: { forExecution?: boolean },
) {
  const { publicKey } = useWallet();

  return useQuery<RateComparison>({
    queryKey: [
      "jupiter-quote",
      inputToken,
      outputToken,
      amount,
      options?.forExecution ? publicKey?.toBase58() : null,
    ],
    queryFn: () =>
      rateEngine.getComparison({
        inputToken,
        outputToken,
        amount,
        taker: options?.forExecution ? publicKey?.toBase58() : undefined,
      }),
    enabled: amount > 0 && !!inputToken && !!outputToken && inputToken !== outputToken,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}
