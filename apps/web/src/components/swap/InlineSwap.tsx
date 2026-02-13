"use client";

import React, { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { TOKEN_REGISTRY } from "@solafx/sdk";
import { useJupiterQuote } from "@/hooks/useJupiterQuote";
import { useSwapExecution } from "@/hooks/useSwapExecution";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { formatAmount } from "@/lib/utils";
import { rateEngine } from "@/lib/sdk";
import type { RateComparison } from "@solafx/types";

interface InlineSwapProps {
  inputToken: string;
  outputToken: string;
  onClose: () => void;
}

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export function InlineSwap({ inputToken, outputToken, onClose }: InlineSwapProps) {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { balances } = useTokenBalances();
  const { status, result, error, execute, reset } = useSwapExecution();

  const [amount, setAmount] = useState("");
  const numAmount = parseFloat(amount) || 0;

  const { data: comparison, isLoading } = useJupiterQuote(
    inputToken,
    outputToken,
    numAmount,
  );

  const inputInfo = TOKEN_REGISTRY[inputToken];
  const outputInfo = TOKEN_REGISTRY[outputToken];
  const inputBalance = balances[inputToken] ?? 0;

  const handleSwap = useCallback(async () => {
    if (!publicKey) {
      setVisible(true);
      return;
    }
    try {
      const comp = await rateEngine.getComparison({
        inputToken,
        outputToken,
        amount: numAmount,
        taker: publicKey.toBase58(),
      });
      await execute(comp);
    } catch {
      // handled by useSwapExecution
    }
  }, [publicKey, inputToken, outputToken, numAmount, setVisible, execute]);

  const canSwap = numAmount > 0 && status !== "signing" && status !== "executing" && status !== "confirming";
  const isBusy = status === "signing" || status === "executing" || status === "confirming";

  return (
    <div className="px-4 py-4">
      <div className="mx-auto max-w-xl space-y-3">
        {/* Token pair header */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 text-[11px] uppercase tracking-wider"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
          >
            <span style={{ color: "var(--color-text)" }}>{inputToken}</span>
            <span style={{ color: "var(--color-text-muted)" }}>→</span>
            <span>{outputToken}</span>
          </div>
          {publicKey && (
            <div
              className="flex items-center gap-2 text-[10px] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
            >
              <span>Bal: {formatAmount(inputBalance, 2)} {inputToken}</span>
              {inputBalance > 0 && (
                <button
                  onClick={() => {
                    setAmount(String(inputBalance));
                    if (status === "success" || status === "error") reset();
                  }}
                  className="px-1.5 py-px transition-colors"
                  style={{
                    background: "var(--color-accent-dim)",
                    color: "var(--color-accent)",
                    border: "1px solid rgba(0, 229, 200, 0.2)",
                  }}
                >
                  Max
                </button>
              )}
            </div>
          )}
        </div>

        {/* Amount input + quick amounts */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div
            className="relative flex-1"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (status === "success" || status === "error") reset();
              }}
              placeholder="0.00"
              className="w-full bg-transparent px-3 py-2 text-sm font-medium tabular-nums outline-none"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text)",
              }}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
            >
              {inputToken}
            </span>
          </div>

          {/* Quick amount chips */}
          <div className="flex flex-wrap gap-1">
            {QUICK_AMOUNTS.map((qa) => (
              <button
                key={qa}
                onClick={() => {
                  setAmount(String(qa));
                  if (status === "success" || status === "error") reset();
                }}
                className="px-2 py-2 text-[10px] tabular-nums transition-colors"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: parseFloat(amount) === qa ? "var(--color-accent)" : "var(--color-text-muted)",
                  background: parseFloat(amount) === qa ? "var(--color-accent-dim)" : "var(--color-surface)",
                  border: parseFloat(amount) === qa
                    ? "1px solid rgba(0, 229, 200, 0.2)"
                    : "1px solid var(--color-border)",
                }}
              >
                {qa >= 1000 ? `${qa / 1000}k` : qa}
              </button>
            ))}
          </div>
        </div>

        {/* Output + swap button row */}
        <div className="flex items-center gap-3">
          {/* Output preview */}
          <div
            className="flex flex-1 items-center justify-between px-3 py-2"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <span
              className="text-sm font-medium tabular-nums"
              style={{
                fontFamily: "var(--font-mono)",
                color: comparison ? "var(--color-text)" : "var(--color-text-muted)",
              }}
            >
              {comparison
                ? formatAmount(comparison.outputAmount, 4)
                : numAmount > 0 && isLoading
                  ? "..."
                  : "0.00"}
            </span>
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
            >
              {outputToken}
            </span>
          </div>

          {/* Swap / Connect button */}
          {!publicKey ? (
            <button
              onClick={() => setVisible(true)}
              className="whitespace-nowrap border-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "black",
                background: "var(--color-accent)",
                borderColor: "var(--color-accent)",
              }}
            >
              Connect
            </button>
          ) : (
            <button
              onClick={handleSwap}
              disabled={!canSwap}
              className="whitespace-nowrap border-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] disabled:opacity-40"
              style={{
                fontFamily: "var(--font-mono)",
                color: "black",
                background: "var(--color-accent)",
                borderColor: "var(--color-accent)",
              }}
            >
              {isBusy
                ? status === "signing"
                  ? "Signing..."
                  : status === "confirming"
                    ? "Confirming..."
                    : "Executing..."
                : "Swap"}
            </button>
          )}
        </div>

        {/* Rate info */}
        {comparison && numAmount > 0 && (
          <div
            className="flex items-center justify-between text-[10px] tabular-nums"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
          >
            <span>
              1 {inputToken} = {formatAmount(comparison.dexRate, 6)} {outputToken}
            </span>
            <span>
              Spread: {comparison.spreadPercent > 0 ? "+" : ""}
              {comparison.spreadPercent.toFixed(3)}%
            </span>
          </div>
        )}

        {/* Success / Error */}
        {status === "success" && result && (
          <div
            className="flex items-center justify-between px-3 py-2 text-[11px]"
            style={{
              background: "rgba(0, 220, 130, 0.08)",
              border: "1px solid rgba(0, 220, 130, 0.2)",
              fontFamily: "var(--font-mono)",
              color: "var(--color-success)",
            }}
          >
            <span>Swap confirmed</span>
            {result.explorerUrl && (
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="uppercase tracking-wider underline"
              >
                Explorer →
              </a>
            )}
          </div>
        )}

        {status === "error" && error && (
          <div
            className="flex items-center justify-between px-3 py-2 text-[11px]"
            style={{
              background: "rgba(255, 71, 87, 0.08)",
              border: "1px solid rgba(255, 71, 87, 0.2)",
              fontFamily: "var(--font-mono)",
              color: "var(--color-danger)",
            }}
          >
            <span>{error}</span>
            <button onClick={reset} className="uppercase tracking-wider underline">
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
