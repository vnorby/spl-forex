import { JupiterClient, PythFXClient, FXRateEngine, SwapExecutor } from "@solafx/sdk";
import { env } from "@/config/env";
import { HeliusClient } from "./helius";

// Jupiter client routes through our server-side proxy (/api/jupiter/*)
// to keep the API key out of the client bundle.
export const jupiterClient = new JupiterClient({
  baseUrl: "/api/jupiter",
});

export const pythClient = new PythFXClient(env.pythHermesUrl);

export const rateEngine = new FXRateEngine(jupiterClient, pythClient);

export const swapExecutor = new SwapExecutor(jupiterClient);

// Helius DAS client routes through our server-side proxy (/api/helius)
// to keep the API key out of the client bundle.
export const heliusClient = new HeliusClient("/api/helius");
