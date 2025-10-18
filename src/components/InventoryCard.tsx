'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { InventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface InventoryCardProps {
  item: InventoryItem;
}

const RARITY_COLORS = {
  Common: 'border-gray-600/50 hover:border-gray-500',
  Uncommon: 'border-green-600/50 hover:border-green-500',
  Rare: 'border-blue-600/50 hover:border-blue-500',
  Epic: 'border-purple-600/50 hover:border-purple-500',
  Legendary: 'border-orange-600/50 hover:border-orange-500',
  NFT: 'border-purple-500/50 hover:border-purple-400',
};

const RARITY_TEXT_COLORS = {
  Common: 'text-gray-400',
  Uncommon: 'text-green-400',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-orange-400',
  NFT: 'text-purple-400',
};

const STATUS_BADGE_VARIANT = {
  won: 'secondary',
  exchanged: 'outline',
  shipped: 'default',
} as const;

export function InventoryCard({ item }: InventoryCardProps) {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: `Action: ${action}`,
      description: `Simulating '${action}' for ${item.name}. This would trigger a backend process.`,
    });
  }

  return (
    <Card className={cn("flex flex-col group overflow-hidden border-2 transition-colors", RARITY_COLORS[item.rarity])}>
      <CardHeader className="p-2 relative aspect-square">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="object-contain p-2"
          data-ai-hint={item.imageHint}
        />
        <Badge variant={STATUS_BADGE_VARIANT[item.status]} className="absolute top-2 right-2 capitalize">{item.status}</Badge>
      </CardHeader>
      <CardContent className="p-2 pt-0 text-center flex-grow">
        <p className="text-sm font-semibold truncate">{item.name}</p>
        <p className={cn("text-xs font-bold", RARITY_TEXT_COLORS[item.rarity])}>{item.rarity}</p>
      </CardContent>
      <CardFooter className="p-2 flex flex-col gap-1">
        {item.status === 'won' && item.rarity !== 'NFT' && (
          <Button variant="secondary" size="sm" className="w-full" onClick={() => handleAction('Sell')}>Sell for {item.value}</Button>
        )}
        {item.status === 'won' && item.rarity === 'NFT' && (
          <Button variant="default" size="sm" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground" onClick={() => handleAction('Transfer NFT')}>Transfer</Button>
        )}
      </CardFooter>
    </Card>
  );
}
