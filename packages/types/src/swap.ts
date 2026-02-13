export type SwapStatus = "idle" | "quoting" | "confirming" | "signing" | "executing" | "success" | "error";

export interface SwapOrder {
  inputToken: string;
  outputToken: string;
  inputAmount: number;
  outputAmount: number;
  dexRate: number;
  oracleRate: number;
  spreadPercent: number;
  transaction: string;
  requestId: string;
}

export interface SwapResult {
  status: "Success" | "Failed";
  signature: string;
  explorerUrl: string;
}

export interface SwapHistoryEntry {
  id: string;
  timestamp: number;
  inputToken: string;
  outputToken: string;
  inputAmount: number;
  outputAmount: number;
  dexRate: number;
  oracleRate: number;
  spreadPercent: number;
  signature: string;
  explorerUrl: string;
}
