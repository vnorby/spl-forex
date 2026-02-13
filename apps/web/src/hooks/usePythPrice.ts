"use client";

import { useEffect, useState } from "react";
import type { FXPairId, OraclePrice } from "@solafx/types";
import { pythClient } from "@/lib/sdk";

export function usePythPrice(pair: FXPairId | null) {
  const [price, setPrice] = useState<OraclePrice | null>(null);

  useEffect(() => {
    if (!pair) {
      setPrice(null);
      return;
    }

    // Initial fetch
    pythClient.getRate(pair).then(setPrice).catch(() => {});

    // SSE stream
    const unsubscribe = pythClient.createPriceStream([pair], (_, p) => {
      setPrice(p);
    });

    return unsubscribe;
  }, [pair]);

  return price;
}
