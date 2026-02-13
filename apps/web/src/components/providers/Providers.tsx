"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SolanaProvider } from "./SolanaProvider";
import { MarketDataProvider } from "./MarketDataProvider";
import { PreferencesProvider } from "./PreferencesProvider";
import { ToastProvider } from "./ToastProvider";
import { useBalanceSubscription } from "@/hooks/useBalanceSubscription";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5_000,
      refetchOnWindowFocus: false,
    },
  },
});

/** Activates WebSocket balance listener inside the Solana context */
function BalanceSubscription({ children }: { children: React.ReactNode }) {
  useBalanceSubscription();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <SolanaProvider>
          <BalanceSubscription>
            <PreferencesProvider>
              <MarketDataProvider>{children}</MarketDataProvider>
            </PreferencesProvider>
          </BalanceSubscription>
        </SolanaProvider>
      </QueryClientProvider>
    </ToastProvider>
  );
}
