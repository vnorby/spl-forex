import type { FXPair } from "@solafx/types";
import { TOKEN_REGISTRY } from "./registry";

function generatePairs(): FXPair[] {
  const tokens = Object.values(TOKEN_REGISTRY);
  const pairs: FXPair[] = [];
  for (const input of tokens) {
    for (const output of tokens) {
      if (input.symbol === output.symbol) continue;
      pairs.push({
        inputToken: input.symbol,
        outputToken: output.symbol,
        label: `${input.currency}/${output.currency}`,
      });
    }
  }
  return pairs;
}

export const SUPPORTED_PAIRS: FXPair[] = generatePairs();

export function getPairForTokens(inputSymbol: string, outputSymbol: string): FXPair | undefined {
  return SUPPORTED_PAIRS.find(
    (p) => p.inputToken === inputSymbol && p.outputToken === outputSymbol
  );
}
