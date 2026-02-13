import type { SpreadInfo } from "@solafx/types";

export function calculateSpread(dexRate: number, oracleRate: number): SpreadInfo {
  if (oracleRate === 0) {
    return { absolute: 0, percent: 0, direction: "par", favorable: true };
  }

  const absolute = dexRate - oracleRate;
  const percent = (absolute / oracleRate) * 100;

  let direction: SpreadInfo["direction"];
  if (Math.abs(percent) < 0.005) {
    direction = "par";
  } else if (percent > 0) {
    direction = "premium";
  } else {
    direction = "discount";
  }

  return {
    absolute,
    percent,
    direction,
    favorable: Math.abs(percent) < 0.5,
  };
}
