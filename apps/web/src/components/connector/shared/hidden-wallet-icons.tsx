"use client";

import * as React from "react";
import type { WalletConnectorMetadata } from "@solana/connector/react";
import { Avatar, AvatarFallback, AvatarImage, cn } from "@solafx/ui";
import { Wallet } from "lucide-react";

interface HiddenWalletIconsProps {
  wallets: WalletConnectorMetadata[];
  className?: string;
  maxVisible?: number;
}

export function HiddenWalletIcons({
  wallets,
  className,
  maxVisible = 4,
}: HiddenWalletIconsProps) {
  const visible = wallets.slice(0, maxVisible);
  const remaining = Math.max(0, wallets.length - visible.length);

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        {visible.map((wallet) => (
          <Avatar
            key={String(wallet.id)}
            className="h-7 w-7 border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            {wallet.icon ? <AvatarImage src={wallet.icon} alt={wallet.name} /> : null}
            <AvatarFallback>
              <Wallet className="h-3.5 w-3.5 opacity-80" />
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {remaining > 0 ? (
        <span className="ml-2 text-xs text-[var(--color-text-muted)]">+{remaining}</span>
      ) : null}
    </div>
  );
}

