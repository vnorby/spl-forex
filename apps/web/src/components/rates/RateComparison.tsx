"use client";

import React from "react";
import type { RateComparison as RateComparisonType } from "@solafx/types";
import { TOKEN_REGISTRY } from "@solafx/sdk";
import { formatRate, formatSpread, spreadColor } from "@/lib/utils";
import { Spinner } from "@solafx/ui";

interface RateComparisonProps {
  comparison: RateComparisonType | undefined;
  loading: boolean;
}

export function RateComparisonPanel({ comparison, loading }: RateComparisonProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Spinner size="sm" />
        <span className="ml-2 text-sm text-[var(--color-text-muted)]">
          Fetching rates...
        </span>
      </div>
    );
  }

  if (!comparison) return null;

  const inputInfo = TOKEN_REGISTRY[comparison.inputToken];
  const outputInfo = TOKEN_REGISTRY[comparison.outputToken];
  if (!inputInfo || !outputInfo) return null;

  const isSameCurrency = inputInfo.currency === outputInfo.currency;

  return (
    <div className="space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-[var(--color-text-muted)]">DEX Rate (Jupiter)</span>
        <span className="font-mono">
          1 {inputInfo.symbol} = {formatRate(comparison.dexRate)} {outputInfo.symbol}
        </span>
      </div>

      {!isSameCurrency && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-muted)]">Oracle Rate (Pyth)</span>
            <span className="font-mono">
              1 {inputInfo.currency} = {formatRate(comparison.oracleRate)} {outputInfo.currency}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-muted)]">Spread</span>
            <span className={`font-mono font-medium ${spreadColor(comparison.spreadPercent)}`}>
              {formatSpread(comparison.spreadPercent)}{" "}
              {comparison.spreadDirection !== "par" && `(${comparison.spreadDirection})`}
            </span>
          </div>

          {comparison.oracleConfidence > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-muted)]">Oracle Confidence</span>
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                +/- {comparison.oracleConfidence.toFixed(6)}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
