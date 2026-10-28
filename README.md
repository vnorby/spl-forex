# spl.forex

**Foreign exchange on Solana.** Live oracle rates, stablecoin swaps, and cross-currency arbitrage — all on-chain.

🌐 **[spl.forex](https://spl.forex)**

---

## What it does

spl.forex compares real-time FX oracle rates (via Pyth Network) against DEX prices (via Jupiter) for stablecoin pairs on Solana. When the DEX rate diverges from the oracle rate, you can swap at a discount.

- **33 stablecoins** across 11 fiat currencies (USD, EUR, JPY, GBP, CHF, BRL, TRY, MXN, NGN, IDR, ZAR)
- **28 FX pairs** tracked — majors, crosses, and exotics
- **Live arbitrage detection** — highlights pairs where DEX spread vs oracle is favorable
- **One-click swaps** — powered by Jupiter Ultra API

## Architecture

Monorepo using pnpm workspaces + Turborepo:

```
packages/
  types/     — Shared TypeScript types (FXPairId, TokenInfo, RateComparison, etc.)
  sdk/       — Core logic: Pyth client, Jupiter client, FX rate engine, token registry
  ui/        — Shared React components (Button, Card, Modal)
apps/
  web/       — Next.js 15 app (App Router, React 19, Tailwind CSS 4)
```

### Key integrations

| Service | Purpose | Auth |
|---------|---------|------|
| [Pyth Network](https://pyth.network) | Real-time FX oracle prices (28 pairs) | API key (server-proxied) |
| [Jupiter](https://jup.ag) | DEX aggregation + swap execution | API key (server-proxied) |
| [Helius](https://helius.dev) | Enhanced RPC, DAS API for token balances | API key (server-proxied) |

### API key security

Pyth, Jupiter and Helius API keys are **never exposed to the client**. They're kept as server-only env vars and proxied through Next.js API routes:

```
/api/pyth/v2/updates/price/latest → proxies to hermes.pyth.network (latest prices)
/api/pyth/v2/updates/price/stream → proxies to hermes.pyth.network (SSE price stream)
/api/jupiter/order                → proxies to api.jup.ag/ultra/v1/order
/api/jupiter/execute              → proxies to api.jup.ag/ultra/v1/execute
/api/helius                       → proxies JSON-RPC to helius-rpc.com
```

## Getting started

### Prerequisites

- Node.js 22+
- pnpm 9+

### Setup

```bash
git clone https://github.com/vnorby/spl-forex.git
cd spl-forex

pnpm install
```

Copy the example env file and add your keys:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```env
# Required for oracle prices (get a key from Pyth Terminal)
PYTH_API_KEY=your-pyth-key

# Required for swaps (get free keys from Jupiter and Helius dashboards)
JUPITER_API_KEY=your-jupiter-key
HELIUS_API_KEY=your-helius-key
NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your-helius-key
```

### Development

```bash
pnpm dev
```

Opens at `http://localhost:3000`.

### Build

```bash
pnpm build
```

### Project structure

```
apps/web/src/
  app/           — Next.js pages + API routes
  components/
    markets/     — MarketsTable, MarketRow, PairDetail, CrossRatesMatrix, ArbitragePanel
    swap/        — SwapCard, TokenSelector, AmountInput, SwapConfirmModal, InlineSwap
    wallet/      — WalletButton, WalletBalance
    rates/       — RateComparison panel
    tools/       — CurrencyConverter, PositionSizeCalc, PipValueCalc
    history/     — TransactionHistory
    layout/      — Header (responsive, mobile hamburger)
    providers/   — Solana, MarketData, Preferences, Toast providers
  hooks/         — useMarketData, useJupiterQuote, useSwapExecution, useTokenBalances, etc.
  config/        — Environment config, arbitrage thresholds
  lib/           — SDK instances, Helius client, utilities
```

## Stablecoins

| Currency | Tokens |
|----------|--------|
| 🇺🇸 USD | USDC, USDT, PYUSD, USDG, USDP, USDY, USDe, USDu, USDS, USD1, FDUSD, BUIDL, AUSD, CASH, GGUSD, sUSD, syrupUSDC, legacyUSD, USX |
| 🇪🇺 EUR | EURC, EURCV, EUROe, VEUR |
| 🇯🇵 JPY | GYEN |
| 🇬🇧 GBP | VGBP |
| 🇨🇭 CHF | VCHF |
| 🇧🇷 BRL | BRZ |
| 🇹🇷 TRY | TRYB |
| 🇲🇽 MXN | MXNe |
| 🇳🇬 NGN | NGNC |
| 🇮🇩 IDR | IDRX |
| 🇿🇦 ZAR | ZARP |

## Tech stack

- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4
- **UI**: React 19
- **State**: React Query (TanStack Query)
- **Charts**: Lightweight Charts (TradingView)
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **Build**: Turborepo + pnpm workspaces
- **Deploy**: Vercel

## License

MIT — see [LICENSE](LICENSE).
