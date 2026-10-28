import { NextRequest, NextResponse } from "next/server";

const HERMES_BASE = "https://hermes.pyth.network";

const ALLOWED_PATHS = new Set([
  "v2/updates/price/latest",
  "v2/updates/price/stream",
]);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const apiKey = process.env.PYTH_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Pyth API key not configured" },
      { status: 503 },
    );
  }

  const path = (await params).path.join("/");
  if (!ALLOWED_PATHS.has(path)) {
    return NextResponse.json(
      { error: `Path not allowed. Supported: ${[...ALLOWED_PATHS].join(", ")}` },
      { status: 400 },
    );
  }

  // Only forward the params the Pyth client sends
  const { searchParams } = req.nextUrl;
  const upstreamParams = new URLSearchParams();
  for (const id of searchParams.getAll("ids[]")) upstreamParams.append("ids[]", id);
  const parsed = searchParams.get("parsed");
  if (parsed) upstreamParams.set("parsed", parsed);

  const response = await fetch(`${HERMES_BASE}/${path}?${upstreamParams}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
    // Close the upstream stream when the browser disconnects
    signal: req.signal,
  });

  if (!response.ok || !response.body) {
    return NextResponse.json(
      { error: `Pyth API error: ${response.status} ${response.statusText}` },
      { status: response.status },
    );
  }

  const isStream = path.endsWith("/stream");
  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
      // Latest prices are shared by every viewer, so let the CDN absorb repeat polls
      "Cache-Control": isStream
        ? "no-cache, no-transform"
        : "public, s-maxage=1, stale-while-revalidate=1",
    },
  });
}
