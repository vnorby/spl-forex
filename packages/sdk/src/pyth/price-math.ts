import type { OraclePrice } from "@solafx/types";

/** Combines two oracle prices into a cross rate; relative confidences add. */
export function deriveCrossPrice(a: OraclePrice, b: OraclePrice, op: "mul" | "div"): OraclePrice {
  const price = op === "mul" ? a.price * b.price : a.price / b.price;
  return {
    price,
    confidence: price * (a.confidence / a.price + b.confidence / b.price),
    expo: Math.min(a.expo, b.expo),
    publishTime: Math.min(a.publishTime, b.publishTime),
  };
}

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
