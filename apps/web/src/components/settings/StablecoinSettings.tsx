"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  usePreferences,
  STABLECOIN_OPTIONS,
} from "@/components/providers/PreferencesProvider";

export function StablecoinSettings() {
  const [open, setOpen] = useState(false);
  const { preferences, setPreference } = usePreferences();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const currencies = Object.keys(STABLECOIN_OPTIONS);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-widest transition-colors"
        style={{
          fontFamily: "var(--font-mono)",
          color: open ? "var(--color-text)" : "var(--color-text-muted)",
          border: "1px solid var(--color-border)",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.color = "var(--color-text-secondary)";
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.color = "var(--color-text-muted)";
        }}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 4.754a3.246 3.246 0 100 6.492 3.246 3.246 0 000-6.492zM5.754 8a2.246 2.246 0 114.492 0 2.246 2.246 0 01-4.492 0z" />
          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 01-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 01-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 01.52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 011.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 011.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 01.52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 01-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 01-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 002.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 001.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 00-1.115 2.693l.16.291c.415.764-.421 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 00-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 00-2.692-1.115l-.292.16c-.764.415-1.6-.421-1.184-1.185l.159-.291A1.873 1.873 0 001.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 003.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 002.692-1.115l.094-.319z" />
        </svg>
        Tokens
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-64 p-4 space-y-4"
          style={{
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border-bright)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            className="text-[10px] font-medium uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
          >
            Preferred Stablecoins
          </div>

          {currencies.map((currency) => {
            const options = STABLECOIN_OPTIONS[currency];
            const current = preferences[currency];

            return (
              <div key={currency} className="space-y-1.5">
                <div
                  className="text-[11px] font-medium uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
                >
                  {currency}
                </div>
                <div className="flex gap-2">
                  {options.map((opt) => (
                    <button
                      key={opt.symbol}
                      onClick={() => setPreference(currency, opt.symbol)}
                      className="flex-1 px-2.5 py-1.5 text-center text-xs transition-colors"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background:
                          current === opt.symbol
                            ? "var(--color-accent-dim)"
                            : "var(--color-surface)",
                        border:
                          current === opt.symbol
                            ? "1px solid rgba(0, 229, 200, 0.3)"
                            : "1px solid var(--color-border)",
                        color:
                          current === opt.symbol
                            ? "var(--color-accent)"
                            : "var(--color-text-secondary)",
                      }}
                    >
                      {opt.symbol}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          <div
            className="text-[10px] leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            Your preferred stablecoins will be used as default tokens when swapping.
          </div>
        </div>
      )}
    </div>
  );
}
