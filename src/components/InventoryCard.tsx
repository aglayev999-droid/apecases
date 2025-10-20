
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { InventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

interface InventoryCardProps {
  item: InventoryItem;
  onClick: () => void;
}

export function InventoryCard({ item, onClick }: InventoryCardProps) {
  const { t } = useTranslation();

  const hasAnimation = !!item.animationUrl;
  const isIframe = hasAnimation && (item.animationUrl?.includes('vimeo') || item.animationUrl?.includes('youtube'));

  return (
    <Card 
        className={cn(
            "flex flex-col group overflow-hidden border-2 bg-card cursor-pointer transition-all duration-300 border-transparent hover:border-primary"
        )}
        onClick={onClick}
    >
      <CardHeader className="p-2 relative aspect-square">
        {hasAnimation ? (
          isIframe ? (
            <iframe
              src={item.animationUrl}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              className="w-full h-full rounded-md"
              title={item.name}
            />
          ) : (
             <div className="w-full h-full">
               <video 
                  src={item.animationUrl}
                  className="w-full h-full object-cover rounded-md"
                  autoPlay
                  loop
                  muted
                  playsInline
                  title={item.name}
                />
             </div>
          )
        ) : (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-contain p-2 group-hover:scale-105 transition-transform"
            data-ai-hint={item.imageHint}
          />
        )}
      </CardHeader>
      <CardContent className="p-2 pt-0 text-left flex-grow">
        <p className="text-sm font-semibold truncate">{item.name}</p>
        <p className={cn("text-xs font-bold")}>{item.rarity}</p>
      </CardContent>
    </Card>
  );
}
