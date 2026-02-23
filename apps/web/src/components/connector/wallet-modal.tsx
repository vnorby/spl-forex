'use client';

import { useConnector, type WalletConnectorId, type WalletConnectorMetadata } from '@solana/connector/react';
import { HiddenWalletIcons } from '@/components/connector/shared/hidden-wallet-icons';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Separator,
    Spinner,
} from '@solafx/ui';
import { Wallet, ExternalLink, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WalletModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
    const { walletStatus, isConnecting, connectorId, connectors, connectWallet, disconnectWallet } = useConnector();
    const status = walletStatus.status;

    const [connectingConnectorId, setConnectingConnectorId] = useState<WalletConnectorId | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [recentlyConnectedConnectorId, setRecentlyConnectedConnectorId] = useState<WalletConnectorId | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const recent = localStorage.getItem('recentlyConnectedConnectorId');
        if (recent) {
            setRecentlyConnectedConnectorId(recent as WalletConnectorId);
        }
    }, []);

    useEffect(() => {
        if (status !== 'connected') return;
        if (!connectorId) return;
        localStorage.setItem('recentlyConnectedConnectorId', connectorId);
        setRecentlyConnectedConnectorId(connectorId);
    }, [status, connectorId]);

    function cancelConnection() {
        setConnectingConnectorId(null);
        disconnectWallet().catch(() => {});
    }

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen && (isConnecting || connectingConnectorId)) {
            cancelConnection();
        }
        onOpenChange(nextOpen);
    }

    const handleSelectWallet = async (connector: WalletConnectorMetadata) => {
        setConnectingConnectorId(connector.id);
        try {
            await connectWallet(connector.id);
            localStorage.setItem('recentlyConnectedConnectorId', connector.id);
            setRecentlyConnectedConnectorId(connector.id);
            onOpenChange(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes('Connection cancelled')) {
                return;
            }
            console.error('Failed to connect wallet:', error);
        } finally {
            setConnectingConnectorId(null);
        }
    };

    const readyConnectors = connectors.filter(c => c.ready && c.name !== 'WalletConnect');
    const notReadyConnectors = connectors.filter(c => !c.ready && c.name !== 'WalletConnect');

    const sortedReadyConnectors = [...readyConnectors].sort((a, b) => {
        const aIsRecent = recentlyConnectedConnectorId === a.id;
        const bIsRecent = recentlyConnectedConnectorId === b.id;
        if (aIsRecent && !bIsRecent) return -1;
        if (!aIsRecent && bIsRecent) return 1;
        return 0;
    });

    const primaryWallets = sortedReadyConnectors.slice(0, 3);
    const otherWallets = sortedReadyConnectors.slice(3);

    const getInstallUrl = (walletName: string) => {
        const name = walletName.toLowerCase();
        if (name.includes('phantom')) return 'https://phantom.app';
        if (name.includes('solflare')) return 'https://solflare.com';
        if (name.includes('backpack')) return 'https://backpack.app';
        if (name.includes('glow')) return 'https://glow.app';
        return 'https://phantom.app';
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md [&>button]:hidden rounded-xl">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle>Connect your wallet</DialogTitle>
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-lg size-8 p-2 shrink-0 cursor-pointer"
                            aria-label="Close"
                        >
                            <X className="size-4" />
                        </Button>
                    </DialogClose>
                </DialogHeader>

                <div className="space-y-4">
                        {!isClient ? (
                            <div className="text-center py-8">
                                <Spinner className="h-6 w-6 animate-spin mx-auto mb-2" />
                                <p className="text-sm text-[var(--color-text-muted)]">Detecting wallets...</p>
                            </div>
                        ) : (
                            <>
                                {primaryWallets.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="grid gap-2">
                                            {primaryWallets.map(connector => {
                                                const isThisConnecting =
                                                    connectingConnectorId === connector.id ||
                                                    (isConnecting && connectorId === connector.id);
                                                const isRecent = recentlyConnectedConnectorId === connector.id;
                                                return (
                                                    <Button
                                                        key={connector.id}
                                                        variant="outline"
                                                        className="h-auto justify-between p-4 rounded-xl"
                                                        onClick={() => handleSelectWallet(connector)}
                                                        disabled={isThisConnecting}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div className="flex-1 text-left">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-md">
                                                                        {connector.name}
                                                                    </span>
                                                                    {isRecent && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            Recent
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {isThisConnecting && (
                                                                    <div className="text-xs text-[var(--color-text-muted)]">
                                                                        Connecting...
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isThisConnecting && <Spinner className="h-4 w-4" />}
                                                            <Avatar className="h-10 w-10">
                                                                {connector.icon && (
                                                                    <AvatarImage
                                                                        src={connector.icon}
                                                                        alt={connector.name}
                                                                        onError={e => {
                                                                            e.currentTarget.style.display = 'none';
                                                                        }}
                                                                    />
                                                                )}
                                                                <AvatarFallback>
                                                                    <Wallet className="h-5 w-5" />
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        </div>
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {otherWallets.length > 0 && (
                                    <>
                                        {primaryWallets.length > 0 && <Separator />}
                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="other-wallets" className="border-none">
                                                <AccordionTrigger
                                                    hideChevron
                                                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 shadow-sm transition-colors hover:bg-[var(--color-surface-hover)] hover:no-underline cursor-pointer active:scale-[0.98]"
                                                >
                                                    <div className="flex flex-1 items-center justify-between">
                                                        <span>Other Wallets</span>
                                                        <HiddenWalletIcons
                                                            wallets={otherWallets}
                                                            className="shrink-0"
                                                        />
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="grid gap-2 pt-2">
                                                        {otherWallets.map(connector => {
                                                            const isThisConnecting =
                                                                connectingConnectorId === connector.id ||
                                                                (isConnecting && connectorId === connector.id);
                                                            const isRecent =
                                                                recentlyConnectedConnectorId === connector.id;
                                                            return (
                                                                <Button
                                                                    key={connector.id}
                                                                    variant="outline"
                                                                        className="h-auto justify-between p-4 rounded-xl"
                                                                    onClick={() => handleSelectWallet(connector)}
                                                                    disabled={isThisConnecting}
                                                                >
                                                                    <div className="flex items-center gap-3 flex-1">
                                                                        <div className="flex-1 text-left">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-semibold text-sm">
                                                                                    {connector.name}
                                                                                </span>
                                                                                {isRecent && (
                                                                                    <Badge
                                                                                        variant="secondary"
                                                                                        className="text-xs"
                                                                                    >
                                                                                        Recent
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            {isThisConnecting && (
                                                                                <div className="text-xs text-[var(--color-text-muted)]">
                                                                                    Connecting...
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {isThisConnecting && (
                                                                            <Spinner className="h-4 w-4" />
                                                                        )}
                                                                        <Avatar className="h-10 w-10">
                                                                            {connector.icon && (
                                                                                <AvatarImage
                                                                                    src={connector.icon}
                                                                                    alt={connector.name}
                                                                                    onError={e => {
                                                                                        e.currentTarget.style.display =
                                                                                            'none';
                                                                                    }}
                                                                                />
                                                                            )}
                                                                            <AvatarFallback>
                                                                                <Wallet className="h-5 w-5" />
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                    </div>
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </>
                                )}

                                {notReadyConnectors.length > 0 && (
                                    <>
                                        {(primaryWallets.length > 0 || otherWallets.length > 0) && <Separator />}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium text-[var(--color-text-muted)] px-1">
                                                {readyConnectors.length > 0 ? 'Unavailable Wallets' : 'Wallets'}
                                            </h3>
                                            <div className="grid gap-2">
                                                {notReadyConnectors.slice(0, 3).map(connector => (
                                                    <Button
                                                        key={connector.id}
                                                        variant="outline"
                                                        className="h-auto justify-between p-4 rounded-xl hover:cursor-pointer"
                                                        onClick={() =>
                                                            window.open(getInstallUrl(connector.name), '_blank')
                                                        }
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                {connector.icon && (
                                                                    <AvatarImage
                                                                        src={connector.icon}
                                                                        alt={connector.name}
                                                                        onError={e => {
                                                                            e.currentTarget.style.display = 'none';
                                                                        }}
                                                                    />
                                                                )}
                                                                <AvatarFallback>
                                                                    <Wallet className="h-4 w-4" />
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="text-left">
                                                                <div className="font-medium text-sm">
                                                                    {connector.name}
                                                                </div>
                                                                <div className="text-xs text-[var(--color-text-muted)]">
                                                                    Not available
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ExternalLink className="h-4 w-4 text-[var(--color-text-muted)]" />
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {connectors.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
                                        <Wallet className="mx-auto h-12 w-12 text-[var(--color-text-muted)] mb-3" />
                                        <h3 className="font-semibold mb-2">No Wallets Detected</h3>
                                        <p className="text-sm text-[var(--color-text-muted)] mb-6">
                                            Install a Solana wallet extension to get started
                                        </p>
                                        <div className="flex gap-2 justify-center">
                                            <Button
                                                onClick={() => window.open('https://phantom.app', '_blank')}
                                                className="bg-purple-600 hover:bg-purple-700"
                                            >
                                                Get Phantom
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open('https://backpack.app', '_blank')}
                                            >
                                                Get Backpack
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
            </DialogContent>
        </Dialog>
    );
}
