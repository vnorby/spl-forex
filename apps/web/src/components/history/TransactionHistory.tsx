"use client";

import React, { useState, useEffect } from "react";
import type { SwapHistoryEntry } from "@solafx/types";
import { formatAmount, formatRate, formatSpread, spreadColor, shortenSignature } from "@/lib/utils";

export function TransactionHistory() {
  const [history, setHistory] = useState<SwapHistoryEntry[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("solafx-history") ?? "[]");
      setHistory(stored);
    } catch {
      // ignore
    }

    function handleStorage() {
      try {
        const stored = JSON.parse(localStorage.getItem("solafx-history") ?? "[]");
        setHistory(stored);
      } catch {
        // ignore
      }
    }
    window.addEventListener("storage", handleStorage);
    // Also poll for same-window updates
    const interval = setInterval(handleStorage, 2000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[var(--color-text-muted)]">
        Recent Swaps
      </h3>
      <div className="space-y-2">
        {history.slice(0, 10).map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm"
          >
            <div>
              <div className="font-medium">
                {formatAmount(entry.inputAmount)} {entry.inputToken} →{" "}
                {formatAmount(entry.outputAmount)} {entry.outputToken}
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">
                Rate: {formatRate(entry.dexRate)} | Spread:{" "}
                <span className={spreadColor(entry.spreadPercent)}>
                  {formatSpread(entry.spreadPercent)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <a
                href={entry.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-indigo-400 hover:underline"
              >
                {shortenSignature(entry.signature)}
              </a>
              <div className="text-xs text-[var(--color-text-muted)]">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
