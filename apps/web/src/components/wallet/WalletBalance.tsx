"use client";

import React from "react";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { formatAmount } from "@/lib/utils";

export function WalletBalance({ tokenSymbol }: { tokenSymbol: string }) {
  const { balances } = useTokenBalances();
  const balance = balances[tokenSymbol];

  if (balance === undefined) return null;

  return (
    <span className="text-xs text-[var(--color-text-muted)]">
      Balance: {formatAmount(balance)}
    </span>
  );
}
