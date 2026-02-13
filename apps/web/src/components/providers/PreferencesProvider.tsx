"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

/**
 * Maps a currency code to the user's preferred stablecoin symbol.
 * e.g. { USD: "USDC", EUR: "EURC", JPY: "GYEN" }
 */
export type StablecoinPreferences = Record<string, string>;

/** Available stablecoin options per currency */
export const STABLECOIN_OPTIONS: Record<string, { symbol: string; name: string }[]> = {
  USD: [
    { symbol: "USDC", name: "USD Coin (Circle)" },
    { symbol: "USDT", name: "Tether USD" },
  ],
  EUR: [
    { symbol: "EURC", name: "Euro Coin (Circle)" },
  ],
  JPY: [
    { symbol: "GYEN", name: "GMO JPY" },
  ],
};

const DEFAULT_PREFERENCES: StablecoinPreferences = {
  USD: "USDC",
  EUR: "EURC",
  JPY: "GYEN",
};

const STORAGE_KEY = "solafx-stablecoin-prefs";

interface PreferencesContextValue {
  preferences: StablecoinPreferences;
  setPreference: (currency: string, symbol: string) => void;
  getPreferredToken: (currency: string) => string;
}

const PreferencesContext = createContext<PreferencesContextValue>({
  preferences: DEFAULT_PREFERENCES,
  setPreference: () => {},
  getPreferredToken: (currency) => DEFAULT_PREFERENCES[currency] ?? currency,
});

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<StablecoinPreferences>(DEFAULT_PREFERENCES);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StablecoinPreferences;
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const setPreference = useCallback((currency: string, symbol: string) => {
    setPreferences((prev) => {
      const next = { ...prev, [currency]: symbol };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const getPreferredToken = useCallback(
    (currency: string) => preferences[currency] ?? currency,
    [preferences],
  );

  return (
    <PreferencesContext.Provider value={{ preferences, setPreference, getPreferredToken }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
