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
  const caseIdNumber = caseData.id.split('-').pop();

  return (
    <Card className="flex flex-col group overflow-hidden bg-gray-800 shadow-lg rounded-xl p-3 relative">
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
        <div className="flex justify-between items-center w-full mb-2">
          <h3 className="font-semibold text-sm uppercase text-gray-200 truncate">{caseData.name}</h3>
          {caseIdNumber && <span className="text-xs text-gray-500 font-semibold">#{caseIdNumber}</span>}
        </div>
        
        {isFree ? (
           <div className="w-full text-center py-2 bg-gray-700 rounded-xl text-sm font-mono text-yellow-400 tracking-wider">
             01:40:23
           </div>
        ) : (
            <Button onClick={onOpen} className="w-full font-bold group bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-xl text-md" size="lg">
                <div className="flex items-center justify-center gap-1">
                    <span>{formatPrice(caseData.price)}</span>
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                </div>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
