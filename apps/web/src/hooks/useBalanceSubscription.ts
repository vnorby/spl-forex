"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";

/**
 * Subscribes to wallet account changes via Solana WebSocket.
 * When a change is detected, invalidates the token-balances query
 * for near-instant balance updates after swaps.
 *
 * Only active when Helius RPC is configured (reliable WebSocket endpoint).
 */
export function useBalanceSubscription() {
  const { walletAddress } = useSolanaWallet();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!walletAddress) return;
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["token-balances", walletAddress] });
    }, 15_000);
    return () => clearInterval(intervalId);
  }, [walletAddress, queryClient]);
}
