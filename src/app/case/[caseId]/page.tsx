'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Gift } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useUser } from '@/contexts/UserContext';
import { useAlertDialog } from '@/contexts/AlertDialogContext';
import type { Case, Item } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MOCK_CASES, ALL_ITEMS as MOCK_ITEMS } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

const ROULETTE_ITEMS_COUNT = 51; // Should be an odd number
const WINNING_ITEM_INDEX = Math.floor(ROULETTE_ITEMS_COUNT / 2); // Center item
const ANIMATION_DURATION_MS = 5000;

// These should match Tailwind classes w-24/sm:w-28/md:w-32 and gap-2/sm:gap-4
const ITEM_SIZES = {
    mobile: 96,
    sm: 112,
    md: 128
};
const GAP_SIZES = {
    mobile: 8,
    sm: 16,
    md: 16
};

export default function CasePage() {
    const params = useParams();
    const router = useRouter();
    const { user, isUserLoading, updateBalance, addInventoryItem, updateStarsSpent } = useUser();
    const { showAlert } = useAlertDialog();
    const { t } = useTranslation();

    const caseId = params.caseId as string;
    
    const [caseData, setCaseData] = useState<Case | null>(null);
    const [caseItems, setCaseItems] = useState<Item[]>([]);
    const [rouletteItems, setRouletteItems] = useState<Item[][]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rouletteOffsets, setRouletteOffsets] = useState<number[]>([]);
    const [wonItems, setWonItems] = useState<Item[]>([]);
    const [isWinModalOpen, setIsWinModalOpen] = useState(false);
    const [multiplier, setMultiplier] = useState(1);
    
    const itemWidthRef = useRef(ITEM_SIZES.md + GAP_SIZES.md);

    const generateReel = useCallback((items: Item[]): Item[] => {
        if (!items || items.length === 0) return [];
        return Array.from({ length: ROULETTE_ITEMS_COUNT }, () => 
            items[Math.floor(Math.random() * items.length)]
        );
    }, []);

    useEffect(() => {
        const fetchCaseAndItemsData = async () => {
            if (!caseId) return;
            const caseResult: Case | null = MOCK_CASES.find(c => c.id === caseId) || null;
            if (!caseResult) {
                showAlert({title: t('casePage.errorCaseNotFound'), description: ""});
                router.push('/');
                return;
            }
            setCaseData(caseResult);
            const currentCaseItems = caseResult.items
                .map(i => MOCK_ITEMS.find(item => item.id === i.itemId))
                .filter((item): item is Item => !!item)
                .sort((a, b) => a.value - b.value);
            if (currentCaseItems.length === 0) {
                showAlert({title: t('casePage.errorNoItems'), description: ""});
                return;
            }
            setCaseItems(currentCaseItems);
        };
        fetchCaseAndItemsData();
    }, [caseId, router, showAlert, t]);
    
    useEffect(() => {
        if (caseItems.length > 0) {
             const newReels = Array.from({ length: multiplier }, () => generateReel(caseItems));
             setRouletteItems(newReels);
             setRouletteOffsets(new Array(multiplier).fill(0));
        }
    }, [caseItems, generateReel, multiplier]);

     useEffect(() => {
        const calculateItemWidth = () => {
            const screenWidth = window.innerWidth;
            if (screenWidth < 640) { // Tailwind 'sm' breakpoint
                itemWidthRef.current = ITEM_SIZES.mobile + GAP_SIZES.mobile;
            } else if (screenWidth < 768) { // Tailwind 'md' breakpoint
                itemWidthRef.current = ITEM_SIZES.sm + GAP_SIZES.sm;
            } else {
                itemWidthRef.current = ITEM_SIZES.md + GAP_SIZES.md;
            }
        };
        
        calculateItemWidth();
        window.addEventListener('resize', calculateItemWidth);
        return () => window.removeEventListener('resize', calculateItemWidth);
    }, []);

    const startSpin = (prizes: Item[]) => {
        if (isSpinning || prizes.length === 0 || caseItems.length === 0) return;

        const newReels = prizes.map(prize => {
            const newReel = generateReel(caseItems);
            newReel[WINNING_ITEM_INDEX] = prize;
            return newReel;
        });

        setRouletteItems(newReels);
        setWonItems(prizes);
        setIsSpinning(true);
        
        setTimeout(() => {
            const finalOffsets = newReels.map(() => {
                const jitter = (Math.random() - 0.5) * (itemWidthRef.current * 0.8);
                // Offset is to the center of the winning item, minus half the item width to center it
                const targetPosition = WINNING_ITEM_INDEX * itemWidthRef.current;
                return targetPosition + jitter;
            });

            setRouletteOffsets(finalOffsets);

            setTimeout(() => {
                setIsWinModalOpen(true);
            }, ANIMATION_DURATION_MS + 500);

        }, 100); // Small delay to ensure state is updated before animation starts
    };
    
    const getPrize = useCallback(() => {
        if (!caseData || caseItems.length === 0) return null;
        
        const randomNumber = Math.random();
        let cumulativeProbability = 0;
        const sortedCaseItemsByProb = [...caseData.items].sort((a, b) => a.probability - b.probability);
        
        for (const caseItem of sortedCaseItemsByProb) {
            cumulativeProbability += caseItem.probability;
            if (randomNumber <= cumulativeProbability) {
                return caseItems.find(item => item.id === caseItem.itemId) || null;
            }
        }
        return caseItems.find(item => item.id === sortedCaseItemsByProb[0].itemId) || null;

    }, [caseData, caseItems]);


    const handleSpin = useCallback(async () => {
        if (isSpinning || !caseData || !user || caseItems.length === 0) return;

        const totalCost = caseData.price * multiplier;
        if (user.balance.stars < totalCost) {
            showAlert({ title: t('casePage.errorInsufficientFunds'), description: "" });
            return;
        }
        
        const prizes: Item[] = [];
        for (let i = 0; i < multiplier; i++) {
            const prize = getPrize();
            if (prize) {
                prizes.push(prize);
            } else {
                 showAlert({ title: t('casePage.errorCouldNotDeterminePrize'), description: "" });
                 return;
            }
        }
        
        updateBalance(-totalCost);
        updateStarsSpent(totalCost);
        prizes.forEach(prize => addInventoryItem(prize));
        
        startSpin(prizes);

    }, [caseData, user, caseItems, isSpinning, showAlert, updateBalance, addInventoryItem, t, multiplier, getPrize, updateStarsSpent]);

    const closeModal = () => {
        setIsWinModalOpen(false);
        setIsSpinning(false);
        setWonItems([]);
        
        // Reset reels to a random state without animation
        if (caseItems.length > 0) {
             const newReels = Array.from({ length: multiplier }, () => generateReel(caseItems));
             setRouletteItems(newReels);
        }
        setRouletteOffsets(new Array(multiplier).fill(0));
    }
    
    if (!caseData || isUserLoading || caseItems.length === 0) {
        return (
            <div className="flex flex-col h-full">
                 <div className="flex items-center justify-between mb-4 flex-shrink-0 px-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Skeleton className="h-6 w-32" />
                    <div className="w-10"></div>
                </div>
                 <div className="flex-grow flex items-center justify-center">
                    <p className="text-muted-foreground">{t('casePage.loadingCase')}</p>
                </div>
            </div>
        );
    }
    
    const GiftsInside = () => (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="[&[data-state=open]>svg]:rotate-180 justify-center gap-2 text-muted-foreground hover:no-underline font-bold py-3 rounded-lg bg-card/80 transition-colors">
            <Gift className="h-5 w-5" />
            <span>{t('casePage.giftsInside')}</span>
          </AccordionTrigger>
          <AccordionContent className="bg-card/80 p-4 rounded-b-lg">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {caseItems.map(item => (
                  <Card key={item.id} className="p-1.5 flex flex-col items-center justify-between border-0 bg-transparent">
                    <div className="aspect-square relative w-full h-full">
                      <Image src={item.image} alt={item.name} fill sizes="15vw" className="object-contain p-1" data-ai-hint={item.imageHint} />
                    </div>
                    <div className="text-center w-full mt-1">
                        <p className="text-xs font-bold truncate">{item.name}</p>
                        <div className="flex items-center justify-center gap-1 text-xs text-amber-400">
                            <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={12} height={12} className="h-3 w-3 object-contain" />
                            <span>{item.value}</span>
                        </div>
                    </div>
                  </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    
    const MultiplierControls = () => (
        <div className="flex items-center gap-2">
            {[1, 2, 3].map(m => (
                 <Button 
                    key={m}
                    variant={multiplier === m ? 'secondary' : 'ghost'} 
                    className={cn('font-bold', multiplier === m && 'text-primary border-primary')}
                    onClick={() => !isSpinning && setMultiplier(m)}
                >
                    x{m}
                </Button>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col h-full text-white">
             <div className="flex items-center justify-between mb-4 flex-shrink-0 px-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">{t('casePage.rouletteTitle')}</h1>
                <MultiplierControls />
            </div>

            <div className="flex-grow flex flex-col items-center justify-center">
                 <div className="relative w-full flex flex-col items-center justify-center my-4 sm:my-8 gap-2">
                    {rouletteItems.map((reel, reelIndex) => (
                        <div key={reelIndex} className="relative w-full flex items-center justify-center">
                           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white z-10"></div>
                            
                            <div className="w-full h-28 sm:h-32 md:h-36 overflow-hidden">
                                <div 
                                    className="flex h-full items-center gap-2 sm:gap-4"
                                    style={{
                                        // The calculation now centers the list on the target item
                                        transform: `translateX(calc(50% - ${rouletteOffsets[reelIndex] || 0}px - ${itemWidthRef.current / 2}px))`,
                                        transition: isSpinning ? `transform ${ANIMATION_DURATION_MS}ms cubic-bezier(0.2, 0.5, 0.1, 1)` : 'none',
                                    }}
                                >
                                    {reel.map((item, index) => (
                                        <div 
                                            key={`${item.id}-${index}`}
                                            className="roulette-item flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32"
                                        >
                                             <Card className="p-2 flex flex-col items-center justify-center w-full h-full border-0 bg-card/80">
                                                <div className="aspect-square relative w-full h-full">
                                                    <Image src={item.image} alt={item.name} fill sizes="20vw" className="object-contain p-1" data-ai-hint={item.imageHint} />
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-white z-10"></div>
                        </div>
                    ))}
                </div>


                <div className="w-full mt-auto flex-shrink-0 px-4">
                     <Button 
                        onClick={handleSpin}
                        disabled={isSpinning} 
                        className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
                        size="lg"
                    >
                       <div className="flex items-center justify-center gap-2">
                           <span>{`${t('casePage.spinButton')} ${caseData.price * multiplier}`}</span>
                           <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={24} height={24} className="h-6 w-6 object-contain" />
                       </div>
                    </Button>
                    <div className="mt-4">
                        <GiftsInside />
                    </div>
                </div>
            </div>

            <Dialog open={isWinModalOpen} onOpenChange={(isOpen) => !isOpen && closeModal()}>
                <DialogContent className="max-w-md w-[90vw] text-center p-0 rounded-2xl" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-2xl font-bold">{t('casePage.winModalTitle')}</DialogTitle>
                    </DialogHeader>
                    {wonItems.length > 0 && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-6 py-2 max-h-[50vh] overflow-y-auto">
                        {wonItems.map((item, index) => (
                            <div key={index} className="flex flex-col items-center gap-2">
                                <Card className="p-2 flex flex-col items-center justify-center w-28 h-28 border-0 shadow-lg bg-card">
                                   <div className="aspect-square relative w-24 h-24">
                                       <Image src={item.image} alt={item.name} fill sizes="20vw" className="object-contain drop-shadow-lg" data-ai-hint={item.imageHint} />
                                   </div>
                                </Card>
                                 <div>
                                    <p className="text-base font-bold">{item.name}</p>
                                    <p className="text-xs font-bold text-muted-foreground">{item.rarity}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                     )}
                    <DialogDescription className="text-base text-muted-foreground px-6 py-4">
                        {t('casePage.winModalDescription')}{' '}
                        <button className="text-primary underline" onClick={() => { closeModal(); router.push('/profile'); }}>
                            {t('casePage.winModalInventoryLink')}
                        </button>
                        .
                    </DialogDescription>
                     <DialogFooter className="p-4">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" onClick={closeModal}>{t('casePage.winModalContinue')}</Button>
                     </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
