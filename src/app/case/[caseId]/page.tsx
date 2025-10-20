
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

const ROULETTE_ITEMS_COUNT = 50;
const WINNING_ITEM_INDEX = ROULETTE_ITEMS_COUNT - 5;
const ANIMATION_DURATION_MS = 5000;

export default function CasePage() {
    const params = useParams();
    const router = useRouter();
    const { user, isUserLoading, updateBalance, addInventoryItem } = useUser();
    const { showAlert } = useAlertDialog();
    const { t } = useTranslation();

    const caseId = params.caseId as string;
    
    const [caseData, setCaseData] = useState<Case | null>(null);
    const [caseItems, setCaseItems] = useState<Item[]>([]);
    const [rouletteItems, setRouletteItems] = useState<Item[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rouletteOffset, setRouletteOffset] = useState(0);
    const [wonItem, setWonItem] = useState<Item | null>(null);
    const [isWinModalOpen, setIsWinModalOpen] = useState(false);
    
    const rouletteContainerRef = useRef<HTMLDivElement>(null);
    const itemWidthRef = useRef(128); // Default width (w-32)

    const generateInitialReel = useCallback((items: Item[]): Item[] => {
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
        if (caseItems.length > 0 && rouletteItems.length === 0) {
             setRouletteItems(generateInitialReel(caseItems));
             setRouletteOffset(0);
        }
    }, [caseItems, generateInitialReel, rouletteItems.length]);

    useEffect(() => {
        const calculateItemWidth = () => {
            if (rouletteContainerRef.current) {
                const itemEl = rouletteContainerRef.current.querySelector('.roulette-item');
                if (itemEl) {
                    const style = window.getComputedStyle(itemEl);
                    const width = itemEl.clientWidth;
                    const gap = parseInt(style.marginRight, 10) || 16; // from gap-4 (1rem = 16px)
                    itemWidthRef.current = width + gap;
                }
            }
        };
        
        calculateItemWidth();
        window.addEventListener('resize', calculateItemWidth);
        return () => window.removeEventListener('resize', calculateItemWidth);
    }, []);

    useEffect(() => {
        if (!isSpinning || !wonItem || caseItems.length === 0) {
            return;
        }

        const newReel = generateInitialReel(caseItems);
        newReel[WINNING_ITEM_INDEX] = wonItem; 
        setRouletteItems(newReel);

        const containerWidth = rouletteContainerRef.current?.offsetWidth || 0;
        const jitter = (Math.random() - 0.5) * (itemWidthRef.current * 0.8);
        const targetOffset = (WINNING_ITEM_INDEX * itemWidthRef.current) - (containerWidth / 2) + (itemWidthRef.current / 2) + jitter;
        
        const animationTimeout = setTimeout(() => {
            setRouletteOffset(targetOffset);
        }, 100);

        const modalTimeout = setTimeout(() => {
            setIsWinModalOpen(true);
        }, ANIMATION_DURATION_MS + 500);
        
        return () => {
            clearTimeout(animationTimeout);
            clearTimeout(modalTimeout);
        };
    }, [isSpinning, wonItem, caseItems, generateInitialReel]);

    const handleSpin = useCallback(async () => {
        if (isSpinning || !caseData || !user || caseItems.length === 0) return;

        if (user.balance.stars < caseData.price) {
            showAlert({ title: t('casePage.errorInsufficientFunds'), description: "" });
            return;
        }

        const randomNumber = Math.random();
        let cumulativeProbability = 0;
        let prize: Item | undefined;
        const sortedCaseItemsByProb = [...caseData.items].sort((a, b) => a.probability - b.probability);
        for (const caseItem of sortedCaseItemsByProb) {
            cumulativeProbability += caseItem.probability;
            if (randomNumber <= cumulativeProbability) {
                prize = caseItems.find(item => item.id === caseItem.itemId);
                break;
            }
        }
        if (!prize) {
            prize = caseItems.find(item => item.id === sortedCaseItemsByProb[0].itemId);
        }
        if (!prize) {
            showAlert({ title: t('casePage.errorCouldNotDeterminePrize'), description: "" });
            return;
        }
        
        updateBalance(-caseData.price);
        addInventoryItem(prize);
        
        setWonItem(prize);
        setIsSpinning(true);

    }, [caseData, user, caseItems, isSpinning, showAlert, updateBalance, addInventoryItem, t]);

    const closeModal = () => {
        setIsWinModalOpen(false);
        setIsSpinning(false);
        setWonItem(null);
        
        setTimeout(() => {
            if (rouletteContainerRef.current) {
                rouletteContainerRef.current.style.transition = 'none';
                setRouletteOffset(0); 
                if (caseItems.length > 0) {
                     const newReel = generateInitialReel(caseItems);
                     setRouletteItems(newReel);
                }
            }
        }, 500); 
    }
    
    if (!caseData || isUserLoading || caseItems.length === 0 || rouletteItems.length === 0) {
        return (
            <div className="flex flex-col h-full">
                 <div className="flex items-center justify-between mb-4 flex-shrink-0">
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

    return (
        <div className="flex flex-col h-full text-white">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">{t('casePage.rouletteTitle')}</h1>
                <div className="w-10"></div>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center">
                <div ref={rouletteContainerRef} className="relative w-full flex flex-col items-center justify-center my-4 sm:my-8">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white z-10"></div>
                    
                    <div className="w-full h-28 sm:h-32 md:h-36 overflow-hidden">
                        <div 
                            className="flex h-full items-center gap-4"
                            style={{
                                transform: `translateX(-${rouletteOffset}px)`,
                                transition: isSpinning ? `transform ${ANIMATION_DURATION_MS}ms cubic-bezier(0.2, 0.5, 0.1, 1)` : 'none',
                            }}
                        >
                            {rouletteItems.map((item, index) => (
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
                    
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white z-10"></div>
                </div>

                <div className="w-full mt-auto flex-shrink-0 px-4">
                     <Button 
                        onClick={handleSpin}
                        disabled={isSpinning} 
                        className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
                        size="lg"
                    >
                       <div className="flex items-center justify-center gap-2">
                           <span>{`${t('casePage.spinButton')} ${caseData.price}`}</span>
                           <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={24} height={24} className="h-6 w-6 object-contain" />
                       </div>
                    </Button>
                    <div className="mt-4">
                        <GiftsInside />
                    </div>
                </div>
            </div>

             <Dialog open={isWinModalOpen} onOpenChange={(isOpen) => !isOpen && closeModal()}>
                <DialogContent className="max-w-[90vw] sm:max-w-xs text-center p-0 rounded-2xl" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-2xl font-bold">{t('casePage.winModalTitle')}</DialogTitle>
                    </DialogHeader>
                    {wonItem && (
                     <div className="flex flex-col items-center gap-4 py-2">
                        <Card className="p-4 flex flex-col items-center justify-center w-40 h-40 border-0 shadow-lg bg-card">
                           <div className="aspect-square relative w-32 h-32">
                               <Image src={wonItem.image} alt={wonItem.name} fill sizes="30vw" className="object-contain drop-shadow-lg" data-ai-hint={wonItem.imageHint} />
                           </div>
                        </Card>
                         <div>
                            <p className="text-lg font-bold">{wonItem.name}</p>
                            <p className="text-sm font-bold text-muted-foreground">{wonItem.rarity}</p>
                        </div>
                     </div>
                     )}
                    <DialogDescription className="text-base text-muted-foreground px-6">
                        {t('casePage.winModalDescription')}{' '}
                        <button className="text-primary underline" onClick={() => { closeModal(); router.push('/inventory'); }}>
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
