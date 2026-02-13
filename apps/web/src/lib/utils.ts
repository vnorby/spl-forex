export function formatRate(rate: number, decimals: number = 4): string {
  if (rate >= 100) return rate.toFixed(2);
  if (rate >= 1) return rate.toFixed(decimals);
  return rate.toFixed(decimals + 2);
}

export function formatAmount(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatSpread(percent: number): string {
  const abs = Math.abs(percent);
  if (abs < 0.01) return "< 0.01%";
  return `${abs.toFixed(2)}%`;
}

export function spreadColor(percent: number): string {
  const abs = Math.abs(percent);
  if (abs < 0.1) return "text-green-400";
  if (abs < 0.5) return "text-yellow-400";
  return "text-red-400";
}

export function shortenSignature(sig: string): string {
  return `${sig.slice(0, 8)}...${sig.slice(-8)}`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000_000) return `$${(volume / 1_000_000_000_000).toFixed(1)}T`;
  if (volume >= 1_000_000_000) return `$${(volume / 1_000_000_000).toFixed(1)}B`;
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(0)}K`;
  return `$${volume.toFixed(0)}`;
}
