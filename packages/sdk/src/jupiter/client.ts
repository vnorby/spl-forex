import { JUPITER_ULTRA_BASE_URL } from "./constants";
import type {
  JupiterOrderParams,
  JupiterOrderResponse,
  JupiterExecuteParams,
  JupiterExecuteResponse,
} from "./types";

export class JupiterClient {
  private baseUrl: string;
  private apiKey: string | undefined;

  constructor(config?: { apiKey?: string; baseUrl?: string }) {
    this.baseUrl = config?.baseUrl ?? JUPITER_ULTRA_BASE_URL;
    this.apiKey = config?.apiKey;
  }

  async getOrder(params: JupiterOrderParams): Promise<JupiterOrderResponse> {
    const searchParams = new URLSearchParams({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
    });
    if (params.taker) {
      searchParams.set("taker", params.taker);
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }

    const response = await fetch(`${this.baseUrl}/order?${searchParams}`, {
      headers,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Jupiter API error ${response.status}: ${body}`);
    }

    return response.json();
  }

  async executeOrder(params: JupiterExecuteParams): Promise<JupiterExecuteResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }

    const response = await fetch(`${this.baseUrl}/execute`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        signedTransaction: params.signedTransaction,
        requestId: params.requestId,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Jupiter execute error ${response.status}: ${body}`);
    }

    return response.json();
  }
}
