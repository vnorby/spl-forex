export interface JupiterOrderParams {
  inputMint: string;
  outputMint: string;
  amount: string;
  taker?: string;
}

export interface JupiterOrderResponse {
  requestId: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapType: string;
  priceImpactPct: string;
  routePlan: unknown[];
  inputMint: string;
  outputMint: string;
  transaction?: string;
  totalFees?: {
    signatureFee: number;
    openOrdersDeposits: number[];
    ataDeposits: number[];
    totalFeeAndDeposits: number;
    minimumSOLForTransaction: number;
  };
}

export interface JupiterExecuteParams {
  signedTransaction: string;
  requestId: string;
}

export interface JupiterExecuteResponse {
  status: "Success" | "Failed";
  signature: string;
  error?: string;
}
