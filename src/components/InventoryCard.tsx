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

const RARITY_PROPERTIES = {
  Common: {
    border: 'border-gray-600/50 hover:border-gray-500',
    text: 'text-gray-400',
    glow: 'hover:shadow-gray-500/30'
  },
  Uncommon: {
    border: 'border-green-600/50 hover:border-green-500',
    text: 'text-green-400',
    glow: 'hover:shadow-green-500/40'
  },
  Rare: {
    border: 'border-blue-600/50 hover:border-blue-500',
    text: 'text-blue-400',
    glow: 'hover:shadow-blue-500/50'
  },
  Epic: {
    border: 'border-purple-600/50 hover:border-purple-500',
    text: 'text-purple-400',
    glow: 'hover:shadow-purple-500/60'
  },
  Legendary: {
    border: 'border-orange-600/50 hover:border-orange-500',
    text: 'text-orange-400',
    glow: 'hover:shadow-orange-500/70'
  },
  NFT: {
    border: 'border-purple-500/60 hover:border-purple-400',
    text: 'text-purple-400',
    glow: 'hover:shadow-purple-400/80'
  },
};


const STATUS_BADGE_VARIANT = {
  won: 'secondary',
  exchanged: 'outline',
  shipped: 'default',
} as const;

export function InventoryCard({ item }: InventoryCardProps) {
  const { toast } = useToast();

  const handleAction = (action: string, details: string) => {
    toast({
      title: `Action: ${action}`,
      description: details,
    });
  }

  return (
    <Card className={cn(
        "flex flex-col group overflow-hidden border-2 transition-all duration-300", 
        RARITY_PROPERTIES[item.rarity].border,
        `shadow-md shadow-black/20`,
        RARITY_PROPERTIES[item.rarity].glow
    )}>
      <CardHeader className="p-2 relative aspect-square">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="object-contain p-2 group-hover:scale-105 transition-transform"
          data-ai-hint={item.imageHint}
        />
        <Badge variant={STATUS_BADGE_VARIANT[item.status]} className="absolute top-2 right-2 capitalize">{item.status}</Badge>
      </CardHeader>
      <CardContent className="p-2 pt-0 text-center flex-grow">
        <p className="text-sm font-semibold truncate">{item.name}</p>
        <p className={cn("text-xs font-bold", RARITY_PROPERTIES[item.rarity].text)}>{item.rarity}</p>
      </CardContent>
      <CardFooter className="p-2 flex flex-col gap-1">
        {item.status === 'won' && item.rarity !== 'NFT' && (
          <Button variant="secondary" size="sm" className="w-full" onClick={() => handleAction('Sell', `Simulating selling ${item.name} for ${item.value} stars.`)}>
            Sell for {item.value} 
            <Image src="https://i.ibb.co/gMdH1VZN/stars.png" alt="stars" width={16} height={16} className="w-4 h-4 ml-1" />
          </Button>
        )}
        {item.status === 'won' && item.rarity === 'NFT' && (
          <Button variant="default" size="sm" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground" onClick={() => handleAction('Transfer NFT', `Simulating transfer process for ${item.name}. This would trigger a Cloud Function.`)}>
            Transfer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
