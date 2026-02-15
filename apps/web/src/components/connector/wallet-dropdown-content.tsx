'use client';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
} from '@solafx/ui';
import {
    ClusterElement,
    DisconnectElement,
} from '@solana/connector/react';
import { TOKEN_REGISTRY } from '@solafx/sdk';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { formatAmount } from '@/lib/utils';
import { getSolanaClusterDotClassName } from '@/lib/solana-cluster';
import {
    Wallet,
    Copy,
    Globe,
    ChevronLeft,
    Check,
    LogOut,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';

interface WalletDropdownContentProps {
    selectedAccount: string;
    walletIcon?: string;
    walletName: string;
}

type DropdownView = 'wallet' | 'network';

export function WalletDropdownContent({ selectedAccount, walletIcon, walletName }: WalletDropdownContentProps) {
    const [view, setView] = useState<DropdownView>('wallet');
    const [copied, setCopied] = useState(false);
    const { balances, loading: isBalancesLoading } = useTokenBalances();

    const shortAddress = `${selectedAccount.slice(0, 4)}...${selectedAccount.slice(-4)}`;

    const forexBalances = useMemo(() => {
        const entries = Object.values(TOKEN_REGISTRY).map(token => ({
            token,
            balance: balances[token.symbol] ?? 0,
        }));

        return entries
            .filter(({ balance }) => balance > 0)
            .sort((a, b) => b.balance - a.balance);
    }, [balances]);

    async function handleCopy() {
        if (!navigator.clipboard) {
            console.error('Clipboard API not available');
            return;
        }

        try {
            await navigator.clipboard.writeText(selectedAccount);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy address to clipboard:', error);
        }
    }

    // Wallet View
    if (view === 'wallet') {
        return (
            <motion.div
                key="wallet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-[360px] p-4 space-y-4"
            >
                {/* Header with Avatar and Address */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            {walletIcon && <AvatarImage src={walletIcon} alt={walletName} />}
                            <AvatarFallback>
                                <Wallet className="h-6 w-6" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold text-lg">{shortAddress}</div>
                            <div className="text-xs text-[var(--color-text-muted)]">{walletName}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            onClick={handleCopy}
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            title={copied ? 'Copied!' : 'Copy address'}
                        >
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>

                        {/* Network Selector Globe Button */}
                        <ClusterElement
                            render={({ cluster }) => (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full relative"
                                    onClick={() => setView('network')}
                                    title={`Network: ${cluster?.label || 'Unknown'}`}
                                >
                                    <Globe className="h-4 w-4" />
                                    <span
                                        className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--color-bg-subtle)] ${getSolanaClusterDotClassName(cluster?.id)}`}
                                    />
                                </Button>
                            )}
                        />
                    </div>
                </div>

                {/* FX balances (only curated registry tokens) */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">FX Balances</span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                            {isBalancesLoading ? 'Loading…' : `${forexBalances.length} token${forexBalances.length === 1 ? '' : 's'}`}
                        </span>
                    </div>

                    {isBalancesLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between rounded-lg px-2 py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-[var(--color-surface-hover)] animate-pulse" />
                                        <div className="space-y-1">
                                            <div className="h-3 w-16 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                                            <div className="h-3 w-24 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="h-3 w-16 rounded bg-[var(--color-surface-hover)] animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : forexBalances.length > 0 ? (
                        <div className="space-y-1">
                            {forexBalances.map(({ token, balance }) => (
                                <div
                                    key={token.symbol}
                                    className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-[var(--color-surface-hover)]"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="h-8 w-8 overflow-hidden rounded-full bg-[var(--color-surface-hover)]">
                                            <img
                                                src={token.logoUri}
                                                alt={token.symbol}
                                                className="h-8 w-8"
                                                loading="lazy"
                                                onError={e => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{token.symbol}</span>
                                                <span className="text-xs text-[var(--color-text-muted)]">
                                                    {token.currency}
                                                </span>
                                            </div>
                                            <div className="truncate text-xs text-[var(--color-text-muted)]">
                                                {token.name}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-mono text-sm">{formatAmount(balance)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-[var(--color-text-muted)] text-center py-2">
                            No FX token balances found
                        </p>
                    )}
                </div>

                {/* Disconnect Button */}
                <DisconnectElement
                    render={({ disconnect, disconnecting }) => (
                        <Button
                            variant="default"
                            className="w-full h-11 text-base rounded-xl"
                            onClick={disconnect}
                            disabled={disconnecting}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                        </Button>
                    )}
                />
            </motion.div>
        );
    }

    // Network Settings View
    return (
        <motion.div
            key="network"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-[360px] p-4 space-y-4"
        >
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setView('wallet')}
                    className="rounded-full border border-[var(--color-border)] p-2 hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-semibold text-lg">Network Settings</span>
            </div>

            {/* Network Options */}
            <ClusterElement
                render={({ cluster, clusters, setCluster }) => {
                    const currentClusterId = (cluster as { id?: string })?.id || 'solana:mainnet';
                    return (
                        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                            {clusters.map((network, index) => {
                                const isSelected = currentClusterId === network.id;
                                return (
                                    <div
                                        key={network.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setCluster(network.id)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setCluster(network.id);
                                            }
                                        }}
                                        className={`w-full flex items-center justify-between p-4 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer ${
                                            index !== clusters.length - 1 ? 'border-b border-[var(--color-border)]' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`h-2 w-2 rounded-full ${getSolanaClusterDotClassName(network.id)}`}
                                            />
                                            <span className="font-medium">{network.label}</span>
                                        </div>
                                        <div
                                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                isSelected
                                                    ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                                                    : 'border-[var(--color-border-bright)]'
                                            }`}
                                        >
                                            {isSelected && <Check className="h-3 w-3 text-black" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                }}
            />
        </motion.div>
    );
}
