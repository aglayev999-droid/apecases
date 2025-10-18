'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarIcon } from '@/components/icons/StarIcon';
import type { Case } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface CaseCardProps {
  caseData: Case;
  onOpen: () => void;
}

export function CaseCard({ caseData, onOpen }: CaseCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const isFree = caseData.price === 0;

  return (
    <Card className="flex flex-col group overflow-hidden bg-card border-none shadow-lg rounded-xl">
      <CardContent className="p-0 relative">
         <div className="aspect-square relative overflow-hidden">
          <Image
            src={caseData.image}
            alt={caseData.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={caseData.imageHint}
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 flex flex-col items-start">
        <div className="w-full flex justify-between items-center mb-2">
            <h3 className="font-headline font-bold text-base uppercase tracking-wider">{caseData.name}</h3>
            <Badge variant="secondary" className="bg-muted/50 text-muted-foreground">#{caseData.id.split('-')[1].slice(0, 4)}</Badge>
        </div>
        
        {isFree ? (
           <div className="w-full text-center py-2 bg-muted rounded-lg text-sm font-mono">
             01:40:23
           </div>
        ) : (
            <Button onClick={onOpen} className="w-full font-bold group" size="lg" variant="default">
                <div className="flex items-center justify-center gap-2">
                    <span>{formatPrice(caseData.price)}</span>
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                </div>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
