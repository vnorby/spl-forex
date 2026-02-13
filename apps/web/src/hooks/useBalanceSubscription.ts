"use client";

import { useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import { env } from "@/config/env";

/**
 * Subscribes to wallet account changes via Solana WebSocket.
 * When a change is detected, invalidates the token-balances query
 * for near-instant balance updates after swaps.
 *
 * Only active when Helius RPC is configured (reliable WebSocket endpoint).
 */
export function useBalanceSubscription() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!publicKey || !env.heliusRpcUrl) return;

    const subscriptionId = connection.onAccountChange(
      publicKey,
      () => {
        // Wallet SOL balance or account data changed — invalidate balance cache
        queryClient.invalidateQueries({ queryKey: ["token-balances"] });
      },
      "confirmed",
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [publicKey, connection, queryClient]);
}
