"use client";

import { useCallback } from "react";
import { useConnector } from "@solana/connector/react";

export function useSolanaWallet() {
  const {
    connectors,
    isConnected,
    isConnecting,
    account,
    connectWallet,
    disconnectWallet,
  } = useConnector();

  const connectDefaultWallet = useCallback(async () => {
    const readyConnectors = connectors.filter((connector) => connector.ready);
    const preferred = readyConnectors.find((connector) =>
      connector.id.toString().includes("phantom"),
    );
    const connectorId = preferred?.id ?? readyConnectors[0]?.id ?? null;
    if (!connectorId) throw new Error("No compatible wallet found");
    await connectWallet(connectorId);
  }, [connectWallet, connectors]);

  return {
    connectors,
    isConnected,
    isConnecting,
    walletAddress: account ?? null,
    connectWallet,
    connectDefaultWallet,
    disconnectWallet,
  };
}
