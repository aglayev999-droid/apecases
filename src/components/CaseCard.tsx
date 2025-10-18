'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarIcon } from '@/components/icons/StarIcon';
import type { Case } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
    <Card className="flex flex-col group overflow-hidden bg-card shadow-lg rounded-xl p-3 relative">
      <Badge variant="secondary" className="absolute top-2 right-2 text-xs text-muted-foreground">#{caseData.id.split('-')[1].substring(0,2)}</Badge>
      <CardContent className="p-0 relative mb-2">
         <div className="aspect-square relative overflow-hidden rounded-lg">
          <Image
            src={caseData.image}
            alt={caseData.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={caseData.imageHint}
          />
        </div>
      </CardContent>
      
      <CardFooter className="p-0 flex flex-col items-start mt-auto">
        <h3 className="font-semibold text-sm uppercase text-gray-200 mb-2 truncate">{caseData.name}</h3>
        
        {isFree ? (
           <div className="w-full text-center py-2 bg-muted rounded-xl text-sm font-mono text-yellow-400 tracking-wider">
             01:40:23
           </div>
        ) : (
            <Button onClick={onOpen} className="w-full font-bold group bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-xl text-md" size="lg">
                <div className="flex items-center justify-center gap-1">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    <span>{formatPrice(caseData.price)}</span>
                </div>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
