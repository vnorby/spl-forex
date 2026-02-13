"use client";

import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@solafx/ui";

export function WalletButton() {
  const { publicKey, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  if (publicKey) {
    const address = publicKey.toBase58();
    const short = `${address.slice(0, 4)}...${address.slice(-4)}`;
    return (
      <div className="flex items-center gap-1.5">
        <div
          className="flex items-center gap-2 border px-3 py-1.5"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.05em",
            borderColor: "rgba(0, 229, 200, 0.2)",
            background: "var(--color-accent-dim)",
            color: "var(--color-accent)",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--color-accent)" }}
          />
          {short}
        </div>
        <button
          onClick={() => disconnect()}
          className="border px-2 py-1.5 text-[10px] uppercase tracking-wider transition-colors"
          style={{
            fontFamily: "var(--font-mono)",
            borderColor: "var(--color-border-bright)",
            background: "var(--color-surface)",
            color: "var(--color-text-muted)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-down)";
            e.currentTarget.style.color = "var(--color-down)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border-bright)";
            e.currentTarget.style.color = "var(--color-text-muted)";
          }}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      loading={connecting}
      onClick={() => setVisible(true)}
    >
      Connect Wallet
    </Button>
  );
}
