"use client";

import { useCallback } from "react";
import { useConnector } from "@solana/connector/react";
import { env } from "@/config/env";

interface SignedTransactionPayload {
  signedTransaction: Uint8Array;
}
interface WalletSignTransactionFeature {
  signTransaction: (payload: unknown) => Promise<SignedTransactionPayload | SignedTransactionPayload[]>;
}

export function useSolanaWallet() {
  const {
    connectors,
    isConnected,
    isConnecting,
    account,
    connectWallet,
    disconnectWallet,
    selectedWallet,
    selectedAccount,
  } = useConnector();

  const chain = env.solanaNetwork === "devnet" ? "solana:devnet" : "solana:mainnet";

  const connectDefaultWallet = useCallback(async () => {
    const readyConnectors = connectors.filter((connector) => connector.ready);
    const preferred = readyConnectors.find((connector) =>
      connector.id.toString().includes("phantom"),
    );
    const connectorId = preferred?.id ?? readyConnectors[0]?.id ?? null;
    if (!connectorId) throw new Error("No compatible wallet found");
    await connectWallet(connectorId);
  }, [connectWallet, connectors]);

  const signTransactionBase64 = useCallback(
    async (serializedTransactionBase64: string) => {
      if (!selectedWallet || !selectedAccount)
        throw new Error("Wallet not connected");

      const signerFeature = (selectedWallet.features as Record<string, WalletSignTransactionFeature | undefined>)[
        "solana:signTransaction"
      ];
      if (!signerFeature) throw new Error("Connected wallet does not support transaction signing");

      const payload = {
        account: selectedAccount,
        chain,
        transaction: Uint8Array.from(Buffer.from(serializedTransactionBase64, "base64")),
      };

      const signed = await signerFeature.signTransaction(payload);
      const normalized: SignedTransactionPayload = Array.isArray(signed) ? signed[0] : signed;
      return Buffer.from(normalized.signedTransaction).toString("base64");
    },
    [chain, selectedAccount, selectedWallet],
  );

  return {
    connectors,
    isConnected,
    isConnecting,
    walletAddress: account ?? null,
    connectWallet,
    connectDefaultWallet,
    disconnectWallet,
    signTransactionBase64,
  };
}
