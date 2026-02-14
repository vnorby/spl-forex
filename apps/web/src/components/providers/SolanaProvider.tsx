"use client";

import React, { useMemo } from "react";
import { AppProvider } from "@solana/connector/react";
import { getDefaultConfig } from "@solana/connector/headless";
import { env } from "@/config/env";

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const connectorConfig = useMemo(
    () =>
      getDefaultConfig({
        appName: "SolaFX",
        appUrl: "https://solafx.app",
        autoConnect: true,
        clusters: [
          {
            id: "solana:mainnet",
            label: "Mainnet",
            url:
              env.solanaNetwork === "mainnet-beta"
                ? (env.heliusRpcUrl ?? env.solanaRpcUrl)
                : "https://api.mainnet-beta.solana.com",
          },
          {
            id: "solana:devnet",
            label: "Devnet",
            url:
              env.solanaNetwork === "devnet"
                ? (env.heliusRpcUrl ?? env.solanaRpcUrl)
                : "https://api.devnet.solana.com",
          },
        ],
      }),
    [],
  );

  return <AppProvider connectorConfig={connectorConfig}>{children}</AppProvider>;
}
