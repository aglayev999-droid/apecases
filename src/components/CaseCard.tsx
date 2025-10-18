'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarIcon } from '@/components/icons/StarIcon';
import type { Case } from '@/lib/types';
import { cn } from '@/lib/utils';

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
         <div className="aspect-square relative overflow-hidden rounded-t-xl">
          <Image
            src={caseData.image}
            alt={caseData.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={caseData.imageHint}
          />
        </div>
      </CardContent>
      
      <CardFooter className="p-2 flex flex-col items-start bg-card rounded-b-xl">
        <h3 className="font-semibold text-base text-foreground mb-2 px-1">{caseData.name}</h3>
        
        {isFree ? (
           <div className="w-full text-center py-2 bg-muted rounded-lg text-sm font-mono text-yellow-400">
             01:40:23
           </div>
        ) : (
            <Button onClick={onOpen} className="w-full font-bold group" size="lg">
                <div className="flex items-center justify-center gap-2">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    <span>{formatPrice(caseData.price)}</span>
                </div>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
