import type { SwapResult } from "@solafx/types";
import { JupiterClient } from "../jupiter/client";

export class SwapExecutor {
  constructor(private jupiter: JupiterClient) {}

  async execute(params: {
    signedTransaction: string;
    requestId: string;
  }): Promise<SwapResult> {
    const result = await this.jupiter.executeOrder({
      signedTransaction: params.signedTransaction,
      requestId: params.requestId,
    });

    return {
      status: result.status,
      signature: result.signature,
      explorerUrl: `https://solscan.io/tx/${result.signature}`,
    };
  }
}
