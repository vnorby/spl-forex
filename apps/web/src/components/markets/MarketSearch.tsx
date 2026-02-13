"use client";

import React from "react";

interface MarketSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarketSearch({ value, onChange }: MarketSearchProps) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
        style={{ color: "var(--color-text-muted)" }}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
          clipRule="evenodd"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search pairs..."
        className="w-full py-2 pl-9 pr-3 text-sm outline-none"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
          letterSpacing: "0.02em",
        }}
      />
    </div>
  );
}
