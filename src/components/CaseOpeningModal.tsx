'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import type { Case, Item } from '@/lib/types';
import { ALL_ITEMS } from '@/lib/data';
import { cn } from '@/lib/utils';
import { StarIcon } from './icons/StarIcon';

interface CaseOpeningModalProps {
  caseData: Case | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const RARITY_COLORS = {
  Common: 'text-gray-400 border-gray-600',
  Uncommon: 'text-green-400 border-green-600',
  Rare: 'text-blue-400 border-blue-600',
  Epic: 'text-purple-400 border-purple-600',
  Legendary: 'text-orange-400 border-orange-600',
  NFT: 'bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 border-purple-500',
};

const selectItem = (currentCase: Case): Item => {
  const rand = Math.random();
  let cumulativeProbability = 0;
  for (const { itemId, probability } of currentCase.items) {
    cumulativeProbability += probability;
    if (rand < cumulativeProbability) {
      const foundItem = ALL_ITEMS.find(i => i.id === itemId);
      if (!foundItem) continue;
      return foundItem;
    }
  }
  // Fallback to the first item
  return ALL_ITEMS.find(i => i.id === currentCase.items[0].itemId)!;
};

export function CaseOpeningModal({ caseData, isOpen, onOpenChange }: CaseOpeningModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonItem, setWonItem] = useState<Item | null>(null);
  const { user, updateBalance, addInventoryItem, updateSpending } = useUser();
  const { toast } = useToast();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });

  const reelItems = React.useMemo(() => [...ALL_ITEMS, ...ALL_ITEMS, ...ALL_ITEMS].sort(() => 0.5 - Math.random()), []);

  const handleOpenCase = useCallback(() => {
    if (!caseData || !user || user.balance.stars < caseData.price || !emblaApi) return;

    setIsSpinning(true);
    setWonItem(null);
    updateBalance(-caseData.price, 0);
    updateSpending(caseData.price);

    const prize = selectItem(caseData);
    const prizeIndexInReel = reelItems.findIndex(item => item.id === prize.id);
    
    // Animate the carousel
    const targetIndex = prizeIndexInReel + ALL_ITEMS.length; // Target the middle set for a better loop feel
    emblaApi.scrollTo(targetIndex, false);
    
    const spinTime = 3000 + Math.random() * 1000;
    
    const startTime = Date.now();
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < spinTime) {
        emblaApi.scrollNext();
        requestAnimationFrame(animate);
      } else {
        emblaApi.scrollTo(targetIndex);
        setTimeout(() => {
          setIsSpinning(false);
          setWonItem(prize);
          addInventoryItem(prize);
          toast({
            title: `You won: ${prize.name}!`,
            description: "It has been added to your inventory.",
          });
        }, 500); // Wait for carousel to settle
      }
    };
    requestAnimationFrame(animate);

  }, [caseData, user, emblaApi, updateBalance, updateSpending, addInventoryItem, toast, reelItems]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setWonItem(null);
      setIsSpinning(false);
      emblaApi?.scrollTo(0, true);
    }, 300); // delay reset to allow for close animation
  };

  if (!caseData) return null;

  const canAfford = user ? user.balance.stars >= caseData.price : false;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open ? handleClose() : onOpenChange(open)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{caseData.name}</DialogTitle>
        </DialogHeader>
        
        <div className="my-6">
          {wonItem ? (
             <div className="flex flex-col items-center gap-4 animate-in fade-in-50 zoom-in-95">
                <Card className={cn("p-4 border-2 w-48 h-48", RARITY_COLORS[wonItem.rarity])}>
                  <CardContent className="p-0 aspect-square relative">
                     <Image src={wonItem.image} alt={wonItem.name} fill sizes="20vw" className="object-contain" data-ai-hint={wonItem.imageHint} />
                  </CardContent>
                </Card>
                <div className="text-center">
                  <h3 className={cn("text-xl font-bold", RARITY_COLORS[wonItem.rarity])}>{wonItem.name}</h3>
                  <p className={cn("font-semibold", RARITY_COLORS[wonItem.rarity])}>{wonItem.rarity}</p>
                </div>
             </div>
          ) : (
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {reelItems.map((item, index) => (
                  <div key={index} className="flex-[0_0_8rem] mx-2">
                    <Card className={cn("p-2 border-2", RARITY_COLORS[item.rarity], isSpinning ? '' : 'opacity-30')}>
                      <div className="aspect-square relative">
                        <Image src={item.image} alt={item.name} fill sizes="10vw" className="object-contain" data-ai-hint={item.imageHint}/>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          {wonItem ? (
            <Button onClick={handleClose} className="w-full">Close</Button>
          ) : (
            <Button onClick={handleOpenCase} disabled={isSpinning || !canAfford} className="w-full">
              {isSpinning ? 'Opening...' : (
                <div className="flex items-center gap-2">
                  <span>Open for</span>
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <span>{caseData.price}</span>
                </div>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
