"use client";

import React, { useState, useMemo } from "react";
import { useMarketDataContext } from "@/components/providers/MarketDataProvider";
import { formatRate, formatAmount } from "@/lib/utils";
import type { FXPairId } from "@solafx/types";

function getPipSize(quote: string): number {
  return quote === "JPY" ? 0.01 : 0.0001;
}

const PAIRS: FXPairId[] = [
  "EUR/USD", "USD/JPY", "GBP/USD", "USD/CHF",
  "EUR/JPY", "EUR/GBP", "GBP/JPY", "GBP/CHF",
  "EUR/CHF", "USD/BRL", "USD/MXN", "USD/TRY", "USD/ZAR",
];

export function PositionSizeCalc() {
  const { markets } = useMarketDataContext();
  const [pair, setPair] = useState<FXPairId>("EUR/USD");
  const [accountBalance, setAccountBalance] = useState("10000");
  const [riskPercent, setRiskPercent] = useState("1");
  const [stopLossPips, setStopLossPips] = useState("50");

  const marketRow = useMemo(
    () => markets.find((m) => m.market.pair === pair),
    [markets, pair],
  );

  const rate = marketRow?.rate ?? 0;
  const quote = pair.split("/")[1];
  const pipSize = getPipSize(quote);
  const balance = parseFloat(accountBalance) || 0;
  const risk = parseFloat(riskPercent) || 0;
  const slPips = parseFloat(stopLossPips) || 0;

  // Calculate
  const riskAmountUsd = balance * (risk / 100);

  // Pip value per standard lot in quote currency, then convert to USD
  const pipValuePerLot = useMemo(() => {
    const pipValueInQuote = pipSize * 100_000; // standard lot
    if (quote === "USD") return pipValueInQuote;
    const quoteUsdRow = markets.find(
      (m) =>
        (m.market.base === quote && m.market.quote === "USD") ||
        (m.market.base === "USD" && m.market.quote === quote),
    );
    if (!quoteUsdRow || quoteUsdRow.rate <= 0) return null;
    const quoteToUsd =
      quoteUsdRow.market.base === quote
        ? quoteUsdRow.rate
        : 1 / quoteUsdRow.rate;
    return pipValueInQuote * quoteToUsd;
  }, [quote, pipSize, markets]);

  // Position size in lots
  const positionSizeLots =
    pipValuePerLot && slPips > 0 && pipValuePerLot > 0
      ? riskAmountUsd / (slPips * pipValuePerLot)
      : null;

  // Position size in units
  const positionSizeUnits = positionSizeLots !== null ? positionSizeLots * 100_000 : null;

  return (
    <div className="space-y-4">
      <h3
        className="text-[11px] font-medium uppercase tracking-widest"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-muted)",
        }}
      >
        Position Size Calculator
      </h3>

      <div className="space-y-3">
        {/* Pair */}
        <InputField label="Pair">
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value as FXPairId)}
            className="w-full bg-transparent text-sm font-semibold outline-none"
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
        </InputField>

        {/* Account Balance */}
        <InputField label="Account Balance (USD)">
          <input
            type="text"
            inputMode="decimal"
            value={accountBalance}
            onChange={(e) => {
              if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
                setAccountBalance(e.target.value);
              }
            }}
            className="w-full bg-transparent text-sm outline-none tabular-nums"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text)",
            }}
            placeholder="10000"
          />
        </InputField>

        {/* Risk % */}
        <InputField label="Risk per Trade (%)">
          <input
            type="text"
            inputMode="decimal"
            value={riskPercent}
            onChange={(e) => {
              if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
                setRiskPercent(e.target.value);
              }
            }}
            className="w-full bg-transparent text-sm outline-none tabular-nums"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text)",
            }}
            placeholder="1"
          />
        </InputField>

        {/* Stop Loss Pips */}
        <InputField label="Stop Loss (pips)">
          <input
            type="text"
            inputMode="decimal"
            value={stopLossPips}
            onChange={(e) => {
              if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
                setStopLossPips(e.target.value);
              }
            }}
            className="w-full bg-transparent text-sm outline-none tabular-nums"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text)",
            }}
            placeholder="50"
          />
        </InputField>

        {/* Results */}
        <div
          className="space-y-2.5 p-3"
          style={{
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <ResultRow label="Current Rate" value={rate > 0 ? formatRate(rate) : "--"} />
          <ResultRow
            label="Risk Amount"
            value={balance > 0 ? `$${formatAmount(riskAmountUsd, 2)}` : "--"}
          />
          <div
            className="my-1"
            style={{ borderTop: "1px solid var(--color-border)" }}
          />
          <ResultRow
            label="Position Size"
            value={
              positionSizeLots !== null
                ? `${positionSizeLots.toFixed(2)} lots`
                : "--"
            }
            accent
          />
          <ResultRow
            label="Units"
            value={
              positionSizeUnits !== null
                ? formatAmount(positionSizeUnits, 0)
                : "--"
            }
          />
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="p-3"
      style={{
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      <label
        className="mb-1 block text-[10px] uppercase tracking-wider"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </label>
      {children}
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
