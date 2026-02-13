"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useMarketDataContext } from "@/components/providers/MarketDataProvider";
import { formatRate } from "@/lib/utils";

const CURRENCIES = ["USD", "EUR", "JPY", "GBP", "CHF", "BRL", "MXN", "TRY", "ZAR"] as const;

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "\u20ac",
  JPY: "\u00a5",
  GBP: "\u00a3",
  CHF: "CHF",
  BRL: "R$",
  MXN: "MX$",
  TRY: "\u20ba",
  ZAR: "R",
};

export function CurrencyConverter() {
  const { markets } = useMarketDataContext();
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [fromAmount, setFromAmount] = useState("1000");
  const [editingSide, setEditingSide] = useState<"from" | "to">("from");

  // Build rate lookup
  const rateLookup = useMemo(() => {
    const lookup: Record<string, number> = {};
    for (const row of markets) {
      if (row.rate <= 0) continue;
      lookup[`${row.market.base}/${row.market.quote}`] = row.rate;
      lookup[`${row.market.quote}/${row.market.base}`] = 1 / row.rate;
    }
    return lookup;
  }, [markets]);

  // Get conversion rate
  const rate = useMemo(() => {
    if (fromCurrency === toCurrency) return 1;
    // Direct
    const direct = rateLookup[`${fromCurrency}/${toCurrency}`];
    if (direct) return direct;
    // Via USD
    const fromToUsd = rateLookup[`${fromCurrency}/USD`];
    const usdToTo = rateLookup[`USD/${toCurrency}`];
    if (fromToUsd && usdToTo) return fromToUsd * usdToTo;
    return null;
  }, [fromCurrency, toCurrency, rateLookup]);

  const fromNum = parseFloat(fromAmount) || 0;
  const toAmount = rate !== null ? (fromNum * rate).toFixed(2) : "--";

  function handleFlip() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  return (
    <div className="space-y-4">
      <h3
        className="text-[11px] font-medium uppercase tracking-widest"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-muted)",
        }}
      >
        Currency Converter
      </h3>

      <div className="space-y-3">
        {/* From */}
        <div
          className="flex items-center gap-2 p-3"
          style={{
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-20 bg-transparent text-xs font-semibold uppercase tracking-wider outline-none"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text)",
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c} style={{ background: "var(--color-bg)" }}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            inputMode="decimal"
            value={fromAmount}
            onChange={(e) => {
              if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
                setFromAmount(e.target.value);
              }
            }}
            className="flex-1 bg-transparent text-right text-lg outline-none tabular-nums"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text)",
            }}
            placeholder="0.00"
          />
        </div>

        {/* Flip button + rate display */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={handleFlip}
            className="flex h-7 w-7 items-center justify-center transition-colors"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text-muted)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M7 1L3 5M7 13l4-4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          {rate !== null && (
            <span
              className="text-[11px] tabular-nums"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-secondary)",
              }}
            >
              1 {fromCurrency} = {formatRate(rate)} {toCurrency}
            </span>
          )}
        </div>

        {/* To */}
        <div
          className="flex items-center gap-2 p-3"
          style={{
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-20 bg-transparent text-xs font-semibold uppercase tracking-wider outline-none"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text)",
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c} style={{ background: "var(--color-bg)" }}>
                {c}
              </option>
            ))}
          </select>
          <div
            className="flex-1 text-right text-lg tabular-nums"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-accent)",
            }}
          >
            {toAmount}
          </div>
        </div>

        {/* Rate source */}
        <div
          className="text-center text-[10px] uppercase tracking-wider"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-muted)",
          }}
        >
          Pyth Network Oracle Rate
        </div>
      </div>
    </div>
  );
}
