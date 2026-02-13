import { NextRequest, NextResponse } from "next/server";

const JUPITER_BASE = "https://api.jup.ag/ultra/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const inputMint = searchParams.get("inputMint");
  const outputMint = searchParams.get("outputMint");
  const amount = searchParams.get("amount");
  const taker = searchParams.get("taker");

  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json(
      { error: "Missing required params: inputMint, outputMint, amount" },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({ inputMint, outputMint, amount });
  if (taker) params.set("taker", taker);

  const headers: Record<string, string> = { Accept: "application/json" };
  const apiKey = process.env.JUPITER_API_KEY;
  if (apiKey) headers["x-api-key"] = apiKey;

  const response = await fetch(`${JUPITER_BASE}/order?${params}`, { headers });
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
