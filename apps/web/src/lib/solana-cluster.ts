interface ClusterLike {
  id?: string | null;
  label?: string | null;
  url?: string | null;
}

const CLUSTER_LABELS: Record<string, string> = {
  // Preferred ids (as used by @solana/connector)
  "solana:mainnet": "Mainnet",
  "solana:devnet": "Devnet",
  "solana:testnet": "Testnet",
  "solana:localnet": "Localnet",

  // Legacy ids (kept for safety/compat)
  "mainnet-beta": "Mainnet",
  devnet: "Devnet",
  testnet: "Testnet",
  localnet: "Localnet",
};

export function getSolanaClusterLabel(cluster?: ClusterLike | null) {
  if (!cluster) return "Unknown";
  if (cluster.id && CLUSTER_LABELS[cluster.id]) return CLUSTER_LABELS[cluster.id];
  if (cluster.label) return cluster.label;
  if (cluster.id) return cluster.id;
  return "Unknown";
}

export function isSolanaDevnetCluster(clusterId?: string | null) {
  if (!clusterId) return false;
  return clusterId.includes("devnet");
}

export function getSolanaBadgeVariant(
  clusterId?: string | null,
): "default" | "secondary" | "destructive" | "outline" {
  if (!clusterId) return "outline";
  if (clusterId.includes("mainnet")) return "default";
  if (clusterId.includes("devnet")) return "secondary";
  if (clusterId.includes("localnet")) return "destructive";
  return "outline";
}

export function getSolanaClusterDotClassName(clusterId?: string | null) {
  if (!clusterId) return "bg-emerald-500";
  if (clusterId.includes("mainnet")) return "bg-green-500";
  if (clusterId.includes("devnet")) return "bg-blue-500";
  if (clusterId.includes("testnet")) return "bg-yellow-500";
  if (clusterId.includes("localnet")) return "bg-red-500";
  return "bg-emerald-500";
}

export function getSolanaExplorerClusterQuery(clusterId?: string | null) {
  if (!clusterId) return "";
  if (clusterId.includes("devnet")) return "?cluster=devnet";
  if (clusterId.includes("testnet")) return "?cluster=testnet";
  return "";
}

