"use client";

import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  address,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
} from "@solana/kit";
import { useKitTransactionSigner } from "@solana/connector";
import { useCluster } from "@solana/connector/react";
import { TransactionBuilder } from "@pipeit/core";
import {
  createMetisClient,
  metisInstructionToKit,
} from "@pipeit/actions/metis";
import { TOKEN_REGISTRY } from "@solafx/sdk";
import { env } from "@/config/env";
import { useToast } from "@/components/providers/ToastProvider";
import { getSolanaExplorerClusterQuery } from "@/lib/solana-cluster";
import type { SwapStatus, SwapResult, RateComparison } from "@solafx/types";

export function useSwapExecution() {
  const { signer, ready } = useKitTransactionSigner();
  const { cluster } = useCluster();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [status, setStatus] = useState<SwapStatus>("idle");
  const [result, setResult] = useState<SwapResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rpcUrl = cluster?.url ?? env.heliusRpcUrl ?? env.solanaRpcUrl;
  const wsUrl = useMemo(() => rpcUrl.replace(/^http/, "ws"), [rpcUrl]);
  const rpc = useMemo(() => createSolanaRpc(rpcUrl), [rpcUrl]);
  const rpcSubscriptions = useMemo(
    () => createSolanaRpcSubscriptions(wsUrl),
    [wsUrl],
  );
  const metisClient = createMetisClient({
    // Server route injects JUPITER_API_KEY securely.
    baseUrl: "/api/jupiter/metis",
  });

  const execute = useCallback(
    async (comparison: RateComparison) => {
      if (!ready || !signer) {
        setError("Wallet not connected");
        return;
      }
      const inputTokenInfo = TOKEN_REGISTRY[comparison.inputToken];
      const outputTokenInfo = TOKEN_REGISTRY[comparison.outputToken];
      if (!inputTokenInfo || !outputTokenInfo) {
        setError("Unsupported token pair");
        return;
      }

      try {
        setStatus("executing");
        setError(null);
        setResult(null);

        const rawAmount = BigInt(
          Math.floor(comparison.inputAmount * 10 ** inputTokenInfo.decimals),
        );

        const quoteResponse = await metisClient.getQuote({
          inputMint: inputTokenInfo.mintAddress,
          outputMint: outputTokenInfo.mintAddress,
          amount: rawAmount,
          slippageBps: 50,
          swapMode: "ExactIn",
        });

        const swapInstructions = await metisClient.getSwapInstructions({
          quoteResponse,
          userPublicKey: String(signer.address),
          wrapAndUnwrapSol: true,
          useSharedAccounts: true,
        });

        const simulationError = (
          swapInstructions as unknown as { simulationError?: unknown }
        ).simulationError;
        if (simulationError) {
          // Keep going; local simulation in TransactionBuilder is authoritative.
          console.warn("[Jupiter Metis] swap-instructions simulationError", simulationError);
        }

        const allInstructions = [
          ...swapInstructions.otherInstructions.map(metisInstructionToKit),
          ...swapInstructions.setupInstructions.map(metisInstructionToKit),
          ...(swapInstructions.tokenLedgerInstruction
            ? [metisInstructionToKit(swapInstructions.tokenLedgerInstruction)]
            : []),
          metisInstructionToKit(swapInstructions.swapInstruction),
          ...(swapInstructions.cleanupInstruction
            ? [metisInstructionToKit(swapInstructions.cleanupInstruction)]
            : []),
        ];

        const lookupTableAddresses =
          swapInstructions.addressLookupTableAddresses.map((lookupTableAddress) =>
            address(lookupTableAddress),
          );

        setStatus("confirming");

        const executeSwapOnce = async () =>
          new TransactionBuilder({
            rpc,
            computeUnits: { strategy: "simulate", buffer: 1.1 },
            priorityFee: { strategy: "fixed", microLamports: 200_000 },
            autoRetry: false,
            lookupTableAddresses:
              lookupTableAddresses.length > 0 ? lookupTableAddresses : undefined,
          })
            .setFeePayerSigner(signer)
            .addInstructions(allInstructions)
            .execute({
              rpcSubscriptions,
              commitment: "confirmed",
              skipPreflight: true,
            });

        let txSignature: string;
        try {
          txSignature = await executeSwapOnce();
        } catch (executionError) {
          const message =
            executionError instanceof Error
              ? executionError.message
              : String(executionError);
          if (message.includes("progressed past the last block")) {
            txSignature = await executeSwapOnce();
          } else {
            throw executionError;
          }
        }

        const swapResult: SwapResult = {
          status: "Success",
          signature: txSignature,
          explorerUrl: buildExplorerUrl(txSignature, cluster?.id),
        };

        setResult(swapResult);

        setStatus("success");
        saveToHistory(comparison, swapResult);
        queryClient.invalidateQueries({ queryKey: ["jupiter-quote"] });
        queryClient.invalidateQueries({ queryKey: ["token-balances"] });
        toast({
          type: "success",
          title: "Swap Confirmed",
          message: `${comparison.inputToken} → ${comparison.outputToken}`,
          action: swapResult.explorerUrl
            ? {
                label: "View on Explorer",
                onClick: () => window.open(swapResult.explorerUrl, "_blank"),
              }
            : undefined,
        });
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
    [cluster?.id, metisClient, queryClient, ready, rpc, rpcSubscriptions, signer, toast],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, execute, reset };
}

function buildExplorerUrl(txSignature: string, clusterId?: string | null) {
  const clusterQuery = getSolanaExplorerClusterQuery(clusterId);
  return `https://explorer.solana.com/tx/${txSignature}${clusterQuery}`;
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
