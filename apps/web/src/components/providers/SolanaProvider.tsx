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
        clusters:
          env.solanaNetwork === "devnet"
            ? [
                {
                  id: "solana:devnet",
                  label: "Devnet",
                  url: env.heliusRpcUrl ?? env.solanaRpcUrl,
                },
                {
                  id: "solana:mainnet",
                  label: "Mainnet",
                  url: "https://api.mainnet-beta.solana.com",
                },
              ]
            : [
                {
                  id: "solana:mainnet",
                  label: "Mainnet",
                  url: env.heliusRpcUrl ?? env.solanaRpcUrl,
                },
                {
                  id: "solana:devnet",
                  label: "Devnet",
                  url: "https://api.devnet.solana.com",
                },
              ],
      }),
    [],
  );

  return <AppProvider connectorConfig={connectorConfig}>{children}</AppProvider>;
}
