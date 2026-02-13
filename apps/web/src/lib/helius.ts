"use client";

import { TOKEN_REGISTRY } from "@solafx/sdk";

interface DASAsset {
  id: string;
  content: { metadata?: { symbol?: string; name?: string } };
  token_info?: {
    balance?: number;
    decimals?: number;
    symbol?: string;
    associated_token_address?: string;
    price_info?: { total_price?: number; price_per_token?: number };
  };
}

interface DASResponse {
  result: {
    items: DASAsset[];
    total: number;
  };
}

interface PriorityFeeResponse {
  result: {
    priorityFeeEstimate: number;
  };
}

export class HeliusClient {
  private proxyUrl: string;

  constructor(proxyUrl: string) {
    this.proxyUrl = proxyUrl;
  }

  /**
   * Fetch all fungible token balances for a wallet using the DAS API.
   * Calls go through our server-side proxy to keep the Helius API key private.
   */
  async getTokenBalances(ownerAddress: string): Promise<Record<string, number>> {
    const response = await fetch(this.proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "getAssetsByOwner",
        params: {
          ownerAddress,
          displayOptions: { showFungible: true, showNativeBalance: true },
        },
      }),
    });

    const data: DASResponse = await response.json();
    const items = data.result?.items ?? [];

    // Build reverse lookup: mint → symbol
    const mintToSymbol: Record<string, string> = {};
    for (const [symbol, info] of Object.entries(TOKEN_REGISTRY)) {
      mintToSymbol[info.mintAddress] = symbol;
    }

    const result: Record<string, number> = {};
    for (const asset of items) {
      const tokenInfo = asset.token_info;
      if (!tokenInfo || tokenInfo.decimals === undefined) continue;

      const symbol = mintToSymbol[asset.id];
      if (symbol && tokenInfo.balance !== undefined) {
        result[symbol] = tokenInfo.balance / Math.pow(10, tokenInfo.decimals);
      }
    }

    // Fill in zeros for tokens not held
    for (const symbol of Object.keys(TOKEN_REGISTRY)) {
      if (!(symbol in result)) result[symbol] = 0;
    }

    return result;
  }

  /**
   * Get priority fee estimate for a transaction.
   */
  async getPriorityFeeEstimate(
    accountKeys: string[],
    priorityLevel: "Min" | "Low" | "Medium" | "High" | "VeryHigh" = "Medium",
  ): Promise<number> {
    const response = await fetch(this.proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "getPriorityFeeEstimate",
        params: [
          {
            accountKeys,
            options: { priorityLevel },
          },
        ],
      }),
    });

    const data: PriorityFeeResponse = await response.json();
    return data.result?.priorityFeeEstimate ?? 0;
  }
}
