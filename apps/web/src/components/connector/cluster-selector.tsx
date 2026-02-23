'use client';

import { useCluster } from '@solana/connector/react';
import {
    Badge,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    cn,
} from '@solafx/ui';
import { Check, ChevronDown, Globe } from 'lucide-react';
import type { SolanaClusterId, SolanaCluster } from '@solana/connector';
import { getSolanaBadgeVariant, getSolanaClusterLabel } from '@/lib/solana-cluster';

interface ClusterSelectorProps {
    className?: string;
}

export function ClusterSelector({ className }: ClusterSelectorProps) {
    const { cluster, clusters, setCluster } = useCluster();

    const currentClusterLabel = getSolanaClusterLabel(cluster);
    const currentClusterColor = getSolanaBadgeVariant(cluster?.id);

    const handleClusterChange = async (clusterId: SolanaClusterId) => {
        try {
            await setCluster(clusterId);
        } catch (error) {
            console.error('❌ ClusterSelector: Cluster change failed:', error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn('h-8', className)}>
                    <Globe className="mr-2 h-3 w-3" />
                    <Badge variant={currentClusterColor} className="mr-2 text-xs">
                        {currentClusterLabel}
                    </Badge>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Select Network</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {clusters.map((c: SolanaCluster) => {
                    const isSelected = c.id === cluster?.id;
                        const label = getSolanaClusterLabel(c);
                        const color = getSolanaBadgeVariant(c.id);

                    return (
                        <DropdownMenuItem
                            key={c.id}
                                onClick={() => handleClusterChange(c.id as SolanaClusterId)}
                            className={cn('cursor-pointer', isSelected && 'bg-[var(--color-surface-hover)]')}
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <Badge variant={color} className="text-xs">
                                        {label}
                                    </Badge>
                                </div>
                                {isSelected && <Check className="ml-2 h-3 w-3 flex-shrink-0" />}
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
