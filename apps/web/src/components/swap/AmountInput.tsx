"use client";

import React from "react";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxBalance?: number;
}

export function AmountInput({ value, onChange, disabled, maxBalance }: AmountInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Allow empty, numbers, and single decimal point
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      onChange(raw);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="0.00"
        className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-[var(--color-text-muted)]/40"
      />
      {maxBalance !== undefined && maxBalance > 0 && (
        <button
          type="button"
          onClick={() => onChange(maxBalance.toString())}
          className="shrink-0 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors"
          style={{
            fontFamily: "var(--font-mono)",
            background: "var(--color-accent-dim)",
            color: "var(--color-accent)",
            border: "1px solid rgba(0, 229, 200, 0.2)",
          }}
        >
          MAX
        </button>
      )}
    </div>
  );
}
