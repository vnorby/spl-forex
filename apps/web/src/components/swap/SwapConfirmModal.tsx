"use client";

import React from "react";
import { Modal, Button } from "@solafx/ui";
import type { RateComparison } from "@solafx/types";
import type { SwapStatus } from "@solafx/types";
import { TOKEN_REGISTRY } from "@solafx/sdk";
import { formatAmount, formatRate, formatSpread, spreadColor } from "@/lib/utils";

interface SwapConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  comparison: RateComparison | null;
  status: SwapStatus;
}

export function SwapConfirmModal({
  open,
  onClose,
  onConfirm,
  comparison,
  status,
}: SwapConfirmModalProps) {
  if (!comparison) return null;

  const input = TOKEN_REGISTRY[comparison.inputToken];
  const output = TOKEN_REGISTRY[comparison.outputToken];
  if (!input || !output) return null;

  const isExecuting = status === "signing" || status === "executing";

  return (
    <Modal open={open} onClose={onClose} title="Confirm Swap">
      <div className="space-y-4">
        <div className="border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-muted)]">You pay</span>
            <span className="text-lg font-semibold">
              {formatAmount(comparison.inputAmount)} {input.symbol}
            </span>
          </div>
          <div className="my-2 flex justify-center">
            <svg className="h-5 w-5 text-[var(--color-text-muted)]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-muted)]">You receive</span>
            <span className="text-lg font-semibold text-green-400">
              {formatAmount(comparison.outputAmount)} {output.symbol}
            </span>
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Rate</span>
            <span className="font-mono">
              1 {input.symbol} = {formatRate(comparison.dexRate)} {output.symbol}
            </span>
          </div>
          {input.currency !== output.currency && (
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Spread vs Oracle</span>
              <span className={`font-mono ${spreadColor(comparison.spreadPercent)}`}>
                {formatSpread(comparison.spreadPercent)}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isExecuting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onConfirm}
            loading={isExecuting}
          >
            {status === "signing"
              ? "Sign in Wallet..."
              : status === "executing"
                ? "Executing..."
                : "Confirm Swap"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
