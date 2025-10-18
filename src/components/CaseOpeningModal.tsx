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

const RARITY_PROPERTIES = {
  Common: {
    glow: 'shadow-gray-400/50',
    border: 'border-gray-500',
    text: 'text-gray-400',
  },
  Uncommon: {
    glow: 'shadow-green-400/60',
    border: 'border-green-500',
    text: 'text-green-400',
  },
  Rare: {
    glow: 'shadow-blue-400/70',
    border: 'border-blue-500',
    text: 'text-blue-400',
  },
  Epic: {
    glow: 'shadow-purple-400/80',
    border: 'border-purple-500',
    text: 'text-purple-400',
  },
  Legendary: {
    glow: 'shadow-orange-400/90',
    border: 'border-orange-500',
    text: 'text-orange-400',
  },
  NFT: {
    glow: 'shadow-purple-400/90',
    border: 'border-purple-400',
    text: 'bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500',
  },
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
  const { user, updateBalance, addInventoryItem, updateSpending, setLastFreeCaseOpen, lastFreeCaseOpen } = useUser();
  const { toast } = useToast();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });

  const reelItems = React.useMemo(() => [...ALL_ITEMS, ...ALL_ITEMS, ...ALL_ITEMS].sort(() => 0.5 - Math.random()), []);

  const handleOpenCase = useCallback(() => {
    if (!caseData || !user || !emblaApi) return;
    
    const isFree = caseData.price === 0;
    
    if (isFree) {
        if (lastFreeCaseOpen && caseData.freeCooldownSeconds) {
            const now = new Date();
            const endTime = new Date(lastFreeCaseOpen.getTime() + caseData.freeCooldownSeconds * 1000);
            if (now < endTime) {
                toast({ variant: 'destructive', title: "Cooldown active", description: "You can't open this free case yet." });
                return;
            }
        }
    } else {
        if (user.balance.stars < caseData.price) {
          toast({ variant: 'destructive', title: "Not enough stars", description: "You don't have enough stars to open this case." });
          return;
        }
        updateBalance(-caseData.price, 0);
        updateSpending(caseData.price);
    }
    
    setIsSpinning(true);
    setWonItem(null);
    
    if (isFree) {
        setLastFreeCaseOpen(new Date());
    }

    const prize = selectItem(caseData);
    const prizeIndexInReel = reelItems.findIndex(item => item.id === prize.id);
    
    const targetIndex = prizeIndexInReel + ALL_ITEMS.length; // Target the middle set for a better loop feel
    const animationOptions = { duration: 5000, stopOnInteraction: false };

    emblaApi.scrollTo(targetIndex, false, animationOptions);
    
    const spinTime = 4000 + Math.random() * 1000;

    const timeoutId = setTimeout(() => {
      if(emblaApi.selectedScrollSnap() !== targetIndex) {
         emblaApi.scrollTo(targetIndex, true);
      }
      setIsSpinning(false);
      setWonItem(prize);
      addInventoryItem(prize);
      toast({
        title: `You won: ${prize.name}!`,
        description: "It has been added to your inventory.",
      });
    }, spinTime);
    
    return () => clearTimeout(timeoutId);

  }, [caseData, user, emblaApi, updateBalance, updateSpending, addInventoryItem, toast, reelItems, setLastFreeCaseOpen, lastFreeCaseOpen]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setWonItem(null);
      setIsSpinning(false);
      emblaApi?.scrollTo(0, true);
    }, 300); // delay reset to allow for close animation
  };
  
  if (!caseData) return null;

  const isFree = caseData.price === 0;
  let canAfford = user ? user.balance.stars >= caseData.price : false;
  if (isFree) {
    canAfford = true; // Always "can afford" a free case
    if (lastFreeCaseOpen && caseData.freeCooldownSeconds) {
      const now = new Date();
      const endTime = new Date(lastFreeCaseOpen.getTime() + caseData.freeCooldownSeconds * 1000);
      if (now < endTime) {
        canAfford = false; // Cannot open if on cooldown
      }
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open ? handleClose() : onOpenChange(open)}>
      <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{caseData.name}</DialogTitle>
        </DialogHeader>
        
        <div className="my-6 h-48 flex items-center justify-center">
          {wonItem ? (
             <div className="flex flex-col items-center gap-4 animate-in fade-in-50 zoom-in-95">
                <Card className={cn(
                  "p-4 border-2 w-48 h-48 transition-all duration-300", 
                  RARITY_PROPERTIES[wonItem.rarity].border,
                  `shadow-[0_0_25px_-5px]`,
                  RARITY_PROPERTIES[wonItem.rarity].glow
                )}>
                  <CardContent className="p-0 aspect-square relative">
                     <Image src={wonItem.image} alt={wonItem.name} fill sizes="20vw" className="object-contain" data-ai-hint={wonItem.imageHint} />
                  </CardContent>
                </Card>
                <div className="text-center mt-2">
                  <h3 className={cn("text-xl font-bold", RARITY_PROPERTIES[wonItem.rarity].text)}>{wonItem.name}</h3>
                  <p className={cn("font-semibold", RARITY_PROPERTIES[wonItem.rarity].text)}>{wonItem.rarity}</p>
                </div>
             </div>
          ) : (
            <div className="overflow-hidden w-full relative" ref={emblaRef}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-full bg-primary/50 z-10 rounded-full" />
              <div className="flex">
                {reelItems.map((item, index) => (
                  <div key={index} className="flex-[0_0_8rem] mx-2">
                    <Card className={cn("p-2 border-2 bg-card/50", RARITY_PROPERTIES[item.rarity].border, isSpinning ? 'opacity-70' : 'opacity-30')}>
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
                <div className="flex items-center justify-center gap-2">
                  {isFree ? 'Open for Free' : (
                    <>
                      <span>Open for</span>
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span>{caseData.price}</span>
                    </>
                  )}
                </div>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}