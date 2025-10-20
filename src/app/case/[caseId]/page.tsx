'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Gift } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useUser } from '@/contexts/UserContext';
import { useAlertDialog } from '@/contexts/AlertDialogContext';
import type { Case, Item } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MOCK_CASES, ALL_ITEMS as MOCK_ITEMS } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const ROULETTE_ITEMS_COUNT = 50; // Total items in the reel
const WINNING_ITEM_INDEX = ROULETTE_ITEMS_COUNT - 4; // Prize will be placed here

export default function CasePage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const firestore = useFirestore();

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [caseItems, setCaseItems] = useState<Item[]>([]);
    const [rouletteItems, setRouletteItems] = useState<Item[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [isFastSpin, setIsFastSpin] = useState(false);
    const [rouletteOffset, setRouletteOffset] = useState(0);
    const [wonItem, setWonItem] = useState<Item | null>(null);
    const [isWinModalOpen, setIsWinModalOpen] = useState(false);
    const [rouletteItemWidth, setRouletteItemWidth] = useState(144); // Default: 128px (w-32) + 16px (gap-4)

    const rouletteContainerRef = useRef<HTMLDivElement>(null);
    const rouletteItemRef = useRef<HTMLDivElement>(null);

    const { user, isUserLoading, updateBalance, addInventoryItem } = useUser();
    const { showAlert } = useAlertDialog();

    useEffect(() => {
        const calculateItemWidth = () => {
            if (rouletteItemRef.current) {
                const style = window.getComputedStyle(rouletteItemRef.current);
                const width = rouletteItemRef.current.offsetWidth;
                const marginLeft = parseFloat(style.marginLeft);
                const marginRight = parseFloat(style.marginRight);
                 const gap = 16; // from gap-4
                setRouletteItemWidth(width + gap);
            }
        };

        calculateItemWidth();
        window.addEventListener('resize', calculateItemWidth);
        return () => window.removeEventListener('resize', calculateItemWidth);
    }, []);

    const generateInitialReel = useCallback((items: Item[]) => {
        if (items.length === 0) return [];
        const reel: Item[] = [];
        for (let i = 0; i < ROULETTE_ITEMS_COUNT; i++) {
            reel.push(items[Math.floor(Math.random() * items.length)]);
        }
        return reel;
    }, []);

    const generateRouletteReelWithPrize = useCallback((prize: Item, currentCaseItems: Item[]) => {
        if (currentCaseItems.length === 0) return [];
        const reel: Item[] = Array.from({ length: ROULETTE_ITEMS_COUNT }, () => 
            currentCaseItems[Math.floor(Math.random() * currentCaseItems.length)]
        );
        reel[WINNING_ITEM_INDEX] = prize; 
        return reel;
    }, []);

    useEffect(() => {
        const fetchCaseAndItemsData = async () => {
            let caseResult: Case | null = null;
            if (firestore) {
                try {
                    const caseSnap = await getDoc(doc(firestore, 'cases', caseId));
                    if (caseSnap.exists()) {
                        caseResult = { ...caseSnap.data(), id: caseSnap.id } as Case;
                    }
                } catch (e) { console.error("Error fetching case from FS:", e); }
            }
            if (!caseResult) {
                caseResult = MOCK_CASES.find(c => c.id === caseId) || null;
            }
            
            if(caseResult) {
                setCaseData(caseResult);
                 const currentCaseItems = caseResult.items
                    .map(i => MOCK_ITEMS.find(item => item.id === i.itemId))
                    .filter((item): item is Item => !!item)
                    .sort((a, b) => a.value - b.value);
                setCaseItems(currentCaseItems);
                setRouletteItems(generateInitialReel(currentCaseItems));
            } else {
                showAlert({title: "Error", description: "Case not found."});
                router.push('/');
            }
        };

        if (caseId) {
            fetchCaseAndItemsData();
        }
    }, [caseId, firestore, router, showAlert, generateInitialReel]);
    
    const handleSpin = useCallback(async (isFast: boolean) => {
        if (isSpinning || !caseData || !user || caseItems.length === 0 || rouletteItemWidth === 0) return;

        if (user.balance.stars < caseData.price) {
            showAlert({ title: "Insufficient funds", description: "You do not have enough stars to open this case." });
            return;
        }

        setIsFastSpin(isFast);
        setIsSpinning(true);

        // --- Prize Selection Logic ---
        const randomNumber = Math.random();
        let cumulativeProbability = 0;
        let prize: Item | undefined;
        // Ensure probabilities sum to ~1. Sort by probability to be safe.
        const sortedCaseItems = [...caseData.items].sort((a, b) => a.probability - b.probability);
        for (const caseItem of sortedCaseItems) {
            cumulativeProbability += caseItem.probability;
            if (randomNumber <= cumulativeProbability) {
                prize = caseItems.find(item => item.id === caseItem.itemId);
                break;
            }
        }
        if (!prize) {
            // Fallback to the most common item if something goes wrong.
            prize = caseItems[0];
        }
        // --- End Prize Selection ---

        if (!prize) {
            showAlert({ title: "Error Opening Case", description: "Could not determine prize. Please try again." });
            setIsSpinning(false);
            return;
        }
        
        updateBalance(-caseData.price);
        addInventoryItem(prize);
        setWonItem(prize);

        const newReel = generateRouletteReelWithPrize(prize, caseItems);
        setRouletteItems(newReel);
        
        setTimeout(() => {
            const containerWidth = rouletteContainerRef.current?.offsetWidth || 0;
            // Jitter adds a random offset to make the stop position feel less robotic
            const jitter = (Math.random() - 0.5) * rouletteItemWidth * 0.8;
            // Calculate the exact offset to center the winning item under the marker
            const targetOffset = (WINNING_ITEM_INDEX * rouletteItemWidth) - (containerWidth / 2) + (rouletteItemWidth / 2) + jitter;
            
            setRouletteOffset(targetOffset);

            const animationDuration = isFast ? 2000 : 5000;
            setTimeout(() => {
                setIsWinModalOpen(true);
            }, animationDuration + 500); 
        }, 100);

    }, [caseData, user, caseItems, isSpinning, showAlert, updateBalance, addInventoryItem, generateRouletteReelWithPrize, rouletteItemWidth]);

    const closeModal = () => {
        setIsWinModalOpen(false);
        setIsSpinning(false);
        setIsFastSpin(false);
        // Reset the reel for the next spin to a random state
        setRouletteItems(generateInitialReel(caseItems));
        setRouletteOffset(0);
        setWonItem(null);
    }
    
    if (!caseData || isUserLoading) {
        return (
            <div className="flex flex-col h-full">
                 <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Skeleton className="h-6 w-32" />
                    <div className="w-10"></div>
                </div>
                 <div className="flex items-center justify-center h-full">
                    <p>Loading case...</p>
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
            {caseItems.length > 0 ? (
                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {caseItems.map(item => (
                      <Card key={item.id} className={cn("p-1.5 flex flex-col items-center justify-between border-2 bg-transparent")}>
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
            ) : (
                <div className="text-center text-muted-foreground py-4">No items found for this case.</div>
            )}
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
                    
                    <div className="w-full h-36 overflow-hidden">
                        <div 
                            className="flex h-full items-center gap-4"
                            style={{
                                transform: `translateX(-${rouletteOffset}px)`,
                                transition: isSpinning ? `transform ${isFastSpin ? '2s' : '5s'} cubic-bezier(0.2, 0.5, 0.1, 1)` : 'none',
                            }}
                        >
                            {rouletteItems.map((item, index) => (
                                <div 
                                    key={index}
                                    ref={index === 0 ? rouletteItemRef : null}
                                    className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32"
                                >
                                     <Card className={cn("p-2 flex flex-col items-center justify-center w-full h-full border-2")}>
                                        <div className="aspect-square relative w-20 h-20 sm:w-24 sm:h-24">
                                            <Image src={item.image} alt={item.name} fill sizes="20vw" className="object-contain" data-ai-hint={item.imageHint} />
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
                        onClick={() => handleSpin(false)}
                        onDoubleClick={() => handleSpin(true)}
                        disabled={isSpinning} 
                        className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
                        size="lg"
                    >
                       <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center justify-center gap-2">
                                <span>{`Крутить ${caseData.price}`}</span>
                                <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={24} height={24} className="h-6 w-6 object-contain" />
                            </div>
                             <span className="text-xs font-normal text-primary-foreground/70">(Двойное нажатие для быстрого вращения)</span>
                       </div>
                    </Button>
                    <div className="mt-4">
                        <GiftsInside />
                    </div>
                </div>
            </div>

             <Dialog open={isWinModalOpen} onOpenChange={(isOpen) => !isOpen && closeModal()}>
                <DialogContent className="max-w-xs text-center" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Поздравляем с победой!</DialogTitle>
                    </DialogHeader>
                    {wonItem && (
                     <div className="flex flex-col items-center gap-4 py-4">
                        <Card className={cn("p-4 flex flex-col items-center justify-center w-40 h-40 border-2 shadow-lg")}>
                           <div className="aspect-square relative w-32 h-32">
                               <Image src={wonItem.image} alt={wonItem.name} fill sizes="30vw" className="object-contain drop-shadow-lg" data-ai-hint={wonItem.imageHint} />
                           </div>
                        </Card>
                         <div>
                            <p className="text-lg font-bold">{wonItem.name}</p>
                            <p className={cn("text-sm font-bold")}>{wonItem.rarity}</p>
                        </div>
                     </div>
                     )}
                    <DialogDescription className="text-base text-muted-foreground px-4">
                        Все выигранные призы вы можете увидеть у себя в{' '}
                        <Link href="/inventory" className="text-primary underline" onClick={closeModal}>
                            инвентаре
                        </Link>
                        .
                    </DialogDescription>
                     <DialogFooter className="p-4">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" onClick={closeModal}>Продолжить</Button>
                     </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
