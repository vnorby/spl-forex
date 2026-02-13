import type { OraclePrice } from "@solafx/types";

export function normalizePythPrice(raw: {
  price: { price: string; conf: string; expo: number; publish_time: number };
}): OraclePrice {
  const { price: priceStr, conf, expo, publish_time } = raw.price;
  const multiplier = Math.pow(10, expo);
  return {
    price: Number(priceStr) * multiplier,
    confidence: Number(conf) * multiplier,
    expo,
    publishTime: publish_time,
  };
}
