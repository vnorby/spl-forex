"use client";

import React, { useState } from "react";
import { Button } from "@solafx/ui";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";

export function WalletButton() {
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const {
    walletAddress,
    isConnecting,
    disconnectWallet,
    connectWallet,
    connectors,
  } = useSolanaWallet();

  if (walletAddress) {
    const short = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
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
          onClick={() => disconnectWallet()}
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

  const availableConnectors = connectors.filter((connector) => connector.ready);

  return (
    <div className="relative">
      <Button
        variant="primary"
        size="sm"
        loading={isConnecting}
        onClick={() => setIsChooserOpen((open) => !open)}
      >
        Connect Wallet
      </Button>

      {isChooserOpen && (
        <div
          className="absolute right-0 z-50 mt-2 min-w-44 border p-1.5"
          style={{
            borderColor: "var(--color-border-bright)",
            background: "var(--color-surface)",
          }}
        >
          {availableConnectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => {
                connectWallet(connector.id);
                setIsChooserOpen(false);
              }}
              className="block w-full px-2 py-1.5 text-left text-xs uppercase tracking-wider transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-accent)";
                e.currentTarget.style.background = "var(--color-accent-dim)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-secondary)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
