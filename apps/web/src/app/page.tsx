"use client";

import React, { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import type { AppTab } from "@/components/layout/Header";
import { MarketsTable } from "@/components/markets/MarketsTable";
import { CrossRatesMatrix } from "@/components/markets/CrossRatesMatrix";
import { ArbitragePanel } from "@/components/markets/ArbitragePanel";
import { ToolsPanel } from "@/components/tools/ToolsPanel";
import { SwapCard } from "@/components/swap/SwapCard";
import { TransactionHistory } from "@/components/history/TransactionHistory";

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>("markets");
  const [initialSwapPair, setInitialSwapPair] = useState<{
    input: string;
    output: string;
  } | null>(null);

  const handleArbSwapClick = useCallback(
    (inputToken: string, outputToken: string) => {
      setInitialSwapPair({ input: inputToken, output: outputToken });
      setActiveTab("swap");
    },
    [],
  );

  const handleMatrixPairClick = useCallback(
    (_base: string, _quote: string) => {
      setActiveTab("markets");
    },
    [],
  );

  return (
    <main className="min-h-screen">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "markets" && (
        <div className="mx-auto max-w-6xl px-3 py-4 md:px-6 md:py-6">
          <MarketsTable />
        </div>
      )}

      {activeTab === "matrix" && (
        <div className="mx-auto max-w-6xl px-3 py-4 md:px-6 md:py-6">
          <CrossRatesMatrix onPairClick={handleMatrixPairClick} />
        </div>
      )}

      {activeTab === "arbitrage" && (
        <div className="mx-auto max-w-6xl px-3 py-4 md:px-6 md:py-6">
          <ArbitragePanel onSwapClick={handleArbSwapClick} />
        </div>
      )}

      {activeTab === "tools" && (
        <div className="mx-auto max-w-6xl px-3 py-4 md:px-6 md:py-6">
          <ToolsPanel />
        </div>
      )}

      {activeTab === "swap" && (
        <div className="mx-auto max-w-lg px-4 pt-8 md:pt-12">
          <SwapCard initialPair={initialSwapPair} />
          <div className="mt-6">
            <TransactionHistory />
          </div>
        </div>
      )}
    </main>
  );
}
