'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <Card className="flex flex-col group overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-300">
      <CardHeader className="p-0">
        <div className="aspect-[4/3] relative overflow-hidden">
          <Image
            src={caseData.image}
            alt={caseData.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={caseData.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <CardTitle className="absolute bottom-4 left-4 text-2xl font-bold text-white">
            {caseData.name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        {/* Can add a short description here if needed */}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={onOpen} className="w-full font-bold group" size="lg" variant="default">
          <div className="flex items-center justify-center gap-2">
            <span>Open for</span>
            <div className="flex items-center gap-1.5">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span>{formatPrice(caseData.price)}</span>
            </div>
          </div>
        </Button>
      </CardFooter>
    </Card>
  );
}
