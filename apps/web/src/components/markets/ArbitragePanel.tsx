"use client";

import React, { useMemo, useState, useCallback } from "react";
import { TOKEN_REGISTRY } from "@solafx/sdk";
import { useArbitrageData } from "@/hooks/useArbitrageData";
import { formatRate } from "@/lib/utils";
import type { ArbitrageOpportunity } from "@solafx/types";
import { InlineSwap } from "@/components/swap/InlineSwap";

interface ArbitragePanelProps {
  onSwapClick?: (inputToken: string, outputToken: string) => void;
}

type SortKey = "spread" | "pair" | "dexRate";
type CurrencyFilter = "all" | string;

export function ArbitragePanel({ onSwapClick }: ArbitragePanelProps) {
  const { opportunities, isLoading } = useArbitrageData();
  const [sortKey, setSortKey] = useState<SortKey>("spread");
  const [sortAsc, setSortAsc] = useState(false);
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>("all");
  // Inline swap: track which pair is expanded (null = none)
  const [swapPair, setSwapPair] = useState<{ input: string; output: string } | null>(null);

  const handleInlineSwap = useCallback(
    (inputToken: string, outputToken: string) => {
      // Toggle: clicking same pair closes it, clicking different opens new
      if (swapPair?.input === inputToken && swapPair?.output === outputToken) {
        setSwapPair(null);
      } else {
        setSwapPair({ input: inputToken, output: outputToken });
      }
    },
    [swapPair],
  );

  // Filter: only peg arb pairs with liquidity and plausible spreads
  const MAX_PLAUSIBLE_SPREAD = 50;

  // Deduplicate: group by unordered pair, show best direction
  const deduped = useMemo(() => {
    const pairMap = new Map<string, ArbitrageOpportunity>();

    for (const opp of opportunities) {
      if (!opp.hasLiquidity) continue;
      if (Math.abs(opp.spreadPercent) > MAX_PLAUSIBLE_SPREAD) continue;
      if (!opp.isPegArb) continue;

      // Create canonical key (alphabetical order)
      const key = [opp.inputToken, opp.outputToken].sort().join(":");
      const existing = pairMap.get(key);

      // Keep the direction with the larger absolute spread (more interesting)
      if (!existing || Math.abs(opp.spreadPercent) > Math.abs(existing.spreadPercent)) {
        pairMap.set(key, opp);
      }
    }

    return Array.from(pairMap.values());
  }, [opportunities]);

  // Available currencies for filter
  const availableCurrencies = useMemo(() => {
    const currencies = new Set<string>();
    for (const opp of deduped) {
      // Since these are peg arb, both tokens have the same currency
      // We can infer from the pair — just need to look up from registry
      currencies.add(getPegCurrency(opp));
    }
    return Array.from(currencies).sort();
  }, [deduped]);

  // Apply currency filter
  const filtered = useMemo(() => {
    if (currencyFilter === "all") return deduped;
    return deduped.filter((opp) => getPegCurrency(opp) === currencyFilter);
  }, [deduped, currencyFilter]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "spread":
          cmp = Math.abs(b.spreadPercent) - Math.abs(a.spreadPercent);
          break;
        case "pair":
          cmp = `${a.inputToken}${a.outputToken}`.localeCompare(
            `${b.inputToken}${b.outputToken}`
          );
          break;
        case "dexRate":
          cmp = b.dexRate - a.dexRate;
          break;
      }
      return sortAsc ? -cmp : cmp;
    });
    return arr;
  }, [filtered, sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header — stacks on mobile */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <h2
            className="text-[11px] font-medium uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
            }}
          >
            Peg Arbitrage Scanner
          </h2>
          <div
            className="h-1.5 w-1.5 rounded-full live-pulse"
            style={{ background: "var(--color-accent)" }}
          />
          <span
            className="hidden text-[10px] uppercase tracking-wider md:inline"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
            }}
          >
            Ref: $1,000
          </span>
        </div>

        {/* Currency filter chips */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setCurrencyFilter("all")}
            className="px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              color:
                currencyFilter === "all"
                  ? "var(--color-accent)"
                  : "var(--color-text-muted)",
              background:
                currencyFilter === "all"
                  ? "var(--color-accent-dim)"
                  : "transparent",
              border:
                currencyFilter === "all"
                  ? "1px solid rgba(0, 229, 200, 0.2)"
                  : "1px solid transparent",
            }}
          >
            All
          </button>
          {availableCurrencies.map((currency) => (
            <button
              key={currency}
              onClick={() => setCurrencyFilter(currency)}
              className="px-2 py-0.5 text-[10px] uppercase tracking-wider transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                color:
                  currencyFilter === currency
                    ? "var(--color-accent)"
                    : "var(--color-text-muted)",
                background:
                  currencyFilter === currency
                    ? "var(--color-accent-dim)"
                    : "transparent",
                border:
                  currencyFilter === currency
                    ? "1px solid rgba(0, 229, 200, 0.2)"
                    : "1px solid transparent",
              }}
            >
              {currency}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading && sorted.length === 0 ? (
        <div
          className="py-8 text-center text-[11px] uppercase tracking-wider"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-muted)",
          }}
        >
          Loading arbitrage data...
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="py-8 text-center text-[11px] uppercase tracking-wider"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-muted)",
          }}
        >
          No peg arbitrage opportunities found
        </div>
      ) : (
        <div
          className="border overflow-hidden"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          {/* Column headers — hidden on mobile */}
          <div
            className="hidden md:grid items-center gap-x-2 px-4 py-2.5"
            style={{
              gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 1fr 80px",
              background: "var(--color-bg-subtle)",
            }}
          >
            <SortHeader
              label="Pair"
              sortKey="pair"
              currentSort={sortKey}
              sortAsc={sortAsc}
              onClick={handleSort}
            />
            <SortHeader
              label="DEX Rate"
              sortKey="dexRate"
              currentSort={sortKey}
              sortAsc={sortAsc}
              onClick={handleSort}
              align="right"
            />
            <span
              className="text-right text-[10px] font-medium uppercase tracking-wider"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              Oracle
            </span>
            <SortHeader
              label="Spread"
              sortKey="spread"
              currentSort={sortKey}
              sortAsc={sortAsc}
              onClick={handleSort}
              align="right"
            />
            <span
              className="text-right text-[10px] font-medium uppercase tracking-wider"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              Direction
            </span>
            <span />
          </div>

          {/* Rows */}
          {sorted.map((opp) => (
            <React.Fragment key={`${opp.inputToken}-${opp.outputToken}`}>
              <ArbitrageRow
                opportunity={opp}
                onSwapClick={handleInlineSwap}
                isSwapOpen={
                  swapPair?.input === opp.inputToken &&
                  swapPair?.output === opp.outputToken
                }
              />
              {swapPair?.input === opp.inputToken &&
                swapPair?.output === opp.outputToken && (
                  <div
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      background: "var(--color-bg-subtle)",
                    }}
                  >
                    <InlineSwap
                      inputToken={opp.inputToken}
                      outputToken={opp.outputToken}
                      onClose={() => setSwapPair(null)}
                    />
                  </div>
                )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Summary */}
      {sorted.length > 0 && (
        <div
          className="flex items-center justify-between px-1 text-[10px] uppercase tracking-wider"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-muted)",
          }}
        >
          <span>
            {sorted.length} pair{sorted.length !== 1 ? "s" : ""} ·{" "}
            {sorted.filter((o) => o.favorable).length} favorable
          </span>
          <span>
            Polling every 60s
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Helper: infer currency from peg pair ──────────────────────────── */

function getPegCurrency(opp: ArbitrageOpportunity): string {
  return TOKEN_REGISTRY[opp.inputToken]?.currency ?? "OTHER";
}

/* ─── Sort Header ───────────────────────────────────────────────────── */

function SortHeader({
  label,
  sortKey,
  currentSort,
  sortAsc,
  onClick,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  sortAsc: boolean;
  onClick: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const isActive = currentSort === sortKey;
  return (
    <button
      onClick={() => onClick(sortKey)}
      className={`text-[10px] font-medium uppercase tracking-wider transition-colors ${
        align === "right" ? "text-right" : "text-left"
      }`}
      style={{
        fontFamily: "var(--font-mono)",
        color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {label}
      {isActive && (
        <span style={{ marginLeft: "2px" }}>{sortAsc ? "↑" : "↓"}</span>
      )}
    </button>
  );
}

/* ─── Row Component ─────────────────────────────────────────────────── */

function ArbitrageRow({
  opportunity,
  onSwapClick,
  isSwapOpen,
}: {
  opportunity: ArbitrageOpportunity;
  onSwapClick?: (inputToken: string, outputToken: string) => void;
  isSwapOpen?: boolean;
}) {
  const opp = opportunity;
  const spreadAbs = Math.abs(opp.spreadPercent);

  // Color: green if favorable (premium), red if discount, muted if par
  const spreadColor =
    spreadAbs < 0.05
      ? "var(--color-text-muted)"
      : opp.favorable
        ? "var(--color-up)"
        : "var(--color-down)";

  const directionLabel =
    spreadAbs < 0.005
      ? "PAR"
      : opp.spreadDirection === "premium"
        ? "Premium"
        : "Discount";

  const directionColor =
    spreadAbs < 0.005
      ? "var(--color-text-muted)"
      : opp.spreadDirection === "premium"
        ? "var(--color-up)"
        : "var(--color-down)";

  return (
    <div
      style={{
        borderTop: "1px solid var(--color-border)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {/* Desktop: 6-column grid */}
      <div
        className="hidden md:grid items-center gap-x-2 px-4 py-2.5"
        style={{ gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 1fr 80px" }}
      >
        {/* Pair */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>{opp.inputToken}</span>
          <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>→</span>
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{opp.outputToken}</span>
        </div>

        {/* DEX Rate */}
        <span className="text-right text-[11px] tabular-nums" style={{ color: "var(--color-text)" }}>{formatRate(opp.dexRate)}</span>

        {/* Oracle Rate */}
        <span className="text-right text-[11px] tabular-nums" style={{ color: "var(--color-text-secondary)" }}>{formatRate(opp.oracleRate)}</span>

        {/* Spread */}
        <span className="text-right text-[11px] font-medium tabular-nums" style={{ color: spreadColor }}>
          {spreadAbs < 0.005 ? "PAR" : `${opp.spreadPercent > 0 ? "+" : ""}${opp.spreadPercent.toFixed(3)}%`}
        </span>

        {/* Direction */}
        <span className="text-right text-[10px] uppercase tracking-wider" style={{ color: directionColor }}>{directionLabel}</span>

        {/* Swap button */}
        <div className="flex justify-end">
          <button
            onClick={() => onSwapClick?.(opp.inputToken, opp.outputToken)}
            className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              color: isSwapOpen ? "var(--color-text)" : "var(--color-accent)",
              background: isSwapOpen ? "var(--color-surface-hover)" : "var(--color-accent-dim)",
              border: isSwapOpen ? "1px solid var(--color-border-bright)" : "1px solid rgba(0, 229, 200, 0.15)",
            }}
          >
            {isSwapOpen ? "Close" : "Swap"}
          </button>
        </div>
      </div>

      {/* Mobile: stacked card */}
      <div className="flex flex-col gap-2 px-3 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>{opp.inputToken}</span>
            <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>→</span>
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{opp.outputToken}</span>
          </div>
          <span className="text-[11px] font-medium tabular-nums" style={{ color: spreadColor }}>
            {spreadAbs < 0.005 ? "PAR" : `${opp.spreadPercent > 0 ? "+" : ""}${opp.spreadPercent.toFixed(3)}%`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] tabular-nums">
            <span style={{ color: "var(--color-text-muted)" }}>DEX: <span style={{ color: "var(--color-text)" }}>{formatRate(opp.dexRate)}</span></span>
            <span style={{ color: directionColor }} className="uppercase tracking-wider">{directionLabel}</span>
          </div>
          <button
            onClick={() => onSwapClick?.(opp.inputToken, opp.outputToken)}
            className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              color: isSwapOpen ? "var(--color-text)" : "var(--color-accent)",
              background: isSwapOpen ? "var(--color-surface-hover)" : "var(--color-accent-dim)",
              border: isSwapOpen ? "1px solid var(--color-border-bright)" : "1px solid rgba(0, 229, 200, 0.15)",
            }}
          >
            {isSwapOpen ? "Close" : "Swap"}
          </button>
        </div>
      </div>
    </div>
  );
}
