"use client";

import { useState, useCallback, useEffect } from "react";
import type { FXPairId } from "@solafx/types";

const STORAGE_KEY = "solafx_watchlist";

function loadWatchlist(): FXPairId[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as FXPairId[];
  } catch {
    return [];
  }
}

function saveWatchlist(pairs: FXPairId[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<FXPairId[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setWatchlist(loadWatchlist());
  }, []);

  const toggle = useCallback((pair: FXPairId) => {
    setWatchlist((prev) => {
      const next = prev.includes(pair)
        ? prev.filter((p) => p !== pair)
        : [...prev, pair];
      saveWatchlist(next);
      return next;
    });
  }, []);

  const isWatched = useCallback(
    (pair: FXPairId) => watchlist.includes(pair),
    [watchlist],
  );

  return { watchlist, toggle, isWatched };
}
