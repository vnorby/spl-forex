import type { TokenInfo, TokenType } from "@solafx/types";

export const TOKEN_REGISTRY: Record<string, TokenInfo> = {
  USDC: {
    symbol: "USDC",
    currency: "USD",
    mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    name: "USD Coin",
    logoUri: "/tokens/usdc.svg",
    issuer: "Circle",
  },
  USDT: {
    symbol: "USDT",
    currency: "USD",
    mintAddress: "Es9vMF1kYDAS4aW63wFcd2BaRfGDiS4ixQe8H6PPJCmn",
    decimals: 6,
    name: "Tether USD",
    logoUri: "/tokens/usdt.svg",
    issuer: "Tether",
  },
  EURC: {
    symbol: "EURC",
    currency: "EUR",
    mintAddress: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    decimals: 6,
    name: "Euro Coin",
    logoUri: "/tokens/eurc.svg",
    issuer: "Circle",
  },
  GYEN: {
    symbol: "GYEN",
    currency: "JPY",
    mintAddress: "Crn4x1Y2HUKko7ox2EZMT6N2t2ZyH7eKtwkBGVnhEq1g",
    decimals: 6,
    name: "GMO JPY",
    logoUri: "/tokens/gyen.svg",
    issuer: "GMO Trust",
  },
  // USD stablecoins
  AUSD: {
    symbol: "AUSD",
    currency: "USD",
    mintAddress: "AUSD1jCcCyPLybk1YnvPWsHQSrZ46dxwoMniN4N2UEB9",
    decimals: 6,
    name: "AUSD",
    logoUri: "/tokens/ausd.svg",
    issuer: "AUSD",
  },
  BUIDL: {
    symbol: "BUIDL",
    currency: "USD",
    mintAddress: "GyWgeqpy5GueU2YbkE8xqUeVEokCMMCEeUrfbtMw6phr",
    decimals: 6,
    name: "BlackRock USD Institutional Digital Liquidity Fund",
    logoUri: "/tokens/buidl.svg",
    issuer: "BlackRock",
    type: "institutional",
  },
  CASH: {
    symbol: "CASH",
    currency: "USD",
    mintAddress: "CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH",
    decimals: 6,
    name: "CASH",
    logoUri: "/tokens/cash.svg",
    issuer: "Cash",
  },
  FDUSD: {
    symbol: "FDUSD",
    currency: "USD",
    mintAddress: "9zNQRsGLjNKwCUU5Gq5LR8beUCPzQMVMqKAi3SSZh54u",
    decimals: 6,
    name: "First Digital USD",
    logoUri: "/tokens/fdusd.svg",
    issuer: "First Digital",
  },
  GGUSD: {
    symbol: "GGUSD",
    currency: "USD",
    mintAddress: "GGUSDyBUPFg5RrgWwqEqhXoha85iYGs6cL57SyK4G2Y7",
    decimals: 6,
    name: "GGUSD",
    logoUri: "/tokens/ggusd.svg",
    issuer: "GGUSD",
  },
  USDG: {
    symbol: "USDG",
    currency: "USD",
    mintAddress: "2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH",
    decimals: 6,
    name: "Global Dollar",
    logoUri: "/tokens/usdg.svg",
    issuer: "Paxos",
  },
  USDY: {
    symbol: "USDY",
    currency: "USD",
    mintAddress: "A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6",
    decimals: 6,
    name: "Ondo US Dollar Yield",
    logoUri: "/tokens/usdy.svg",
    issuer: "Ondo",
    type: "yield",
  },
  USDP: {
    symbol: "USDP",
    currency: "USD",
    mintAddress: "HVbpJAQGNpkgBaYBZQBR1t7yFdvaYVp2vCQQfKKEN4tM",
    decimals: 6,
    name: "Pax Dollar",
    logoUri: "/tokens/usdp.svg",
    issuer: "Paxos",
  },
  PYUSD: {
    symbol: "PYUSD",
    currency: "USD",
    mintAddress: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    decimals: 6,
    name: "PayPal USD",
    logoUri: "/tokens/pyusd.svg",
    issuer: "PayPal",
  },
  legacyUSD: {
    symbol: "legacyUSD",
    currency: "USD",
    mintAddress: "BenJy1n3WTx9mTjEvy63e8Q1j4RqUc6E4VBMz3ir4Wo6",
    decimals: 6,
    name: "Legacy USD Star",
    logoUri: "/tokens/legacyusd.svg",
    issuer: "Legacy",
    type: "yield",
  },
  USDS: {
    symbol: "USDS",
    currency: "USD",
    mintAddress: "USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA",
    decimals: 6,
    name: "USDS",
    logoUri: "/tokens/usds.svg",
    issuer: "Sky",
  },
  sUSD: {
    symbol: "sUSD",
    currency: "USD",
    mintAddress: "susdabGDNbhrnCa6ncrYo81u4s9GM8ecK2UwMyZiq4X",
    decimals: 6,
    name: "Solayer USD",
    logoUri: "/tokens/susd.svg",
    issuer: "Solayer",
    type: "yield",
  },
  syrupUSDC: {
    symbol: "syrupUSDC",
    currency: "USD",
    mintAddress: "AvZZF1YaZDziPY2RCK4oJrRVrbN3mTD9NL24hPeaZeUj",
    decimals: 6,
    name: "Syrup USDC",
    logoUri: "/tokens/syrupusdc.svg",
    issuer: "Maple",
    type: "yield",
  },
  USDe: {
    symbol: "USDe",
    currency: "USD",
    mintAddress: "DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT",
    decimals: 9,
    name: "USDe",
    logoUri: "/tokens/usde.svg",
    issuer: "Ethena",
    type: "synthetic",
  },
  USDu: {
    symbol: "USDu",
    currency: "USD",
    mintAddress: "9ckR7pPPvyPadACDTzLwK2ZAEeUJ3qGSnzPs8bVaHrSy",
    decimals: 6,
    name: "USDu",
    logoUri: "/tokens/usdu.svg",
    issuer: "Ethena",
  },
  USX: {
    symbol: "USX",
    currency: "USD",
    mintAddress: "6FrrzDk5mQARGc1TDYoyVnSyRdds1t4PbtohCD6p3tgG",
    decimals: 6,
    name: "USX",
    logoUri: "/tokens/usx.svg",
    issuer: "dForce",
  },
  USD1: {
    symbol: "USD1",
    currency: "USD",
    mintAddress: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
    decimals: 6,
    name: "World Liberty Financial USD",
    logoUri: "/tokens/usd1.svg",
    issuer: "World Liberty Financial",
  },
  // EUR stablecoins
  EURCV: {
    symbol: "EURCV",
    currency: "EUR",
    mintAddress: "DghpMkatCiUsofbTmid3M3kAbDTPqDwKiYHnudXeGG52",
    decimals: 2,
    name: "EUR CoinVertible",
    logoUri: "/tokens/eurcv.svg",
    issuer: "SG Forge",
  },
  EUROe: {
    symbol: "EUROe",
    currency: "EUR",
    mintAddress: "2VhjJ9WxaGC3EZFwJG9BDUs9KxKCAjQY4vgd1qxgYWVg",
    decimals: 6,
    name: "EUROe Stablecoin",
    logoUri: "/tokens/euroe.svg",
    issuer: "Membrane",
  },
  VEUR: {
    symbol: "VEUR",
    currency: "EUR",
    mintAddress: "C4Kkr9NZU3VbyedcgutU6LKmi6MKz81sx6gRmk5pX519",
    decimals: 9,
    name: "VNX Euro",
    logoUri: "/tokens/veur.svg",
    issuer: "VNX",
  },
  // GBP stablecoins
  VGBP: {
    symbol: "VGBP",
    currency: "GBP",
    mintAddress: "5H4voZhzySsVvwVYDAKku8MZGuYBC7cXaBKDPW4YHWW1",
    decimals: 9,
    name: "VNX British Pound",
    logoUri: "/tokens/vgbp.svg",
    issuer: "VNX",
  },
  // CHF stablecoins
  VCHF: {
    symbol: "VCHF",
    currency: "CHF",
    mintAddress: "AhhdRu5YZdjVkKR3wbnUDaymVQL2ucjMQ63sZ3LFHsch",
    decimals: 9,
    name: "VNX Swiss Franc",
    logoUri: "/tokens/vchf.svg",
    issuer: "VNX",
  },
  // BRL stablecoins
  BRZ: {
    symbol: "BRZ",
    currency: "BRL",
    mintAddress: "FtgGSFADXBtroxq8VCausXRr2of47QBf5AS1NtZCu4GD",
    decimals: 4,
    name: "BRZ",
    logoUri: "/tokens/brz.svg",
    issuer: "Transfero",
  },
  // TRY stablecoins
  TRYB: {
    symbol: "TRYB",
    currency: "TRY",
    mintAddress: "A94X2fRy3wydNShU4dRaDyap2UuoeWJGWyATtyp61WZf",
    decimals: 6,
    name: "BiLira",
    logoUri: "/tokens/tryb.svg",
    issuer: "BiLira",
  },
  // MXN stablecoins
  MXNe: {
    symbol: "MXNe",
    currency: "MXN",
    mintAddress: "6zYgzrT7X2wi9a9NeMtUvUWLLmf2a8vBsbYkocYdB9wa",
    decimals: 9,
    name: "Real MXN",
    logoUri: "/tokens/mxne.svg",
    issuer: "Membrane",
  },
  // NGN stablecoins
  NGNC: {
    symbol: "NGNC",
    currency: "NGN",
    mintAddress: "52GzcLDMfBveMRnWXKX7U3Pa5Lf7QLkWWvsJRDjWDBSk",
    decimals: 2,
    name: "NGN Coin",
    logoUri: "/tokens/ngnc.svg",
    issuer: "NGNC",
  },
  // IDR stablecoins
  IDRX: {
    symbol: "IDRX",
    currency: "IDR",
    mintAddress: "idrxTdNftk6tYedPv2M7tCFHBVCpk5rkiNRd8yUArhr",
    decimals: 2,
    name: "IDRX",
    logoUri: "/tokens/idrx.svg",
    issuer: "IDRX",
  },
  // ZAR stablecoins
  ZARP: {
    symbol: "ZARP",
    currency: "ZAR",
    mintAddress: "dngKhBQM3BGvsDHKhrLnjvRKfY5Q7gEnYGToj9Lk8rk",
    decimals: 6,
    name: "ZARP Stablecoin",
    logoUri: "/tokens/zarp.svg",
    issuer: "ZARP",
  },
};

export function getTokenBySymbol(symbol: string): TokenInfo | undefined {
  return TOKEN_REGISTRY[symbol];
}

export function getTokensByPair(inputSymbol: string, outputSymbol: string) {
  const input = TOKEN_REGISTRY[inputSymbol];
  const output = TOKEN_REGISTRY[outputSymbol];
  if (!input || !output) return null;
  return { input, output };
}

export function getAllTokens(): TokenInfo[] {
  return Object.values(TOKEN_REGISTRY);
}

/** Resolve the effective token type; treats undefined/missing as "stablecoin". */
export function getTokenType(token: TokenInfo): TokenType {
  return token.type ?? "stablecoin";
}

/** Returns true if the token is a standard 1:1 pegged stablecoin. */
export function isStablecoin(token: TokenInfo): boolean {
  return getTokenType(token) === "stablecoin";
}
