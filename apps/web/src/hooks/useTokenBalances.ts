"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { TOKEN_REGISTRY } from "@solafx/sdk";
import { heliusClient } from "@/lib/sdk";

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

/**
 * Fetches token balances via Helius DAS API (proxied server-side) with fallback to standard RPC.
 * Uses React Query for cache management and proper invalidation after swaps.
 */
export function useTokenBalances() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() ?? null;

  const { data: balances = {}, isLoading: loading } = useQuery({
    queryKey: ["token-balances", walletAddress],
    queryFn: async () => {
      if (!walletAddress || !publicKey) return {};

      // Fast path: Helius DAS API (via server-side proxy)
      try {
        return await heliusClient.getTokenBalances(walletAddress);
      } catch {
        // Fallback: standard RPC if proxy fails
        return fetchBalancesViaRPC(publicKey);
      }
    },
    enabled: !!walletAddress,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  async function fetchBalancesViaRPC(pk: PublicKey): Promise<Record<string, number>> {
    const accounts = await connection.getParsedTokenAccountsByOwner(pk, {
      programId: TOKEN_PROGRAM_ID,
    });

    const mintToSymbol: Record<string, string> = {};
    for (const [symbol, info] of Object.entries(TOKEN_REGISTRY)) {
      mintToSymbol[info.mintAddress] = symbol;
    }

    const result: Record<string, number> = {};
    for (const { account } of accounts.value) {
      const parsed = account.data.parsed?.info;
      if (!parsed) continue;
      const symbol = mintToSymbol[parsed.mint];
      if (symbol) {
        result[symbol] = parsed.tokenAmount?.uiAmount ?? 0;
      }
    }

    for (const symbol of Object.keys(TOKEN_REGISTRY)) {
      if (!(symbol in result)) result[symbol] = 0;
    }

    return result;
  }

  return { balances, loading };
}
