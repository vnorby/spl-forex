"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Card, Button } from "@solafx/ui";
import { TokenSelector } from "./TokenSelector";
import { AmountInput } from "./AmountInput";
import { SwapConfirmModal } from "./SwapConfirmModal";
import { RateComparisonPanel } from "@/components/rates/RateComparison";
import { TransactionHistory } from "@/components/history/TransactionHistory";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { useJupiterQuote } from "@/hooks/useJupiterQuote";
import { useSwapExecution } from "@/hooks/useSwapExecution";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { formatAmount } from "@/lib/utils";
import { rateEngine } from "@/lib/sdk";
import type { RateComparison } from "@solafx/types";

interface SwapCardProps {
  initialPair?: { input: string; output: string } | null;
}

export function SwapCard({ initialPair }: SwapCardProps) {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { balances } = useTokenBalances();
  const { status, result, error, execute, reset } = useSwapExecution();

  const [inputToken, setInputToken] = useState("USDC");
  const [outputToken, setOutputToken] = useState("EURC");

  // Sync tokens when navigated from ArbitragePanel
  useEffect(() => {
    if (initialPair) {
      setInputToken(initialPair.input);
      setOutputToken(initialPair.output);
      setAmount("");
    }
  }, [initialPair]);
  const [amount, setAmount] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [execComparison, setExecComparison] = useState<RateComparison | null>(null);

  const numAmount = parseFloat(amount) || 0;

  const { data: comparison, isLoading } = useJupiterQuote(
    inputToken,
    outputToken,
    numAmount,
  );

  const handleFlip = useCallback(() => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setAmount("");
  }, [inputToken, outputToken]);

  const handleInputTokenChange = useCallback(
    (symbol: string) => {
      if (symbol === outputToken) {
        setOutputToken(inputToken);
      }
      setInputToken(symbol);
    },
    [inputToken, outputToken],
  );

  const handleOutputTokenChange = useCallback(
    (symbol: string) => {
      if (symbol === inputToken) {
        setInputToken(outputToken);
      }
      setOutputToken(symbol);
    },
    [inputToken, outputToken],
  );

  const handleSwapClick = useCallback(async () => {
    if (!publicKey) {
      setVisible(true);
      return;
    }

    // Fetch order with taker for signing
    try {
      const comp = await rateEngine.getComparison({
        inputToken,
        outputToken,
        amount: numAmount,
        taker: publicKey.toBase58(),
      });
      setExecComparison(comp);
      setConfirmOpen(true);
    } catch {
      // Error fetching executable quote
    }
  }, [publicKey, inputToken, outputToken, numAmount, setVisible]);

  const handleConfirm = useCallback(async () => {
    if (!execComparison) return;
    await execute(execComparison);
    setConfirmOpen(false);
  }, [execComparison, execute]);

  const canSwap = numAmount > 0 && inputToken !== outputToken;

  return (
    <>
      <Card className="space-y-4">
        {/* Input Section */}
        <div className="border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">You pay</span>
            <WalletBalance tokenSymbol={inputToken} />
          </div>
          <div className="flex items-center gap-3">
            <AmountInput
              value={amount}
              onChange={setAmount}
              maxBalance={balances[inputToken]}
            />
            <TokenSelector
              value={inputToken}
              onChange={handleInputTokenChange}
              excludeToken={outputToken}
            />
          </div>
        </div>

        {/* Flip Button */}
        <div className="flex justify-center -my-6 relative z-[1]">
          <button
            type="button"
            onClick={handleFlip}
            className="flex h-11 w-11 items-center justify-center border-2 transition-all active:scale-95"
            style={{
              borderColor: "var(--color-accent)",
              background: "var(--color-bg-subtle)",
              color: "var(--color-accent)",
              boxShadow: "0 0 16px rgba(0, 229, 200, 0.15)",
            }}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M2.24 6.8a.75.75 0 001.06-.04l1.95-2.1v8.59a.75.75 0 001.5 0V4.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L2.2 5.74a.75.75 0 00.04 1.06zm8.6 3.44a.75.75 0 10-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V4.25a.75.75 0 00-1.5 0v8.59l-1.95-2.1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Output Section */}
        <div className="border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">You receive</span>
            <WalletBalance tokenSymbol={outputToken} />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-full text-2xl font-semibold">
              {comparison
                ? formatAmount(comparison.outputAmount, 4)
                : numAmount > 0 && isLoading
                  ? "..."
                  : "0.00"}
            </div>
            <TokenSelector
              value={outputToken}
              onChange={handleOutputTokenChange}
              excludeToken={inputToken}
            />
          </div>
        </div>

        {/* Rate Comparison */}
        <RateComparisonPanel comparison={comparison} loading={isLoading && numAmount > 0} />

        {/* Swap Button */}
        {!publicKey ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => setVisible(true)}
          >
            Connect Wallet
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!canSwap || isLoading}
            onClick={handleSwapClick}
          >
            {!canSwap
              ? "Enter an amount"
              : isLoading
                ? "Fetching quote..."
                : `Swap ${inputToken} to ${outputToken}`}
          </Button>
        )}

        {/* Status Messages */}
        {status === "success" && result && (
          <div
            className="flex items-center justify-between p-3 text-sm"
            style={{
              background: "rgba(0, 220, 130, 0.08)",
              border: "1px solid rgba(0, 220, 130, 0.2)",
              color: "var(--color-success)",
            }}
          >
            <span>
              Swap successful!{" "}
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Explorer
              </a>
            </span>
            <button
              onClick={() => {
                handleFlip();
                reset();
              }}
              className="ml-3 whitespace-nowrap px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                background: "rgba(0, 220, 130, 0.12)",
                border: "1px solid rgba(0, 220, 130, 0.25)",
                color: "var(--color-success)",
              }}
            >
              Swap Back
            </button>
          </div>
        )}

        {status === "error" && error && (
          <div
            className="flex items-center justify-between p-3 text-sm"
            style={{
              background: "rgba(255, 71, 87, 0.08)",
              border: "1px solid rgba(255, 71, 87, 0.2)",
              color: "var(--color-danger)",
            }}
          >
            <span>{error}</span>
            <button
              onClick={reset}
              className="ml-3 whitespace-nowrap px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                background: "rgba(255, 71, 87, 0.12)",
                border: "1px solid rgba(255, 71, 87, 0.25)",
                color: "var(--color-danger)",
              }}
            >
              Dismiss
            </button>
          </div>
        )}
      </Card>

      {/* Transaction History */}
      <div className="mt-6">
        <TransactionHistory />
      </div>

      {/* Confirm Modal */}
      <SwapConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        comparison={execComparison}
        status={status}
      />
    </>
  );
}
