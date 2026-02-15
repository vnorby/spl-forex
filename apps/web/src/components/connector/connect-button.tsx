'use client';

import { useConnector } from '@solana/connector/react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    Spinner,
    cn,
} from '@solafx/ui';
import { useState } from 'react';
import { motion } from 'motion/react';
import { WalletModal } from './wallet-modal';
import { WalletDropdownContent } from './wallet-dropdown-content';
import { Wallet, ChevronDown } from 'lucide-react';

interface ConnectButtonProps {
    className?: string;
}

export function ConnectButton({ className }: ConnectButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { isConnected, isConnecting, account, connector } = useConnector();

    if (isConnected && account && connector) {
        const shortAddress = `${account.slice(0, 4)}...${account.slice(-4)}`;
        const walletIcon = connector.icon || undefined;

        return (
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className={cn('gap-2', className)}>
                        <Avatar className="h-5 w-5">
                            {walletIcon && <AvatarImage src={walletIcon} alt={connector.name} />}
                            <AvatarFallback>
                                <Wallet className="h-3 w-3" />
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{shortAddress}</span>
                        <motion.div
                            animate={{ rotate: isDropdownOpen ? -180 : 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </motion.div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    side="bottom"
                    className="p-0 rounded-xl border-[var(--color-border-bright)] bg-[var(--color-bg-subtle)] shadow-xl"
                >
                    <WalletDropdownContent
                        selectedAccount={account}
                        walletIcon={walletIcon}
                        walletName={connector.name}
                    />
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // Show loading button when connecting (but modal stays rendered)
    const buttonContent = isConnecting ? (
        <>
            <Spinner className="h-4 w-4" />
            <span className="text-xs">Connecting...</span>
        </>
    ) : (
        'Connect Wallet'
    );

    return (
        <>
            <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                    // Delay open to avoid same-click dismiss edge-cases with portals/dismissable layers.
                    window.setTimeout(() => setIsModalOpen(true), 0);
                }}
                className={className}
            >
                {buttonContent}
            </Button>
            <WalletModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    );
}
