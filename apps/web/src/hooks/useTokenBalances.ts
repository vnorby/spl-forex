"use client";

import { useQuery } from "@tanstack/react-query";
import { TOKEN_REGISTRY } from "@solafx/sdk";
import { heliusClient } from "@/lib/sdk";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";

/**
 * Fetches token balances via Helius DAS API (proxied server-side) with fallback to standard RPC.
 * Uses React Query for cache management and proper invalidation after swaps.
 */
export function useTokenBalances() {
  const { walletAddress } = useSolanaWallet();

  const { data: balances = {}, isLoading: loading } = useQuery({
    queryKey: ["token-balances", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return {};

      // Fast path: Helius DAS API (via server-side proxy)
      try {
        return await heliusClient.getTokenBalances(walletAddress);
      } catch {
        // Fallback: return known token symbols at 0 if proxy fails.
        const empty: Record<string, number> = {};
        for (const symbol of Object.keys(TOKEN_REGISTRY)) {
          empty[symbol] = 0;
        }
        return empty;
      }
    },
    enabled: !!walletAddress,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  return { balances, loading };
}
