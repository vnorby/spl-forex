export const env = {
  // Hermes requires an API key, so the browser goes through our
  // server-side proxy (/api/pyth/*) instead of calling Pyth directly.
  pythHermesUrl: process.env.NEXT_PUBLIC_PYTH_HERMES_URL ?? "/api/pyth",
  solanaNetwork: (process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "mainnet-beta") as
    | "mainnet-beta"
    | "devnet",
  solanaRpcUrl:
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
    ((process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "mainnet-beta") === "devnet"
      ? "https://api.devnet.solana.com"
      : "https://api.mainnet-beta.solana.com"),
  // Helius RPC URL is public (for ConnectorKit + Solana RPC usage).
  // The key can be restricted by domain on the Helius dashboard.
  heliusRpcUrl: process.env.NEXT_PUBLIC_HELIUS_RPC_URL ?? null,
  heliusWsUrl: process.env.NEXT_PUBLIC_HELIUS_RPC_URL
    ? process.env.NEXT_PUBLIC_HELIUS_RPC_URL.replace("https://", "wss://")
    : null,
};
