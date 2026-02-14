import { NextRequest, NextResponse } from "next/server";

const METIS_BASE = "https://api.jup.ag/swap/v1";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const apiKey = process.env.JUPITER_API_KEY;
  if (apiKey) headers["x-api-key"] = apiKey;

  const response = await fetch(`${METIS_BASE}/swap-instructions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
