"use client";

import React, { useState, useCallback } from "react";
import type { MarketRow as MarketRowType, RateComparison } from "@solafx/types";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useMarketDataContext } from "@/components/providers/MarketDataProvider";
import { SparklineChart } from "./SparklineChart";
import { CandlestickChart } from "./CandlestickChart";
import { DepthChart } from "./DepthChart";
import { Button } from "@solafx/ui";
import { useJupiterQuote } from "@/hooks/useJupiterQuote";
import { useSwapExecution } from "@/hooks/useSwapExecution";
import { SwapConfirmModal } from "@/components/swap/SwapConfirmModal";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { formatRate, formatAmount, formatSpread, formatVolume, spreadColor } from "@/lib/utils";
import { rateEngine } from "@/lib/sdk";

interface PairDetailProps {
  row: MarketRowType;
  onClose: () => void;
}

export function PairDetail({ row, onClose }: PairDetailProps) {
  const { priceHistory } = useMarketDataContext();
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { status, result, error, execute, reset } = useSwapExecution();
  const { balances } = useTokenBalances();

  const history = priceHistory[row.market.pair] ?? [];
  const mapping = row.market.solanaMapping;

  const [flipped, setFlipped] = useState(false);
  const inputToken = flipped ? (mapping?.outputToken ?? "") : (mapping?.inputToken ?? "");
  const outputToken = flipped ? (mapping?.inputToken ?? "") : (mapping?.outputToken ?? "");
  const inputBalance = balances[inputToken] ?? 0;

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
    setFlipped((f) => !f);
    setAmount("");
    reset();
  }, [reset]);

  const handleSwapClick = useCallback(async () => {
    if (!publicKey || !mapping) {
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
      setExecComparison(comp);
      setConfirmOpen(true);
    } catch {
      // Error fetching executable quote
    }
  }, [publicKey, mapping, inputToken, outputToken, numAmount, setVisible]);

  const handleConfirm = useCallback(async () => {
    if (!execComparison) return;
    await execute(execComparison);
    setConfirmOpen(false);
  }, [execComparison, execute]);

  const changeColor =
    row.change24h === null
      ? "var(--color-text-muted)"
      : row.change24h > 0
        ? "var(--color-up)"
        : row.change24h < 0
          ? "var(--color-down)"
          : "var(--color-text-muted)";

  return (
    <div
      className="px-3 py-4 md:px-6 md:py-5"
      style={{
        background: "var(--color-bg)",
        borderLeft: "2px solid var(--color-accent)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {/* Close button */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {row.market.pair}
          </h2>
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-border)",
              padding: "2px 8px",
            }}
          >
            {row.market.category}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-xs uppercase tracking-wider transition-colors"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Rate info + chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatRate(row.rate)}
              </span>
              {row.change24h !== null && (
                <span
                  className="text-sm tabular-nums"
                  style={{ fontFamily: "var(--font-mono)", color: changeColor }}
                >
                  {row.change24h > 0 ? "+" : ""}
                  {row.change24h.toFixed(3)}%
                </span>
              )}
            </div>
            <span
              className="text-[10px] uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-accent)",
                border: "1px solid rgba(0, 229, 200, 0.2)",
                background: "var(--color-accent-dim)",
                padding: "3px 10px",
              }}
            >
              Pyth Oracle
            </span>
          </div>

          {/* Candlestick chart */}
          <CandlestickChart pair={row.market.pair} height={220} />

          {/* Oracle details grid */}
          <div className="grid grid-cols-3 gap-3">
            <div
              className="p-3"
              style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
            >
              <div
                className="text-[10px] uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
              >
                Oracle Confidence
              </div>
              <div
                className="mt-1 tabular-nums"
                style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
              >
                +/- {row.confidence.toFixed(6)}
              </div>
              {/* Confidence quality bar */}
              {row.rate > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 flex-1"
                      style={{ background: "var(--color-bg-subtle)", overflow: "hidden" }}
                    >
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${Math.max(5, Math.min(100, 100 - (row.confidence / row.rate) * 100_000))}%`,
                          background:
                            row.confidence / row.rate < 0.0001
                              ? "var(--color-up)"
                              : row.confidence / row.rate < 0.001
                                ? "var(--color-warm)"
                                : "var(--color-down)",
                        }}
                      />
                    </div>
                    <span
                      className="text-[9px] uppercase tracking-wider"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color:
                          row.confidence / row.rate < 0.0001
                            ? "var(--color-up)"
                            : row.confidence / row.rate < 0.001
                              ? "var(--color-warm)"
                              : "var(--color-down)",
                      }}
                    >
                      {row.confidence / row.rate < 0.0001
                        ? "Tight"
                        : row.confidence / row.rate < 0.001
                          ? "Normal"
                          : "Wide"}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div
              className="p-3"
              style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
            >
              <div
                className="text-[10px] uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
              >
                Global Volume
              </div>
              <div
                className="mt-1 tabular-nums"
                style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
              >
                {formatVolume(row.market.globalVolume24h)}
              </div>
            </div>
            <div
              className="p-3"
              style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
            >
              <div
                className="text-[10px] uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
              >
                Category
              </div>
              <div className="mt-1 capitalize" style={{ fontSize: "13px" }}>
                {row.market.category}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Swap panel or view-only */}
        <div className="space-y-4">
          {mapping ? (
            <>
              <div
                className="flex items-center justify-between p-3"
                style={{
                  border: "1px solid rgba(0, 229, 200, 0.2)",
                  background: "var(--color-accent-dim)",
                }}
              >
                <div>
                  <div
                    className="text-[10px] font-medium uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}
                  >
                    Tradeable on Solana
                  </div>
                  <div className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {inputToken} → {outputToken} via Jupiter
                  </div>
                </div>
                <button
                  onClick={handleFlip}
                  className="flex h-9 w-9 items-center justify-center border transition-all active:scale-95"
                  style={{
                    borderColor: "var(--color-accent)",
                    background: "var(--color-bg-subtle)",
                    color: "var(--color-accent)",
                  }}
                  title="Flip direction"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M2.24 6.8a.75.75 0 001.06-.04l1.95-2.1v8.59a.75.75 0 001.5 0V4.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L2.2 5.74a.75.75 0 00.04 1.06zm8.6 3.44a.75.75 0 10-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V4.25a.75.75 0 00-1.5 0v8.59l-1.95-2.1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Swap form */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      className="text-[10px] uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
                    >
                      Amount ({inputToken})
                    </label>
                    {publicKey && (
                      <div
                        className="flex items-center gap-2 text-[10px] uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
                      >
                        <span>Bal: {formatAmount(inputBalance, 2)} {inputToken}</span>
                        {inputBalance > 0 && (
                          <button
                            onClick={() => setAmount(String(inputBalance))}
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
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
                        setAmount(e.target.value);
                      }
                    }}
                    className="mt-1 w-full px-3 py-2.5 text-lg outline-none"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  />
                </div>

                {comparison && (
                  <div
                    className="space-y-2.5 p-3 text-sm"
                    style={{
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                    }}
                  >
                    <div className="flex justify-between">
                      <span
                        className="text-[11px] uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
                      >
                        You receive
                      </span>
                      <span
                        className="font-semibold tabular-nums"
                        style={{ fontFamily: "var(--font-mono)", color: "var(--color-up)" }}
                      >
                        {formatAmount(comparison.outputAmount, 4)} {outputToken}
                      </span>
                    </div>
                    <div
                      className="my-1"
                      style={{ borderTop: "1px solid var(--color-border)" }}
                    />
                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>
                        DEX Rate
                      </span>
                      <span
                        className="tabular-nums"
                        style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}
                      >
                        {formatRate(comparison.dexRate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>
                        Oracle Rate
                      </span>
                      <span
                        className="tabular-nums"
                        style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}
                      >
                        {formatRate(comparison.oracleRate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>
                        Spread
                      </span>
                      <span
                        className={`font-medium tabular-nums ${spreadColor(comparison.spreadPercent)}`}
                        style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}
                      >
                        {formatSpread(comparison.spreadPercent)}
                      </span>
                    </div>
                  </div>
                )}

                {isLoading && numAmount > 0 && (
                  <div
                    className="py-3 text-center text-[11px] uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
                  >
                    Fetching quote...
                  </div>
                )}

                {!publicKey ? (
                  <Button variant="primary" className="w-full" onClick={() => setVisible(true)}>
                    Connect Wallet to Swap
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    disabled={numAmount <= 0 || isLoading}
                    onClick={handleSwapClick}
                  >
                    Swap {inputToken} → {outputToken}
                  </Button>
                )}

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
                      onClick={handleFlip}
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
                    className="p-3 text-sm"
                    style={{
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      background: "rgba(239, 68, 68, 0.05)",
                      color: "var(--color-down)",
                    }}
                  >
                    {error}
                    <button onClick={reset} className="ml-2 underline">
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              className="p-6 text-center"
              style={{
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              <div className="text-2xl opacity-20">&#x1f512;</div>
              <h3
                className="mt-3 text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Not yet tradeable on Solana
              </h3>
              <p
                className="mt-2 text-xs leading-relaxed"
                style={{ color: "var(--color-text-muted)" }}
              >
                No {row.market.base} or {row.market.quote} stablecoins with sufficient liquidity
                exist on Solana yet. This pair is view-only.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Depth chart for tradeable pairs */}
      {mapping && (
        <div className="mt-6">
          <DepthChart inputToken={mapping.inputToken} outputToken={mapping.outputToken} />
        </div>
      )}

      <SwapConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        comparison={execComparison}
        status={status}
      />
    </div>
  );
}
