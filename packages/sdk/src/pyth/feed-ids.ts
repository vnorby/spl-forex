import type { FXPairId } from "@solafx/types";

/** Pairs Pyth publishes directly. Crosses it dropped are in DERIVED_FX_PAIRS. */
export const FX_FEED_IDS: Partial<Record<FXPairId, string>> = {
  // Majors
  "EUR/USD": "0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b",
  "USD/JPY": "0xef2c98c804ba503c6a707e38be4dfbb16683775f195b091252bf24693042fd52",
  "GBP/USD": "0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1",
  "USD/CHF": "0x0b1e3297e69f162877b577b0d6a47a0d63b2392bc8499e6540da4187a63e28f8",
  "AUD/USD": "0x67a6f93030420c1c9e3fe37c1ab6b77966af82f995944a9fefce357a22854a80",
  "USD/CAD": "0x3112b03a41c910ed446852aacf67118cb1bec67b2cd0b9a214c58cc0eaa2ecca",
  "NZD/USD": "0x92eea8ba1b00078cdc2ef6f64f091f262e8c7d0576ee4677572f314ebfafa4c7",
  // Crosses
  "EUR/JPY": "0xd8c874fa511b9838d094109f996890642421e462c3b29501a2560cecf82c2eb4",
  "EUR/GBP": "0xc349ff6087acab1c0c5442a9de0ea804239cc9fd09be8b1a93ffa0ed7f366d9c",
  "AUD/NZD": "0x67f98d83d2a5ae486d99bd2ab9da74b09f167fdd4928d4e1189f2360e6943522",
  // Exotics
  "USD/SGD": "0x396a969a9c1480fa15ed50bc59149e2c0075a72fe8f458ed941ddec48bdb4918",
  "USD/BRL": "0xd2db4dbf1aea74e0f666b0e8f73b9580d407f5e5cf931940b06dc633d7a95906",
  "USD/MXN": "0xe13b1c1ffb32f34e1be9545583f01ef385fde7f42ee66049d30570dc866b77ca",
  "USD/TRY": "0x032a2eba1c2635bf973e95fb62b2c0705c1be2603b9572cc8d5edeaf8744e058",
  "USD/ZAR": "0x389d889017db82bf42141f23b61b8de938a4e2d156e36312175bebf797f493f1",
  "USD/HKD": "0x19d75fde7fee50fe67753fdc825e583594eb2f51ae84e114a5246c4ab23aff4c",
  "USD/NOK": "0x235ddea9f40e9af5814dbcc83a418b98e3ee8df1e34e1ae4d45cf5de596023a3",
  "USD/SEK": "0x8ccb376aa871517e807358d4e3cf0bc7fe4950474dbe6c9ffc21ef64e43fc676",
};

export const ALL_FX_FEED_IDS = Object.values(FX_FEED_IDS).filter((id) => id !== undefined);

export interface DerivedFXPair {
  legs: [FXPairId, FXPairId];
  op: "mul" | "div";
}

/**
 * Crosses Pyth no longer publishes, priced from two USD legs:
 * price = legs[0] × legs[1] ("mul") or legs[0] ÷ legs[1] ("div").
 */
export const DERIVED_FX_PAIRS: Partial<Record<FXPairId, DerivedFXPair>> = {
  "EUR/CHF": { legs: ["EUR/USD", "USD/CHF"], op: "mul" },
  "EUR/AUD": { legs: ["EUR/USD", "AUD/USD"], op: "div" },
  "EUR/CAD": { legs: ["EUR/USD", "USD/CAD"], op: "mul" },
  "EUR/NZD": { legs: ["EUR/USD", "NZD/USD"], op: "div" },
  "GBP/JPY": { legs: ["GBP/USD", "USD/JPY"], op: "mul" },
  "GBP/AUD": { legs: ["GBP/USD", "AUD/USD"], op: "div" },
  "GBP/CAD": { legs: ["GBP/USD", "USD/CAD"], op: "mul" },
  "GBP/NZD": { legs: ["GBP/USD", "NZD/USD"], op: "div" },
  "GBP/CHF": { legs: ["GBP/USD", "USD/CHF"], op: "mul" },
  "AUD/JPY": { legs: ["AUD/USD", "USD/JPY"], op: "mul" },
  "AUD/CAD": { legs: ["AUD/USD", "USD/CAD"], op: "mul" },
  "CAD/JPY": { legs: ["USD/JPY", "USD/CAD"], op: "div" },
  "CHF/JPY": { legs: ["USD/JPY", "USD/CHF"], op: "div" },
  "NZD/JPY": { legs: ["NZD/USD", "USD/JPY"], op: "mul" },
};
