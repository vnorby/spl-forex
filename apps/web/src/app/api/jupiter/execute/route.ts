import { NextRequest, NextResponse } from "next/server";

const JUPITER_BASE = "https://api.jup.ag/ultra/v1";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { signedTransaction, requestId } = body;

  if (!signedTransaction || !requestId) {
    return NextResponse.json(
      { error: "Missing required fields: signedTransaction, requestId" },
      { status: 400 },
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const apiKey = process.env.JUPITER_API_KEY;
  if (apiKey) headers["x-api-key"] = apiKey;

  const response = await fetch(`${JUPITER_BASE}/execute`, {
    method: "POST",
    headers,
    body: JSON.stringify({ signedTransaction, requestId }),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
