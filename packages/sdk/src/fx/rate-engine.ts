import type { CurrencyCode, FXPairId, RateComparison, OraclePrice } from "@solafx/types";
import { JupiterClient } from "../jupiter/client";
import { PythFXClient } from "../pyth/client";
import { TOKEN_REGISTRY } from "../tokens/registry";
import { calculateSpread } from "./spread";

interface CurrencyPairRoute {
  feeds: FXPairId[];
  compute: (rates: OraclePrice[]) => number;
}

// Maps "FROM:TO" -> how many TO per 1 FROM
// Direct feeds use Pyth oracle prices; cross routes chain through USD
const CURRENCY_ROUTES: Record<string, CurrencyPairRoute> = {
  // Same-currency peg routes (oracle rate = 1.0)
  "USD:USD": { feeds: [], compute: () => 1.0 },
  "EUR:EUR": { feeds: [], compute: () => 1.0 },
  "JPY:JPY": { feeds: [], compute: () => 1.0 },
  "GBP:GBP": { feeds: [], compute: () => 1.0 },
  "CHF:CHF": { feeds: [], compute: () => 1.0 },
  "BRL:BRL": { feeds: [], compute: () => 1.0 },
  "TRY:TRY": { feeds: [], compute: () => 1.0 },
  "MXN:MXN": { feeds: [], compute: () => 1.0 },
  "NGN:NGN": { feeds: [], compute: () => 1.0 },
  "IDR:IDR": { feeds: [], compute: () => 1.0 },
  "ZAR:ZAR": { feeds: [], compute: () => 1.0 },

  // USD direct routes — EUR/USD oracle: 1 EUR = X USD
  "USD:EUR": { feeds: ["EUR/USD"], compute: ([r]) => 1 / r.price },
  "EUR:USD": { feeds: ["EUR/USD"], compute: ([r]) => r.price },

  // USD/JPY oracle: 1 USD = X JPY
  "USD:JPY": { feeds: ["USD/JPY"], compute: ([r]) => r.price },
  "JPY:USD": { feeds: ["USD/JPY"], compute: ([r]) => 1 / r.price },

  // GBP/USD oracle: 1 GBP = X USD
  "USD:GBP": { feeds: ["GBP/USD"], compute: ([r]) => 1 / r.price },
  "GBP:USD": { feeds: ["GBP/USD"], compute: ([r]) => r.price },

  // USD/CHF oracle: 1 USD = X CHF
  "USD:CHF": { feeds: ["USD/CHF"], compute: ([r]) => r.price },
  "CHF:USD": { feeds: ["USD/CHF"], compute: ([r]) => 1 / r.price },

  // USD/BRL oracle: 1 USD = X BRL
  "USD:BRL": { feeds: ["USD/BRL"], compute: ([r]) => r.price },
  "BRL:USD": { feeds: ["USD/BRL"], compute: ([r]) => 1 / r.price },

  // USD/TRY oracle: 1 USD = X TRY
  "USD:TRY": { feeds: ["USD/TRY"], compute: ([r]) => r.price },
  "TRY:USD": { feeds: ["USD/TRY"], compute: ([r]) => 1 / r.price },

  // USD/MXN oracle: 1 USD = X MXN
  "USD:MXN": { feeds: ["USD/MXN"], compute: ([r]) => r.price },
  "MXN:USD": { feeds: ["USD/MXN"], compute: ([r]) => 1 / r.price },

  // USD/ZAR oracle: 1 USD = X ZAR
  "USD:ZAR": { feeds: ["USD/ZAR"], compute: ([r]) => r.price },
  "ZAR:USD": { feeds: ["USD/ZAR"], compute: ([r]) => 1 / r.price },

  // Cross routes with direct Pyth feeds
  "EUR:JPY": {
    feeds: ["EUR/USD", "USD/JPY"],
    compute: ([eurUsd, usdJpy]) => eurUsd.price * usdJpy.price,
  },
  "JPY:EUR": {
    feeds: ["EUR/USD", "USD/JPY"],
    compute: ([eurUsd, usdJpy]) => 1 / (eurUsd.price * usdJpy.price),
  },
  "EUR:GBP": {
    feeds: ["EUR/USD", "GBP/USD"],
    compute: ([eurUsd, gbpUsd]) => eurUsd.price / gbpUsd.price,
  },
  "GBP:EUR": {
    feeds: ["EUR/USD", "GBP/USD"],
    compute: ([eurUsd, gbpUsd]) => gbpUsd.price / eurUsd.price,
  },
  "EUR:CHF": { feeds: ["EUR/CHF"], compute: ([r]) => r.price },
  "CHF:EUR": { feeds: ["EUR/CHF"], compute: ([r]) => 1 / r.price },
  "GBP:JPY": { feeds: ["GBP/JPY"], compute: ([r]) => r.price },
  "JPY:GBP": { feeds: ["GBP/JPY"], compute: ([r]) => 1 / r.price },
  "GBP:CHF": { feeds: ["GBP/CHF"], compute: ([r]) => r.price },
  "CHF:GBP": { feeds: ["GBP/CHF"], compute: ([r]) => 1 / r.price },
};

// Helpers to get FROM:USD and USD:TO routes for dynamic cross computation
const TO_USD_FEEDS: Record<string, { feed: FXPairId; isInverse: boolean }> = {
  USD: { feed: "EUR/USD", isInverse: false }, // identity, handled by same-currency
  EUR: { feed: "EUR/USD", isInverse: false },  // EUR/USD = X -> 1 EUR = X USD
  JPY: { feed: "USD/JPY", isInverse: true },   // USD/JPY = X -> 1 JPY = 1/X USD
  GBP: { feed: "GBP/USD", isInverse: false },  // GBP/USD = X -> 1 GBP = X USD
  CHF: { feed: "USD/CHF", isInverse: true },   // USD/CHF = X -> 1 CHF = 1/X USD
  BRL: { feed: "USD/BRL", isInverse: true },   // USD/BRL = X -> 1 BRL = 1/X USD
  TRY: { feed: "USD/TRY", isInverse: true },   // USD/TRY = X -> 1 TRY = 1/X USD
  MXN: { feed: "USD/MXN", isInverse: true },   // USD/MXN = X -> 1 MXN = 1/X USD
  ZAR: { feed: "USD/ZAR", isInverse: true },   // USD/ZAR = X -> 1 ZAR = 1/X USD
};

function buildDynamicRoute(from: CurrencyCode, to: CurrencyCode): CurrencyPairRoute | null {
  // Chain: FROM -> USD -> TO
  // Rate = (FROM in USD) * (USD in TO)
  const fromInfo = TO_USD_FEEDS[from];
  const toInfo = TO_USD_FEEDS[to];
  if (!fromInfo || !toInfo || from === "USD" || to === "USD") return null;

  const feeds: FXPairId[] = [fromInfo.feed, toInfo.feed];
  // Deduplicate if same feed
  const uniqueFeeds = feeds[0] === feeds[1] ? [feeds[0]] : feeds;

  return {
    feeds: uniqueFeeds,
    compute: (rates: OraclePrice[]) => {
      const fromRate = uniqueFeeds.length === 1 ? rates[0] : rates[0];
      const toRate = uniqueFeeds.length === 1 ? rates[0] : rates[1];
      // fromInUsd = how many USD per 1 FROM
      const fromInUsd = fromInfo.isInverse ? 1 / fromRate.price : fromRate.price;
      // usdInTo = how many TO per 1 USD
      const usdInTo = toInfo.isInverse ? toRate.price : 1 / toRate.price;
      return fromInUsd * usdInTo;
    },
  };
}

function getCurrencyRoute(from: CurrencyCode, to: CurrencyCode): CurrencyPairRoute {
  const key = `${from}:${to}`;
  const route = CURRENCY_ROUTES[key];
  if (route) return route;

  // Try dynamic route via USD
  const dynamic = buildDynamicRoute(from, to);
  if (dynamic) {
    // Cache for future lookups
    CURRENCY_ROUTES[key] = dynamic;
    return dynamic;
  }

  throw new Error(`No FX route from ${from} to ${to}`);
}

export class FXRateEngine {
  constructor(
    private jupiter: JupiterClient,
    private pyth: PythFXClient,
  ) {}

  async getComparison(params: {
    inputToken: string;
    outputToken: string;
    amount: number;
    taker?: string;
  }): Promise<RateComparison> {
    const input = TOKEN_REGISTRY[params.inputToken];
    const output = TOKEN_REGISTRY[params.outputToken];
    if (!input || !output) {
      throw new Error(`Unknown token: ${params.inputToken} or ${params.outputToken}`);
    }

    const amountRaw = Math.floor(params.amount * 10 ** input.decimals).toString();
    const route = getCurrencyRoute(input.currency, output.currency);

    // Fetch Jupiter quote and Pyth oracle rates in parallel
    const [order, ...oracleRates] = await Promise.all([
      this.jupiter.getOrder({
        inputMint: input.mintAddress,
        outputMint: output.mintAddress,
        amount: amountRaw,
        taker: params.taker,
      }),
      ...route.feeds.map((feed) => this.pyth.getRate(feed)),
    ]);

    // Calculate DEX effective rate
    const inAmountHuman = Number(order.inAmount) / 10 ** input.decimals;
    const outAmountHuman = Number(order.outAmount) / 10 ** output.decimals;
    const dexRate = outAmountHuman / inAmountHuman;

    // Calculate oracle rate
    const oracleRate = route.feeds.length > 0 ? route.compute(oracleRates) : 1.0;
    const oracleConfidence =
      oracleRates.length > 0
        ? oracleRates.reduce((sum, r) => sum + r.confidence / r.price, 0) * oracleRate
        : 0;

    const spread = calculateSpread(dexRate, oracleRate);

    return {
      dexRate,
      oracleRate,
      oracleConfidence,
      spreadPercent: spread.percent,
      spreadDirection: spread.direction,
      inputAmount: params.amount,
      outputAmount: outAmountHuman,
      inputToken: params.inputToken,
      outputToken: params.outputToken,
      jupiterOrderData: params.taker
        ? {
            transaction: order.transaction ?? "",
            requestId: order.requestId,
            inAmount: order.inAmount,
            outAmount: order.outAmount,
          }
        : null,
    };
  }

  async getOracleRate(inputCurrency: CurrencyCode, outputCurrency: CurrencyCode): Promise<number> {
    const route = getCurrencyRoute(inputCurrency, outputCurrency);
    if (route.feeds.length === 0) return 1.0;
    const rates = await Promise.all(route.feeds.map((f) => this.pyth.getRate(f)));
    return route.compute(rates);
  }
}
