export type CurrencyCode = "USD" | "EUR" | "JPY" | "GBP" | "CHF" | "BRL" | "TRY" | "MXN" | "NGN" | "IDR" | "ZAR";

/**
 * Classification of stablecoin behavior.
 *
 * - "stablecoin"    — True 1:1 pegged (USDC, USDT, PYUSD, etc.)
 * - "yield"         — Accrues yield, expected to trade above peg (USDY, sUSD, syrupUSDC)
 * - "synthetic"     — Not directly redeemable 1:1, delta-neutral or algorithmic (USDe)
 * - "institutional" — Restricted/permissioned, not freely tradeable at peg (BUIDL)
 */
export type TokenType = "stablecoin" | "yield" | "synthetic" | "institutional";

export interface TokenInfo {
  symbol: string;
  currency: CurrencyCode;
  mintAddress: string;
  decimals: number;
  name: string;
  logoUri: string;
  issuer: string;
  /** Token classification. Defaults to "stablecoin" if omitted. */
  type?: TokenType;
}

export interface FXPair {
  inputToken: string;
  outputToken: string;
  label: string;
}
