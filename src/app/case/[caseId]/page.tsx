
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

const ROULETTE_ITEMS_COUNT = 50;
const WINNING_ITEM_INDEX = ROULETTE_ITEMS_COUNT - 5;
const ANIMATION_DURATION_MS = 5000;

export default function CasePage() {
    const params = useParams();
    const router = useRouter();
    const { user, isUserLoading, updateBalance, addInventoryItem } = useUser();
    const { showAlert } = useAlertDialog();

    const caseId = params.caseId as string;
    
    const [caseData, setCaseData] = useState<Case | null>(null);
    const [caseItems, setCaseItems] = useState<Item[]>([]);
    const [rouletteItems, setRouletteItems] = useState<Item[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rouletteOffset, setRouletteOffset] = useState(0);
    const [wonItem, setWonItem] = useState<Item | null>(null);
    const [isWinModalOpen, setIsWinModalOpen] = useState(false);
    
    // Using refs for widths to avoid re-renders on window resize
    const rouletteContainerRef = useRef<HTMLDivElement>(null);
    const itemWidthRef = useRef(128); // Default width (w-32) + gap (16px)

    const generateInitialReel = useCallback((items: Item[]): Item[] => {
        if (!items || items.length === 0) return [];
        return Array.from({ length: ROULETTE_ITEMS_COUNT }, () => 
            items[Math.floor(Math.random() * items.length)]
        );
    }, []);

    // Effect to load case data
    useEffect(() => {
        const fetchCaseAndItemsData = async () => {
            if (!caseId) return;

            const caseResult: Case | null = MOCK_CASES.find(c => c.id === caseId) || null;
            
            if (!caseResult) {
                showAlert({title: "Error", description: "Case not found."});
                router.push('/');
                return;
            }
            setCaseData(caseResult);

            const currentCaseItems = caseResult.items
                .map(i => MOCK_ITEMS.find(item => item.id === i.itemId))
                .filter((item): item is Item => !!item)
                .sort((a, b) => a.value - b.value);
            
            if (currentCaseItems.length === 0) {
                showAlert({title: "Error", description: "No items found in this case."});
                return;
            }
            setCaseItems(currentCaseItems);
        };

        fetchCaseAndItemsData();
    }, [caseId, router, showAlert]);
    
    // Effect to populate reel when caseItems are ready or when returning to the page
    useEffect(() => {
        if (caseItems.length > 0 && rouletteItems.length === 0) {
             setRouletteItems(generateInitialReel(caseItems));
             setRouletteOffset(0);
        }
    }, [caseItems, generateInitialReel, rouletteItems.length]);

     // Effect to handle responsive width calculation without causing re-renders
    useEffect(() => {
        const calculateItemWidth = () => {
            const itemEl = document.querySelector('.roulette-item');
            if (itemEl) {
                const style = window.getComputedStyle(itemEl);
                const width = itemEl.clientWidth;
                const marginLeft = parseInt(style.marginLeft, 10) || 0;
                const marginRight = parseInt(style.marginRight, 10) || 0;
                const gap = 16; // from gap-4
                itemWidthRef.current = width + gap;
            }
        };

        calculateItemWidth();
        window.addEventListener('resize', calculateItemWidth);
        return () => window.removeEventListener('resize', calculateItemWidth);
    }, []);

    // Main animation effect
    useEffect(() => {
        if (!isSpinning || !wonItem || caseItems.length === 0) {
            return;
        }

        // 1. Create a new reel with the winning item in the correct position
        const newReel = generateInitialReel(caseItems);
        newReel[WINNING_ITEM_INDEX] = wonItem; 
        setRouletteItems(newReel);

        // 2. Calculate the target offset
        const containerWidth = rouletteContainerRef.current?.offsetWidth || 0;
        const jitter = (Math.random() - 0.5) * (itemWidthRef.current * 0.8);
        const targetOffset = (WINNING_ITEM_INDEX * itemWidthRef.current) - (containerWidth / 2) + (itemWidthRef.current / 2) + jitter;
        
        // Use a short timeout to ensure the state update for the reel is rendered before starting the transition
        const animationTimeout = setTimeout(() => {
            setRouletteOffset(targetOffset);
        }, 100);

        // 3. Set a timer to show the win modal after the animation finishes
        const modalTimeout = setTimeout(() => {
            setIsWinModalOpen(true);
        }, ANIMATION_DURATION_MS + 500);
        
        return () => {
            clearTimeout(animationTimeout);
            clearTimeout(modalTimeout);
        };

    }, [isSpinning, wonItem, caseItems]);

    const handleSpin = useCallback(async () => {
        if (isSpinning || !caseData || !user || caseItems.length === 0) return;

        if (user.balance.stars < caseData.price) {
            showAlert({ title: "Insufficient funds", description: "You do not have enough stars to open this case." });
            return;
        }

        // Determine the prize
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
            // Fallback to the first item if something goes wrong
            prize = caseItems.find(item => item.id === sortedCaseItemsByProb[0].itemId);
        }
        if (!prize) {
            showAlert({ title: "Error", description: "Could not determine prize. Please try again." });
            return;
        }
        
        // Update balance and inventory
        updateBalance(-caseData.price);
        addInventoryItem(prize);
        
        // Set the winning item and trigger the animation effect
        setWonItem(prize);
        setIsSpinning(true);

    }, [caseData, user, caseItems, isSpinning, showAlert, updateBalance, addInventoryItem]);

    const closeModal = () => {
        setIsWinModalOpen(false);
        setIsSpinning(false);
        setWonItem(null);
        
        // Use a timeout to reset the reel after the modal has closed
        setTimeout(() => {
            setRouletteOffset(0); 
            if (caseItems.length > 0) {
                 setRouletteItems(generateInitialReel(caseItems));
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
                    <p className="text-muted-foreground">Loading case...</p>
                </div>
            </div>
        );
    }
    
    const GiftsInside = () => (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="[&[data-state=open]>svg]:rotate-180 justify-center gap-2 text-muted-foreground hover:no-underline font-bold py-3 rounded-lg bg-card/80 transition-colors">
            <Gift className="h-5 w-5" />
            <span>Подарки внутри</span>
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
                <h1 className="text-xl font-bold">Roulette</h1>
                <div className="w-10"></div>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center">
                <div ref={rouletteContainerRef} className="relative w-full flex flex-col items-center justify-center my-8">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white z-10"></div>
                    
                    <div className="w-full h-32 sm:h-36 overflow-hidden">
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
                                    className="roulette-item flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32"
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
                           <span>{`Крутить ${caseData.price}`}</span>
                           <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={24} height={24} className="h-6 w-6 object-contain" />
                       </div>
                    </Button>
                    <div className="mt-4">
                        <GiftsInside />
                    </div>
                </div>
            </div>

             <Dialog open={isWinModalOpen} onOpenChange={(isOpen) => !isOpen && closeModal()}>
                <DialogContent className="max-w-[90vw] sm:max-w-xs text-center" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Поздравляем с победой!</DialogTitle>
                    </DialogHeader>
                    {wonItem && (
                     <div className="flex flex-col items-center gap-4 py-4">
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
                    <DialogDescription className="text-base text-muted-foreground px-4">
                        Все выигранные призы вы можете увидеть у себя в{' '}
                        <button className="text-primary underline" onClick={() => { closeModal(); router.push('/inventory'); }}>
                            инвентаre
                        </button>
                        .
                    </DialogDescription>
                     <DialogFooter className="sm:justify-center px-4 pb-4">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" onClick={closeModal}>Продолжить</Button>
                     </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

    