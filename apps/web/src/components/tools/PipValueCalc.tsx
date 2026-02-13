"use client";

import React, { useState, useMemo } from "react";
import { useMarketDataContext } from "@/components/providers/MarketDataProvider";
import { formatRate } from "@/lib/utils";
import type { FXPairId } from "@solafx/types";

/**
 * Pip = smallest price increment for an FX pair.
 * For JPY pairs: 0.01 (2nd decimal)
 * For all others: 0.0001 (4th decimal)
 */
function getPipSize(quote: string): number {
  return quote === "JPY" ? 0.01 : 0.0001;
}

/**
 * Pip value = (pip size / rate) * lot size
 * For pairs where quote = account currency, pip value = pip size * lot size
 */
function calculatePipValue(
  rate: number,
  quote: string,
  accountCurrency: string,
  lotSize: number,
  accountCurrencyRate: number, // rate of quote/accountCurrency
): number {
  const pipSize = getPipSize(quote);
  // Base pip value in quote currency
  const pipValueInQuote = pipSize * lotSize;
  // Convert to account currency
  return pipValueInQuote * accountCurrencyRate;
}

const PAIRS: FXPairId[] = [
  "EUR/USD", "USD/JPY", "GBP/USD", "USD/CHF",
  "EUR/JPY", "EUR/GBP", "GBP/JPY", "GBP/CHF",
  "EUR/CHF", "USD/BRL", "USD/MXN", "USD/TRY", "USD/ZAR",
];

const LOT_SIZES = [
  { label: "Standard (100K)", value: 100_000 },
  { label: "Mini (10K)", value: 10_000 },
  { label: "Micro (1K)", value: 1_000 },
];

export function PipValueCalc() {
  const { markets } = useMarketDataContext();
  const [pair, setPair] = useState<FXPairId>("EUR/USD");
  const [lotIndex, setLotIndex] = useState(0);

  const lotSize = LOT_SIZES[lotIndex].value;

  // Get current rate for the pair
  const marketRow = useMemo(
    () => markets.find((m) => m.market.pair === pair),
    [markets, pair],
  );

  const rate = marketRow?.rate ?? 0;
  const base = pair.split("/")[0];
  const quote = pair.split("/")[1];
  const pipSize = getPipSize(quote);

  // Pip value in quote currency
  const pipValueInQuote = pipSize * lotSize;

  // Convert to USD (common account currency)
  const pipValueInUsd = useMemo(() => {
    if (quote === "USD") return pipValueInQuote;
    // Need quote/USD rate
    const quoteUsdRow = markets.find(
      (m) =>
        (m.market.base === quote && m.market.quote === "USD") ||
        (m.market.base === "USD" && m.market.quote === quote),
    );
    if (!quoteUsdRow) return null;
    const quoteToUsd =
      quoteUsdRow.market.base === quote
        ? quoteUsdRow.rate
        : 1 / quoteUsdRow.rate;
    return pipValueInQuote * quoteToUsd;
  }, [quote, pipValueInQuote, markets]);

  return (
    <div className="space-y-4">
      <h3
        className="text-[11px] font-medium uppercase tracking-widest"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-muted)",
        }}
      >
        Pip Value Calculator
      </h3>

      <div className="space-y-3">
        {/* Pair selector */}
        <div
          className="p-3"
          style={{
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <label
            className="text-[10px] uppercase tracking-wider"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
            }}
          >
            Pair
          </label>
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value as FXPairId)}
            className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text)",
            }}
          >
            {PAIRS.map((p) => (
              <option key={p} value={p} style={{ background: "var(--color-bg)" }}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Lot size selector */}
        <div className="flex gap-2">
          {LOT_SIZES.map((lot, i) => (
            <button
              key={lot.value}
              onClick={() => setLotIndex(i)}
              className="flex-1 px-2 py-2 text-[10px] uppercase tracking-wider transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                color:
                  i === lotIndex
                    ? "var(--color-accent)"
                    : "var(--color-text-muted)",
                background:
                  i === lotIndex
                    ? "var(--color-accent-dim)"
                    : "var(--color-surface)",
                border:
                  i === lotIndex
                    ? "1px solid rgba(0, 229, 200, 0.2)"
                    : "1px solid var(--color-border)",
              }}
            >
              {lot.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div
          className="space-y-2.5 p-3"
          style={{
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <ResultRow label="Current Rate" value={rate > 0 ? formatRate(rate) : "--"} />
          <ResultRow label="Pip Size" value={pipSize.toString()} />
          <ResultRow
            label={`Pip Value (${quote})`}
            value={rate > 0 ? pipValueInQuote.toFixed(2) : "--"}
          />
          <div
            className="my-1"
            style={{ borderTop: "1px solid var(--color-border)" }}
          />
          <ResultRow
            label="Pip Value (USD)"
            value={pipValueInUsd !== null && rate > 0 ? `$${pipValueInUsd.toFixed(2)}` : "--"}
            accent
          />
        </div>
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="text-[11px] uppercase tracking-wider"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </span>
      <span
        className="text-[12px] font-medium tabular-nums"
        style={{
          fontFamily: "var(--font-mono)",
          color: accent ? "var(--color-accent)" : "var(--color-text)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
