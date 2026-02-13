import { NextRequest, NextResponse } from "next/server";

const ALLOWED_METHODS = new Set([
  "getAssetsByOwner",
  "getPriorityFeeEstimate",
]);

export async function POST(req: NextRequest) {
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Helius API key not configured" },
      { status: 503 },
    );
  }

  const body = await req.json();
  const { method, params, id } = body;

  if (!method || !ALLOWED_METHODS.has(method)) {
    return NextResponse.json(
      { error: `Method not allowed. Supported: ${[...ALLOWED_METHODS].join(", ")}` },
      { status: 400 },
    );
  }

  const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: id ?? "proxy",
      method,
      params,
    }),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
