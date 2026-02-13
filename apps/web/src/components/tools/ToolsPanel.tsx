"use client";

import React, { useState } from "react";
import { CurrencyConverter } from "./CurrencyConverter";
import { PipValueCalc } from "./PipValueCalc";
import { PositionSizeCalc } from "./PositionSizeCalc";

type ToolTab = "converter" | "pip" | "position";

const TOOLS: { key: ToolTab; label: string }[] = [
  { key: "converter", label: "Converter" },
  { key: "pip", label: "Pip Value" },
  { key: "position", label: "Position Size" },
];

export function ToolsPanel() {
  const [activeToolTab, setActiveToolTab] = useState<ToolTab>("converter");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1
          className="text-3xl tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          FX Tools
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Currency converter, pip value calculator, and position sizing
        </p>
      </div>

      {/* Tool tab bar */}
      <div className="flex gap-1">
        {TOOLS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveToolTab(key)}
            className="px-4 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              color:
                activeToolTab === key
                  ? "var(--color-accent)"
                  : "var(--color-text-muted)",
              background:
                activeToolTab === key
                  ? "var(--color-accent-dim)"
                  : "var(--color-surface)",
              border:
                activeToolTab === key
                  ? "1px solid rgba(0, 229, 200, 0.2)"
                  : "1px solid var(--color-border)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tool content */}
      <div
        className="max-w-md p-5"
        style={{
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        {activeToolTab === "converter" && <CurrencyConverter />}
        {activeToolTab === "pip" && <PipValueCalc />}
        {activeToolTab === "position" && <PositionSizeCalc />}
      </div>
    </div>
  );
}
