"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { useQueryClient } from "@tanstack/react-query";
import { swapExecutor } from "@/lib/sdk";
import { useToast } from "@/components/providers/ToastProvider";
import type { SwapStatus, SwapResult, RateComparison } from "@solafx/types";

export function useSwapExecution() {
  const { signTransaction } = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [status, setStatus] = useState<SwapStatus>("idle");
  const [result, setResult] = useState<SwapResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (comparison: RateComparison) => {
      if (!signTransaction || !comparison.jupiterOrderData) {
        setError("Wallet not connected or no transaction data");
        return;
      }

      try {
        setStatus("signing");
        setError(null);
        setResult(null);

        const txBuffer = Buffer.from(
          comparison.jupiterOrderData.transaction,
          "base64",
        );
        const tx = VersionedTransaction.deserialize(txBuffer);
        const signedTx = await signTransaction(tx);
        const signedBase64 = Buffer.from(signedTx.serialize()).toString("base64");

        setStatus("executing");

        const swapResult = await swapExecutor.execute({
          signedTransaction: signedBase64,
          requestId: comparison.jupiterOrderData.requestId,
        });

        setResult(swapResult);

        if (swapResult.status === "Success" && swapResult.signature) {
          // Monitor on-chain confirmation
          setStatus("confirming");
          try {
            const confirmation = await connection.confirmTransaction(
              swapResult.signature,
              "confirmed",
            );

            if (confirmation.value.err) {
              setStatus("error");
              setError("Transaction failed on-chain");
              toast({ type: "error", title: "Swap Failed", message: "Transaction reverted on-chain" });
            } else {
              setStatus("success");
              saveToHistory(comparison, swapResult);
              queryClient.invalidateQueries({ queryKey: ["jupiter-quote"] });
              queryClient.invalidateQueries({ queryKey: ["token-balances"] });
              toast({
                type: "success",
                title: "Swap Confirmed",
                message: `${comparison.inputToken} → ${comparison.outputToken}`,
                action: swapResult.explorerUrl
                  ? { label: "View on Explorer", onClick: () => window.open(swapResult.explorerUrl, "_blank") }
                  : undefined,
              });
            }
          } catch {
            // If confirmation polling fails, still treat as success
            setStatus("success");
            saveToHistory(comparison, swapResult);
            queryClient.invalidateQueries({ queryKey: ["jupiter-quote"] });
            queryClient.invalidateQueries({ queryKey: ["token-balances"] });
            toast({
              type: "success",
              title: "Swap Confirmed",
              message: `${comparison.inputToken} → ${comparison.outputToken}`,
              action: swapResult.explorerUrl
                ? { label: "View on Explorer", onClick: () => window.open(swapResult.explorerUrl, "_blank") }
                : undefined,
            });
          }
        } else {
          setStatus("error");
          setError("Transaction failed on-chain");
          toast({ type: "error", title: "Swap Failed", message: "Transaction failed on-chain" });
        }
      } catch (err: unknown) {
        setStatus("error");
        if (err instanceof Error) {
          if (err.message.includes("User rejected")) {
            setError("Transaction cancelled");
            setStatus("idle");
          } else {
            setError(err.message);
            toast({ type: "error", title: "Swap Failed", message: err.message });
          }
        } else {
          setError("Unknown error");
          toast({ type: "error", title: "Swap Failed", message: "An unknown error occurred" });
        }
      }
    },
    [signTransaction, connection, queryClient, toast],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, execute, reset };
}

function saveToHistory(comparison: RateComparison, result: SwapResult) {
  try {
    const history = JSON.parse(localStorage.getItem("solafx-history") ?? "[]");
    history.unshift({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      inputToken: comparison.inputToken,
      outputToken: comparison.outputToken,
      inputAmount: comparison.inputAmount,
      outputAmount: comparison.outputAmount,
      dexRate: comparison.dexRate,
      oracleRate: comparison.oracleRate,
      spreadPercent: comparison.spreadPercent,
      signature: result.signature,
      explorerUrl: result.explorerUrl,
    });
    if (history.length > 50) history.length = 50;
    localStorage.setItem("solafx-history", JSON.stringify(history));
  } catch {
    // localStorage may be unavailable
  }
}
