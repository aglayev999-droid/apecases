'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Case } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import React, { useState, useEffect } from 'react';

interface CaseCardProps {
  caseData: Case;
  onOpen: () => void;
}

const formatDuration = (totalSeconds: number) => {
  if (totalSeconds <= 0) return "00:00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export function CaseCard({ caseData, onOpen }: CaseCardProps) {
  const { lastFreeCaseOpen } = useUser();
  const [cooldownTime, setCooldownTime] = useState<number>(0);

  const isFree = caseData.price === 0;

  useEffect(() => {
    if (isFree && lastFreeCaseOpen && caseData.freeCooldownSeconds) {
      const updateCooldown = () => {
        const now = new Date();
        const endTime = new Date(lastFreeCaseOpen.getTime() + caseData.freeCooldownSeconds! * 1000);
        const remainingSeconds = Math.max(0, (endTime.getTime() - now.getTime()) / 1000);
        setCooldownTime(remainingSeconds);
      };

      updateCooldown();
      const interval = setInterval(updateCooldown, 1000);
      return () => clearInterval(interval);
    }
  }, [isFree, lastFreeCaseOpen, caseData.freeCooldownSeconds]);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const caseIdNumber = caseData.id.split('-').pop();
  const canOpenFreeCase = isFree && cooldownTime <= 0;

  return (
    <Card className="flex flex-col group overflow-hidden bg-card shadow-lg rounded-xl p-3 relative text-white border-2 border-card">
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
      
      <CardFooter className="p-0 flex flex-col items-start mt-auto space-y-2">
        <div className="flex justify-between items-center w-full">
          <h3 className="font-semibold text-sm uppercase truncate">{caseData.name}</h3>
          {caseIdNumber && <span className="text-xs text-muted-foreground font-semibold">#{caseIdNumber}</span>}
        </div>
        
        {isFree ? (
           <>
            {canOpenFreeCase ? (
              <Button onClick={onOpen} variant="default" className="w-full font-bold h-auto py-2.5 bg-blue-600 hover:bg-blue-700 text-base">
                Open
              </Button>
            ) : (
              <div className="w-full text-center py-2.5 text-sm font-mono text-gray-400 tracking-wider">
                {formatDuration(cooldownTime)}
              </div>
            )}
           </>
        ) : (
            <Button onClick={onOpen} variant="default" className="w-full font-bold h-auto py-2.5 bg-blue-600 hover:bg-blue-700 text-base" size="lg">
                <div className="flex items-center justify-center gap-1">
                    <span>{formatPrice(caseData.price)}</span>
                    <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={20} height={20} className="h-5 w-5 object-contain" />
                </div>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
