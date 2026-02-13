"use client";

import React, { useState } from "react";
import { useMarketData, type SortField, type SortDirection } from "@/hooks/useMarketData";
import { MarketRow } from "./MarketRow";
import { MarketSearch } from "./MarketSearch";
import { PairDetail } from "./PairDetail";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useHistoryContext } from "@/components/providers/MarketDataProvider";
import type { FXPairId } from "@solafx/types";

const COLUMNS: { field: SortField; label: string; align?: "right" | "center" }[] = [
  { field: "pair", label: "Pair" },
  { field: "rate", label: "Rate", align: "right" },
  { field: "change24h", label: "24h", align: "right" },
  { field: "globalVolume", label: "Volume", align: "right" },
  { field: "tradeable", label: "Solana", align: "center" },
];

export function MarketsTable() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("tradeable");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedPair, setSelectedPair] = useState<FXPairId | null>(null);

  const { markets, connectionStatus, lastUpdate } = useMarketData({
    search,
    sortField,
    sortDirection,
  });
  const { watchlist, toggle: toggleWatchlist, isWatched } = useWatchlist();
  const { priceHistory } = useHistoryContext();

  // Separate watched and non-watched markets
  const watchedMarkets = markets.filter((m) => isWatched(m.market.pair));
  const hasWatchlist = watchedMarkets.length > 0;

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "tradeable" || field === "globalVolume" ? "desc" : "asc");
    }
  }

  function handleRowClick(pair: FXPairId) {
    setSelectedPair((prev) => (prev === pair ? null : pair));
  }

  return (
    <div className="space-y-5">
      {/* Page header — stacks on mobile */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
        <div>
          <h1 className="text-2xl tracking-tight md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            Global FX Markets
          </h1>
          <p className="mt-1 text-xs md:text-sm" style={{ color: "var(--color-text-muted)" }}>
            Live oracle rates via Pyth Network — tradeable pairs highlighted
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`h-1.5 w-1.5 rounded-full ${connectionStatus === "live" ? "live-pulse" : ""}`}
              style={{
                background:
                  connectionStatus === "live" ? "var(--color-accent)" :
                  connectionStatus === "stale" ? "var(--color-warning)" :
                  connectionStatus === "connecting" ? "var(--color-text-muted)" :
                  "var(--color-down)",
              }}
            />
            <span
              className="text-[11px] uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
            >
              {connectionStatus === "live" ? "Live" :
               connectionStatus === "stale" ? "Stale" :
               connectionStatus === "connecting" ? "Connecting" :
               "Offline"}
            </span>
          </div>
          <div className="w-full md:w-56">
            <MarketSearch value={search} onChange={setSearch} />
          </div>
        </div>
      </div>

      {/* Watchlist */}
      {hasWatchlist && (
        <div className="overflow-hidden border" style={{ borderColor: "rgba(0, 229, 200, 0.15)", background: "var(--color-surface)" }}>
          <div
            className="flex items-center gap-2 px-3 py-2 md:px-5"
            style={{ background: "var(--color-accent-dim)" }}
          >
            <span
              className="text-[10px] font-medium uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}
            >
              &#9733; Watchlist
            </span>
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
            >
              {watchedMarkets.length} pair{watchedMarkets.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div>
            {watchedMarkets.map((row, index) => (
              <React.Fragment key={`wl-${row.market.pair}`}>
                <MarketRow
                  row={row}
                  index={index}
                  selected={selectedPair === row.market.pair}
                  onClick={() => handleRowClick(row.market.pair)}
                  isWatched={true}
                  onToggleWatch={() => toggleWatchlist(row.market.pair)}
                  history={priceHistory[row.market.pair]}
                />
                {selectedPair === row.market.pair && (
                  <PairDetail row={row} onClose={() => setSelectedPair(null)} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        {/* Column headers — hidden on mobile */}
        <div
          className="hidden grid-cols-[24px_1.3fr_100px_70px_90px_50px_110px_100px] items-center gap-x-2 px-5 py-3 text-[10px] font-medium uppercase tracking-wider md:grid"
          style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
        >
          <span />
          {COLUMNS.map(({ field, label, align }) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`flex items-center gap-1 transition-colors hover:text-[var(--color-text-secondary)] ${
                align === "right" ? "justify-end" : align === "center" ? "justify-center" : ""
              }`}
            >
              {label}
              {sortField === field && (
                <span style={{ color: "var(--color-accent)" }}>
                  {sortDirection === "asc" ? "\u25B2" : "\u25BC"}
                </span>
              )}
            </button>
          ))}
          <span className="text-center">Chart</span>
          <span className="text-right">Action</span>
        </div>

        {/* Rows */}
        <div>
          {markets.map((row, index) => (
            <React.Fragment key={row.market.pair}>
              <MarketRow
                row={row}
                index={index}
                selected={selectedPair === row.market.pair}
                onClick={() => handleRowClick(row.market.pair)}
                isWatched={isWatched(row.market.pair)}
                onToggleWatch={() => toggleWatchlist(row.market.pair)}
                history={priceHistory[row.market.pair]}
              />
              {selectedPair === row.market.pair && (
                <PairDetail row={row} onClose={() => setSelectedPair(null)} />
              )}
            </React.Fragment>
          ))}
        </div>

        {markets.length === 0 && (
          <div className="py-16 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
            No pairs match &quot;{search}&quot;
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex flex-col gap-1 text-[11px] md:flex-row md:items-center md:justify-between"
        style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
      >
        <span>{markets.length} pairs</span>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline">Global volume: BIS Triennial Survey</span>
          {lastUpdate && <span>Updated {new Date(lastUpdate).toLocaleTimeString()}</span>}
        </div>
      </div>
    </div>
  );
}
