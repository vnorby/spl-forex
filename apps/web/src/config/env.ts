export const env = {
  solanaRpcUrl:
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com",
  pythHermesUrl:
    process.env.NEXT_PUBLIC_PYTH_HERMES_URL ?? "https://hermes.pyth.network",
  solanaNetwork: (process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "mainnet-beta") as
    | "mainnet-beta"
    | "devnet",
  // Helius RPC URL is public (for ConnectorKit + Solana RPC usage).
  // The key can be restricted by domain on the Helius dashboard.
  heliusRpcUrl: process.env.NEXT_PUBLIC_HELIUS_RPC_URL ?? null,
  heliusWsUrl: process.env.NEXT_PUBLIC_HELIUS_RPC_URL
    ? process.env.NEXT_PUBLIC_HELIUS_RPC_URL.replace("https://", "wss://")
    : null,
};
