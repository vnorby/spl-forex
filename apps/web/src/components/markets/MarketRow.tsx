"use client";

import React, { useRef, useEffect } from "react";
import type { MarketRow as MarketRowType, PricePoint } from "@solafx/types";
import { SparklineChart } from "./SparklineChart";
import { formatRate, formatVolume } from "@/lib/utils";

interface MarketRowProps {
  row: MarketRowType;
  index: number;
  selected: boolean;
  onClick: () => void;
  isWatched?: boolean;
  onToggleWatch?: () => void;
  history?: PricePoint[];
}

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "\ud83c\uddfa\ud83c\uddf8",
  EUR: "\ud83c\uddea\ud83c\uddfa",
  JPY: "\ud83c\uddef\ud83c\uddf5",
  GBP: "\ud83c\uddec\ud83c\udde7",
  CHF: "\ud83c\udde8\ud83c\udded",
  AUD: "\ud83c\udde6\ud83c\uddfa",
  CAD: "\ud83c\udde8\ud83c\udde6",
  NZD: "\ud83c\uddf3\ud83c\uddff",
  BRL: "\ud83c\udde7\ud83c\uddf7",
  SGD: "\ud83c\uddf8\ud83c\uddec",
  MXN: "\ud83c\uddf2\ud83c\uddfd",
  TRY: "\ud83c\uddf9\ud83c\uddf7",
  ZAR: "\ud83c\uddff\ud83c\udde6",
  HKD: "\ud83c\udded\ud83c\uddf0",
  NOK: "\ud83c\uddf3\ud83c\uddf4",
  SEK: "\ud83c\uddf8\ud83c\uddea",
};

function MarketRowInner({ row, index, selected, onClick, isWatched, onToggleWatch, history = [] }: MarketRowProps) {
  const rateRef = useRef<HTMLDivElement>(null);
  const prevRateRef = useRef(row.rate);

  // Flash animation when rate changes
  useEffect(() => {
    if (row.rate !== prevRateRef.current && rateRef.current && prevRateRef.current > 0) {
      const direction = row.rate > prevRateRef.current ? "tick-up" : "tick-down";
      rateRef.current.classList.remove("tick-up", "tick-down");
      void rateRef.current.offsetWidth;
      rateRef.current.classList.add(direction);
    }
    prevRateRef.current = row.rate;
  }, [row.rate]);

  const changeColor =
    row.change24h === null
      ? "var(--color-text-muted)"
      : row.change24h > 0
        ? "var(--color-up)"
        : row.change24h < 0
          ? "var(--color-down)"
          : "var(--color-text-muted)";

  return (
    <button
      onClick={onClick}
      className="row-enter w-full text-left text-sm transition-all duration-150"
      style={{
        animationDelay: `${index * 40}ms`,
        background: selected ? "var(--color-surface-hover)" : "transparent",
        borderLeft: selected ? "2px solid var(--color-accent)" : "2px solid transparent",
        borderBottom: "1px solid var(--color-border)",
      }}
      onMouseEnter={(e) => {
        if (!selected) (e.currentTarget.style.background = "var(--color-surface-hover)");
      }}
      onMouseLeave={(e) => {
        if (!selected) (e.currentTarget.style.background = "transparent");
      }}
    >
      {/* Desktop: 8-column grid */}
      <div className="hidden md:grid grid-cols-[24px_1.3fr_100px_70px_90px_50px_110px_100px] items-center gap-x-2 px-5 py-3.5">
        {/* Star */}
        <div
          className="flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); onToggleWatch?.(); }}
          style={{ cursor: "pointer" }}
        >
          <span className="text-xs transition-colors" style={{ color: isWatched ? "var(--color-warm)" : "var(--color-text-muted)", opacity: isWatched ? 1 : 0.3 }}>
            {isWatched ? "\u2605" : "\u2606"}
          </span>
        </div>

        {/* Pair */}
        <div className="flex items-center gap-3">
          <span className="text-lg leading-none">{CURRENCY_FLAGS[row.market.base] ?? ""}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>{row.market.base}</span>
            <span style={{ color: "var(--color-text-muted)" }}>/</span>
            <span style={{ color: "var(--color-text-secondary)" }}>{row.market.quote}</span>
            <span className="ml-2 text-[10px] uppercase tracking-wider" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>{row.market.category}</span>
          </div>
        </div>

        {/* Rate */}
        <div ref={rateRef} className="flex items-center justify-end rounded px-1.5 py-0.5 tabular-nums" style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "13px" }}>
          {row.rate > 0 ? formatRate(row.rate) : "--"}
        </div>

        {/* 24h Change */}
        <div className="flex items-center justify-end tabular-nums" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: changeColor }}>
          {row.change24h !== null ? <span>{row.change24h > 0 ? "+" : ""}{row.change24h.toFixed(3)}%</span> : <span style={{ color: "var(--color-text-muted)" }}>--</span>}
        </div>

        {/* Global Volume */}
        <div className="flex items-center justify-end tabular-nums" style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-text-secondary)" }}>
          {formatVolume(row.market.globalVolume24h)}
        </div>

        {/* Sparkline */}
        <div className="flex items-center justify-center">
          <SparklineChart data={history} width={48} height={20} />
        </div>

        {/* Solana availability */}
        <div className="flex items-center justify-center">
          {row.tradeable ? (
            <span className="badge-glow inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase" style={{ fontFamily: "var(--font-mono)", background: "var(--color-accent-dim)", color: "var(--color-accent)", border: "1px solid rgba(0, 229, 200, 0.2)" }}>
              {row.market.solanaMapping?.inputToken}/{row.market.solanaMapping?.outputToken}
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>View only</span>
          )}
        </div>

        {/* Action */}
        <div className="flex items-center justify-end">
          {row.tradeable ? (
            <span className="rounded px-3 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors" style={{ fontFamily: "var(--font-mono)", background: "var(--color-accent-dim)", color: "var(--color-accent)", border: "1px solid rgba(0, 229, 200, 0.15)" }}>Swap</span>
          ) : (
            <span className="rounded px-3 py-1 text-[11px] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>Details</span>
          )}
        </div>
      </div>

      {/* Mobile: compact card layout */}
      <div className="flex items-center justify-between px-3 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <span className="text-base leading-none">{CURRENCY_FLAGS[row.market.base] ?? ""}</span>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>{row.market.base}</span>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>/</span>
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{row.market.quote}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-[10px] tabular-nums" style={{ fontFamily: "var(--font-mono)", color: changeColor }}>
                {row.change24h !== null ? `${row.change24h > 0 ? "+" : ""}${row.change24h.toFixed(3)}%` : "--"}
              </span>
              {row.tradeable && (
                <span className="rounded px-1 py-px text-[8px] font-medium uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)", background: "var(--color-accent-dim)", color: "var(--color-accent)" }}>
                  Swap
                </span>
              )}
            </div>
          </div>
        </div>
        <div ref={rateRef} className="tabular-nums text-right" style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "13px" }}>
          {row.rate > 0 ? formatRate(row.rate) : "--"}
        </div>
      </div>
    </button>
  );
}

export const MarketRow = React.memo(MarketRowInner, (prev, next) => {
  return (
    prev.row.rate === next.row.rate &&
    prev.row.change24h === next.row.change24h &&
    prev.selected === next.selected &&
    prev.isWatched === next.isWatched &&
    prev.history?.length === next.history?.length
  );
});
