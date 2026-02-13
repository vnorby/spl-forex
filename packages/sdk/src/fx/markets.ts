import type { FXMarket, FXPairId } from "@solafx/types";

export const FX_MARKETS: FXMarket[] = [
  // Majors — globalVolume24h = estimated daily forex turnover (BIS triennial survey data)
  { pair: "EUR/USD", base: "EUR", quote: "USD", category: "major", solanaMapping: { inputToken: "USDC", outputToken: "EURC" }, globalVolume24h: 1_980_000_000_000 },
  { pair: "USD/JPY", base: "USD", quote: "JPY", category: "major", solanaMapping: { inputToken: "USDC", outputToken: "GYEN" }, globalVolume24h: 1_250_000_000_000 },
  { pair: "GBP/USD", base: "GBP", quote: "USD", category: "major", solanaMapping: { inputToken: "VGBP", outputToken: "USDC" }, globalVolume24h: 750_000_000_000 },
  { pair: "AUD/USD", base: "AUD", quote: "USD", category: "major", solanaMapping: null, globalVolume24h: 420_000_000_000 },
  { pair: "USD/CAD", base: "USD", quote: "CAD", category: "major", solanaMapping: null, globalVolume24h: 410_000_000_000 },
  { pair: "USD/CHF", base: "USD", quote: "CHF", category: "major", solanaMapping: { inputToken: "USDC", outputToken: "VCHF" }, globalVolume24h: 340_000_000_000 },
  { pair: "NZD/USD", base: "NZD", quote: "USD", category: "major", solanaMapping: null, globalVolume24h: 130_000_000_000 },
  // Crosses — EUR
  { pair: "EUR/JPY", base: "EUR", quote: "JPY", category: "cross", solanaMapping: { inputToken: "EURC", outputToken: "GYEN" }, globalVolume24h: 180_000_000_000 },
  { pair: "EUR/GBP", base: "EUR", quote: "GBP", category: "cross", solanaMapping: { inputToken: "EURC", outputToken: "VGBP" }, globalVolume24h: 160_000_000_000 },
  { pair: "EUR/CHF", base: "EUR", quote: "CHF", category: "cross", solanaMapping: { inputToken: "EURC", outputToken: "VCHF" }, globalVolume24h: 110_000_000_000 },
  { pair: "EUR/AUD", base: "EUR", quote: "AUD", category: "cross", solanaMapping: null, globalVolume24h: 45_000_000_000 },
  { pair: "EUR/CAD", base: "EUR", quote: "CAD", category: "cross", solanaMapping: null, globalVolume24h: 38_000_000_000 },
  { pair: "EUR/NZD", base: "EUR", quote: "NZD", category: "cross", solanaMapping: null, globalVolume24h: 18_000_000_000 },
  // Crosses — GBP
  { pair: "GBP/JPY", base: "GBP", quote: "JPY", category: "cross", solanaMapping: { inputToken: "VGBP", outputToken: "GYEN" }, globalVolume24h: 110_000_000_000 },
  { pair: "GBP/AUD", base: "GBP", quote: "AUD", category: "cross", solanaMapping: null, globalVolume24h: 28_000_000_000 },
  { pair: "GBP/CAD", base: "GBP", quote: "CAD", category: "cross", solanaMapping: null, globalVolume24h: 22_000_000_000 },
  { pair: "GBP/NZD", base: "GBP", quote: "NZD", category: "cross", solanaMapping: null, globalVolume24h: 12_000_000_000 },
  { pair: "GBP/CHF", base: "GBP", quote: "CHF", category: "cross", solanaMapping: { inputToken: "VGBP", outputToken: "VCHF" }, globalVolume24h: 35_000_000_000 },
  // Crosses — AUD / CAD / CHF / NZD
  { pair: "AUD/JPY", base: "AUD", quote: "JPY", category: "cross", solanaMapping: null, globalVolume24h: 65_000_000_000 },
  { pair: "AUD/NZD", base: "AUD", quote: "NZD", category: "cross", solanaMapping: null, globalVolume24h: 25_000_000_000 },
  { pair: "AUD/CAD", base: "AUD", quote: "CAD", category: "cross", solanaMapping: null, globalVolume24h: 18_000_000_000 },
  { pair: "CAD/JPY", base: "CAD", quote: "JPY", category: "cross", solanaMapping: null, globalVolume24h: 42_000_000_000 },
  { pair: "CHF/JPY", base: "CHF", quote: "JPY", category: "cross", solanaMapping: null, globalVolume24h: 48_000_000_000 },
  { pair: "NZD/JPY", base: "NZD", quote: "JPY", category: "cross", solanaMapping: null, globalVolume24h: 15_000_000_000 },
  // Exotics
  { pair: "USD/SGD", base: "USD", quote: "SGD", category: "exotic", solanaMapping: null, globalVolume24h: 85_000_000_000 },
  { pair: "USD/BRL", base: "USD", quote: "BRL", category: "exotic", solanaMapping: { inputToken: "USDC", outputToken: "BRZ" }, globalVolume24h: 72_000_000_000 },
  { pair: "USD/MXN", base: "USD", quote: "MXN", category: "exotic", solanaMapping: { inputToken: "USDC", outputToken: "MXNe" }, globalVolume24h: 114_000_000_000 },
  { pair: "USD/TRY", base: "USD", quote: "TRY", category: "exotic", solanaMapping: { inputToken: "USDC", outputToken: "TRYB" }, globalVolume24h: 36_000_000_000 },
  { pair: "USD/ZAR", base: "USD", quote: "ZAR", category: "exotic", solanaMapping: { inputToken: "USDC", outputToken: "ZARP" }, globalVolume24h: 58_000_000_000 },
  { pair: "USD/HKD", base: "USD", quote: "HKD", category: "exotic", solanaMapping: null, globalVolume24h: 95_000_000_000 },
  { pair: "USD/NOK", base: "USD", quote: "NOK", category: "exotic", solanaMapping: null, globalVolume24h: 65_000_000_000 },
  { pair: "USD/SEK", base: "USD", quote: "SEK", category: "exotic", solanaMapping: null, globalVolume24h: 55_000_000_000 },
];

export function getMarketByPair(pair: FXPairId): FXMarket | undefined {
  return FX_MARKETS.find((m) => m.pair === pair);
}

export function getTradeableMarkets(): FXMarket[] {
  return FX_MARKETS.filter((m) => m.solanaMapping !== null);
}

export function getAllPairIds(): FXPairId[] {
  return FX_MARKETS.map((m) => m.pair);
}
