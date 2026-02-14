import { NextRequest, NextResponse } from "next/server";

const METIS_BASE = "https://api.jup.ag/swap/v1";

export async function GET(req: NextRequest) {
  const headers: Record<string, string> = { Accept: "application/json" };
  const apiKey = process.env.JUPITER_API_KEY;
  if (apiKey) headers["x-api-key"] = apiKey;

  const response = await fetch(`${METIS_BASE}/quote?${req.nextUrl.searchParams.toString()}`, {
    headers,
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
