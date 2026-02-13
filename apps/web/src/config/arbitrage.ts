import { TOKEN_REGISTRY, isStablecoin } from "@solafx/sdk";
import type { CurrencyCode } from "@solafx/types";

/**
 * Canonical "primary" token for each supported currency.
 * Cross-currency arb pairs are built from these tokens.
 * Peg arb pairs compare non-primary tokens against the primary for the same currency.
 */
export const PRIMARY_TOKENS: Record<string, string> = {
  USD: "USDC",
  EUR: "EURC",
  JPY: "GYEN",
  GBP: "VGBP",
  CHF: "VCHF",
  BRL: "BRZ",
  TRY: "TRYB",
  MXN: "MXNe",
  ZAR: "ZARP",
} as const;

/** Reference notional amount (in input-token units) used for the arb scanner. */
export const ARB_REFERENCE_AMOUNT = 1000;

/** Depth analysis amounts for price-impact analysis at various size levels. */
export const DEPTH_AMOUNTS = [
  100, 1_000, 10_000, 100_000, 500_000, 1_000_000,
];

export interface ArbitragePair {
  inputToken: string;
  outputToken: string;
}

/**
 * Builds the list of peg arbitrage pairs to monitor.
 *
 * Only same-currency pairs: for every non-primary token, compare it against
 * the primary token of the same currency (e.g. PYUSD ↔ USDC, USDe ↔ USDC).
 * This shows where the same stablecoin is trading at a premium or discount
 * to its canonical counterpart on-chain.
 */
export function generateArbitragePairs(): ArbitragePair[] {
  const pairs: ArbitragePair[] = [];

  const primarySet = new Set(Object.values(PRIMARY_TOKENS));

  // Build a reverse lookup: currency -> primary symbol
  const currencyToPrimary: Partial<Record<CurrencyCode, string>> = {};
  for (const [currency, symbol] of Object.entries(PRIMARY_TOKENS)) {
    currencyToPrimary[currency as CurrencyCode] = symbol;
  }

  for (const [symbol, tokenInfo] of Object.entries(TOKEN_REGISTRY)) {
    if (primarySet.has(symbol)) continue;

    // Skip yield-bearing, synthetic, and institutional tokens —
    // they're not expected to maintain a 1:1 peg so comparing them
    // against the primary would produce false arbitrage signals.
    if (!isStablecoin(tokenInfo)) continue;

    const primary = currencyToPrimary[tokenInfo.currency];
    if (!primary) continue;

    // Both directions: non-primary -> primary, and primary -> non-primary
    pairs.push({ inputToken: symbol, outputToken: primary });
    pairs.push({ inputToken: primary, outputToken: symbol });
  }

  return pairs;
}
