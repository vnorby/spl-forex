export type FXPairId =
  // Majors
  | "EUR/USD"
  | "USD/JPY"
  | "GBP/USD"
  | "USD/CHF"
  | "AUD/USD"
  | "USD/CAD"
  | "NZD/USD"
  // Crosses
  | "EUR/JPY"
  | "EUR/GBP"
  | "EUR/CHF"
  | "EUR/AUD"
  | "EUR/CAD"
  | "EUR/NZD"
  | "GBP/JPY"
  | "GBP/AUD"
  | "GBP/CAD"
  | "GBP/NZD"
  | "GBP/CHF"
  | "AUD/JPY"
  | "AUD/NZD"
  | "AUD/CAD"
  | "CAD/JPY"
  | "CHF/JPY"
  | "NZD/JPY"
  // Minors / Exotics
  | "USD/SGD"
  | "USD/BRL"
  | "USD/MXN"
  | "USD/TRY"
  | "USD/ZAR"
  | "USD/HKD"
  | "USD/NOK"
  | "USD/SEK";

export interface FXRate {
  pair: FXPairId;
  rate: number;
  timestamp: number;
}

export interface SpreadInfo {
  absolute: number;
  percent: number;
  direction: "premium" | "discount" | "par";
  favorable: boolean;
}

export interface RateComparison {
  dexRate: number;
  oracleRate: number;
  oracleConfidence: number;
  spreadPercent: number;
  spreadDirection: "premium" | "discount" | "par";
  inputAmount: number;
  outputAmount: number;
  inputToken: string;
  outputToken: string;
  jupiterOrderData: JupiterOrderForExecution | null;
}

export interface JupiterOrderForExecution {
  transaction: string;
  requestId: string;
  inAmount: string;
  outAmount: string;
}

export type MarketCategory = "major" | "cross" | "exotic";

export interface SolanaMapping {
  inputToken: string;
  outputToken: string;
}

export interface FXMarket {
  pair: FXPairId;
  base: string;
  quote: string;
  category: MarketCategory;
  solanaMapping: SolanaMapping | null;
  globalVolume24h: number;
}

export interface MarketRow {
  market: FXMarket;
  rate: number;
  confidence: number;
  previousRate: number | null;
  change24h: number | null;
  publishTime: number;
  tradeable: boolean;
}

export interface PricePoint {
  price: number;
  timestamp: number;
}

export interface ArbitrageOpportunity {
  inputToken: string;
  outputToken: string;
  dexRate: number;
  oracleRate: number;
  spreadPercent: number;
  spreadDirection: "premium" | "discount" | "par";
  outputAmount: number;
  favorable: boolean;
  isPegArb: boolean;
  hasLiquidity: boolean;
}

export interface DepthLevel {
  inputAmount: number;
  outputAmount: number;
  dexRate: number;
  oracleRate: number;
  spreadPercent: number;
  spreadDirection: "premium" | "discount" | "par";
  priceImpact: number;
}

export interface DepthAnalysis {
  inputToken: string;
  outputToken: string;
  levels: DepthLevel[];
  oracleRate: number;
  bestRate: number;
  timestamp: number;
}
