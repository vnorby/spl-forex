"use client";

import React, { useState, useRef, useEffect } from "react";
import { TOKEN_REGISTRY, getTokenType } from "@solafx/sdk";
import { WalletBalance } from "@/components/wallet/WalletBalance";

interface TokenSelectorProps {
  value: string;
  onChange: (symbol: string) => void;
  excludeToken?: string;
}

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "$",
  EUR: "E",
  JPY: "Y",
  GBP: "P",
  CHF: "F",
};

export function TokenSelector({ value, onChange, excludeToken }: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const tokens = Object.values(TOKEN_REGISTRY).filter(
    (t) => t.symbol !== excludeToken,
  );
  const selected = TOKEN_REGISTRY[value];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border border-[var(--color-border-bright)] bg-[var(--color-surface-hover)] px-3 py-2 text-sm font-medium transition-colors hover:border-[var(--color-accent)]"
      >
        {selected && (
          <>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent-dim)] text-xs font-bold text-[var(--color-accent)]">
              {CURRENCY_FLAGS[selected.currency] ?? selected.currency[0]}
            </span>
            <span>{selected.symbol}</span>
          </>
        )}
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 w-56 border border-[var(--color-border-bright)] bg-[var(--color-bg-subtle)] p-1 shadow-xl">
          {tokens.map((token) => (
            <button
              key={token.symbol}
              type="button"
              onClick={() => {
                onChange(token.symbol);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-[var(--color-surface-hover)] ${
                token.symbol === value ? "bg-[var(--color-surface-hover)]" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent-dim)] text-xs font-bold text-[var(--color-accent)]">
                  {CURRENCY_FLAGS[token.currency] ?? token.currency[0]}
                </span>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{token.symbol}</span>
                    {getTokenType(token) !== "stablecoin" && (
                      <span
                        className="rounded px-1 py-px text-[8px] font-semibold uppercase tracking-wider"
                        style={{
                          background:
                            getTokenType(token) === "yield"
                              ? "rgba(245, 166, 35, 0.12)"
                              : getTokenType(token) === "synthetic"
                                ? "rgba(168, 85, 247, 0.12)"
                                : "rgba(59, 130, 246, 0.12)",
                          color:
                            getTokenType(token) === "yield"
                              ? "#f5a623"
                              : getTokenType(token) === "synthetic"
                                ? "#a855f7"
                                : "#3b82f6",
                        }}
                      >
                        {getTokenType(token)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {token.name}
                  </div>
                </div>
              </div>
              <WalletBalance tokenSymbol={token.symbol} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
