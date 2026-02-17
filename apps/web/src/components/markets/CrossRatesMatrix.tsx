"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMarketDataContext } from "@/components/providers/MarketDataProvider";
import { formatRate } from "@/lib/utils";

const CURRENCIES = ["USD", "EUR", "JPY", "GBP", "CHF", "BRL", "MXN", "TRY", "ZAR"] as const;

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "\ud83c\uddfa\ud83c\uddf8",
  EUR: "\ud83c\uddea\ud83c\uddfa",
  JPY: "\ud83c\uddef\ud83c\uddf5",
  GBP: "\ud83c\uddec\ud83c\udde7",
  CHF: "\ud83c\udde8\ud83c\udded",
  BRL: "\ud83c\udde7\ud83c\uddf7",
  MXN: "\ud83c\uddf2\ud83c\uddfd",
  TRY: "\ud83c\uddf9\ud83c\uddf7",
  ZAR: "\ud83c\uddff\ud83c\udde6",
};

/**
 * Build a lookup from "BASE/QUOTE" pair strings to { rate, change }.
 * Also stores inverse rates so we can fill the full matrix.
 */
function buildRateLookup(
  markets: ReturnType<typeof useMarketDataContext>["markets"]
): Record<string, { rate: number; change: number | null }> {
  const lookup: Record<string, { rate: number; change: number | null }> = {};

  for (const row of markets) {
    if (row.rate <= 0) continue;
    const { base, quote } = row.market;
    lookup[`${base}/${quote}`] = { rate: row.rate, change: row.change24h };
    // Store inverse
    lookup[`${quote}/${base}`] = {
      rate: 1 / row.rate,
      change: row.change24h !== null ? -row.change24h : null,
    };
  }
  return lookup;
}

/**
 * Get the cross rate between two currencies.
 * Tries direct lookup first, then crosses through USD.
 */
function getCrossRate(
  base: string,
  quote: string,
  lookup: Record<string, { rate: number; change: number | null }>
): { rate: number; change: number | null } | null {
  if (base === quote) return null;

  // Direct
  const direct = lookup[`${base}/${quote}`];
  if (direct) return direct;

  // Cross through USD
  const baseToUsd = lookup[`${base}/USD`];
  const usdToQuote = lookup[`USD/${quote}`];
  if (baseToUsd && usdToQuote) {
    return {
      rate: baseToUsd.rate * usdToQuote.rate,
      change: null, // Can't reliably combine changes
    };
  }

  return null;
}

interface CrossRatesMatrixProps {
  onPairClick?: (base: string, quote: string) => void;
}

export function CrossRatesMatrix({ onPairClick }: CrossRatesMatrixProps) {
  const router = useRouter();
  const { markets, connected } = useMarketDataContext();
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const lookup = useMemo(() => buildRateLookup(markets), [markets]);

  // Build the matrix data
  const matrix = useMemo(() => {
    return CURRENCIES.map((base) =>
      CURRENCIES.map((quote) => getCrossRate(base, quote, lookup))
    );
  }, [lookup]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
        <div>
          <h1
            className="text-2xl tracking-tight md:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Cross-Rates Matrix
          </h1>
          <p
            className="mt-1 text-xs md:text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Live cross-currency rates — click any cell to view pair details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 w-1.5 rounded-full live-pulse"
            style={{
              background: connected
                ? "var(--color-accent)"
                : "var(--color-down)",
            }}
          />
          <span
            className="text-[11px] uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
            }}
          >
            {connected ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      {/* Matrix */}
      <div
        className="overflow-x-auto border"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <table className="w-full border-collapse" style={{ minWidth: "640px" }}>
          {/* Column headers */}
          <thead>
            <tr>
              <th
                className="sticky left-0 z-10 px-2 py-2 md:px-3 md:py-2.5"
                style={{
                  background: "var(--color-bg-subtle)",
                  borderBottom: "1px solid var(--color-border)",
                  borderRight: "1px solid var(--color-border)",
                  width: "72px",
                }}
              >
                <span
                  className="text-[10px] uppercase tracking-wider"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Base &#8594;
                </span>
              </th>
              {CURRENCIES.map((currency, colIndex) => (
                <th
                  key={currency}
                  className="px-1.5 py-2 text-center md:px-2 md:py-2.5"
                  style={{
                    background:
                      hoveredCell?.col === colIndex
                        ? "var(--color-surface-hover)"
                        : "var(--color-bg-subtle)",
                    borderBottom: "1px solid var(--color-border)",
                    borderRight: "1px solid var(--color-border)",
                    transition: "background 0.15s",
                  }}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm leading-none">
                      {CURRENCY_FLAGS[currency]}
                    </span>
                    <span
                      className="text-[10px] font-semibold tracking-wider"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text)",
                      }}
                    >
                      {currency}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Matrix body */}
          <tbody>
            {CURRENCIES.map((baseCurrency, rowIndex) => (
              <tr key={baseCurrency}>
                {/* Row header */}
                <td
                  className="sticky left-0 z-10 px-2 py-1.5 md:px-3 md:py-2"
                  style={{
                    background:
                      hoveredCell?.row === rowIndex
                        ? "var(--color-surface-hover)"
                        : "var(--color-bg-subtle)",
                    borderBottom: "1px solid var(--color-border)",
                    borderRight: "1px solid var(--color-border)",
                    transition: "background 0.15s",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm leading-none">
                      {CURRENCY_FLAGS[baseCurrency]}
                    </span>
                    <span
                      className="text-[10px] font-semibold tracking-wider"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text)",
                      }}
                    >
                      {baseCurrency}
                    </span>
                  </div>
                </td>

                {/* Rate cells */}
                {CURRENCIES.map((quoteCurrency, colIndex) => {
                  const cell = matrix[rowIndex][colIndex];
                  const isDiagonal = rowIndex === colIndex;
                  const isHovered =
                    hoveredCell?.row === rowIndex ||
                    hoveredCell?.col === colIndex;

                  return (
                    <td
                      key={quoteCurrency}
                      className="px-1.5 py-1.5 text-center md:px-2 md:py-2"
                      style={{
                        borderBottom: "1px solid var(--color-border)",
                        borderRight: "1px solid var(--color-border)",
                        background: isDiagonal
                          ? "var(--color-bg)"
                          : isHovered
                            ? "var(--color-surface-hover)"
                            : "transparent",
                        cursor: isDiagonal ? "default" : "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={() =>
                        !isDiagonal &&
                        setHoveredCell({ row: rowIndex, col: colIndex })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      onClick={() =>
                        !isDiagonal &&
                        (onPairClick
                          ? onPairClick(baseCurrency, quoteCurrency)
                          : router.push("/"))
                      }
                    >
                      {isDiagonal ? (
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          &mdash;
                        </span>
                      ) : cell ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <span
                            className="text-[11px] tabular-nums"
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontWeight: 500,
                              color: "var(--color-text)",
                            }}
                          >
                            {formatRate(cell.rate)}
                          </span>
                          {cell.change !== null && (
                            <span
                              className="text-[9px] tabular-nums"
                              style={{
                                fontFamily: "var(--font-mono)",
                                color:
                                  cell.change > 0
                                    ? "var(--color-up)"
                                    : cell.change < 0
                                      ? "var(--color-down)"
                                      : "var(--color-text-muted)",
                              }}
                            >
                              {cell.change > 0 ? "+" : ""}
                              {cell.change.toFixed(3)}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          --
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        className="flex flex-col gap-1 text-[10px] md:flex-row md:items-center md:justify-between md:text-[11px]"
        style={{
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>Read as: 1 [Row] = X [Column]</span>
        <span>Rates via Pyth Network oracle</span>
      </div>
    </div>
  );
}
