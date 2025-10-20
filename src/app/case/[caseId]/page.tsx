'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Gift } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useUser } from '@/contexts/UserContext';
import { useAlertDialog } from '@/contexts/AlertDialogContext';
import type { Case, Item } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { doc, getDocs, collection, getDoc } from 'firebase/firestore';
import { MOCK_CASES, ALL_ITEMS as MOCK_ITEMS } from '@/lib/data';
import { openCase } from '@/ai/flows/open-case-flow';
import { Skeleton } from '@/components/ui/skeleton';

const RARITY_PROPERTIES: { [key in Item['rarity']]: { glow: string; text: string; bg: string } } = {
    Common: { glow: 'shadow-gray-400/50', text: 'text-gray-400', bg: 'bg-gray-800/20' },
    Uncommon: { glow: 'shadow-green-400/60', text: 'text-green-400', bg: 'bg-green-800/20' },
    Rare: { glow: 'shadow-blue-400/70', text: 'text-blue-400', bg: 'bg-blue-800/20' },
    Epic: { glow: 'shadow-purple-400/80', text: 'text-purple-400', bg: 'bg-purple-800/20' },
    Legendary: { glow: 'shadow-orange-400/90', text: 'text-orange-400', bg: 'bg-orange-800/20' },
    NFT: { glow: 'shadow-purple-400/90', text: 'bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500', bg: 'bg-purple-800/30' },
};

const ROULETTE_ITEM_WIDTH = 144; // 128px width + 16px gap
const ROULETTE_ITEMS_COUNT = 50; // Total items in the reel

export default function CasePage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const firestore = useFirestore();

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [caseItems, setCaseItems] = useState<Item[]>([]);
    const [rouletteItems, setRouletteItems] = useState<Item[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rouletteOffset, setRouletteOffset] = useState(0);
    const [wonItem, setWonItem] = useState<Item | null>(null);
    const [isWinModalOpen, setIsWinModalOpen] = useState(false);

    const { user, updateBalance, isUserLoading } = useUser();
    const { showAlert } = useAlertDialog();

    useEffect(() => {
        if (!firestore || !caseId) return;
        const fetchCaseAndItemsData = async () => {
            try {
                const itemsSnapshot = await getDocs(collection(firestore, 'items'));
                const allItems = itemsSnapshot.docs.map(d => ({ ...d.data(), id: d.id } as Item));

                const caseSnap = await getDoc(doc(firestore, 'cases', caseId));
                let caseResult: Case | null = null;
                if (caseSnap.exists()) {
                    caseResult = { ...caseSnap.data(), id: caseSnap.id } as Case;
                } else {
                    const mockCase = MOCK_CASES.find(c => c.id === caseId);
                    if (mockCase) caseResult = mockCase;
                }
                
                if(caseResult) {
                    setCaseData(caseResult);
                    const currentCaseItems = caseResult.items
                        .map(i => allItems.find(item => item.id === i.itemId))
                        .filter((item): item is Item => !!item);
                    setCaseItems(currentCaseItems);
                } else {
                    showAlert({title: "Error", description: "Case not found."});
                    router.push('/');
                }
            } catch (error) {
                console.error("Error fetching case data:", error);
                setCaseData(MOCK_CASES.find(c => c.id === caseId) || null);
                setCaseItems(MOCK_ITEMS);
            }
        };

        fetchCaseAndItemsData();
    }, [caseId, firestore, router, showAlert]);

    const generateRouletteReel = useCallback((prize: Item) => {
        const reel: Item[] = [];
        for (let i = 0; i < ROULETTE_ITEMS_COUNT; i++) {
            reel.push(caseItems[Math.floor(Math.random() * caseItems.length)]);
        }
        // Place the winning item at a predictable position (e.g., 3rd from the end)
        reel[ROULETTE_ITEMS_COUNT - 4] = prize;
        setRouletteItems(reel);
        return reel;
    }, [caseItems]);
    
    const handleSpin = useCallback(async (isFast: boolean = false) => {
        if (isSpinning || !caseData || !user || caseItems.length === 0) return;

        if (user.balance.stars < caseData.price) {
            showAlert({ title: "Error", description: "Not enough stars." });
            return;
        }
        updateBalance(-caseData.price);
        setIsSpinning(true);
        setWonItem(null);
        setRouletteOffset(0);

        const { prize, error } = await openCase({ caseId: caseData.id, userId: user.id });

        if (error || !prize) {
            updateBalance(caseData.price); // Refund
            showAlert({ title: "Error", description: error || "Could not determine prize." });
            setIsSpinning(false);
            return;
        }

        const reel = generateRouletteReel(prize);
        
        // Calculate the target position
        const winningItemIndex = ROULETTE_ITEMS_COUNT - 4;
        const targetOffset = (winningItemIndex * ROULETTE_ITEM_WIDTH) - (ROULETTE_ITEM_WIDTH * 2.5) + (Math.random() * ROULETTE_ITEM_WIDTH);
        
        // Short delay to allow React to render the new reel
        setTimeout(() => {
            setRouletteOffset(targetOffset);
        }, 100);

        // Wait for animation to finish
        setTimeout(() => {
            setWonItem(prize);
            setIsWinModalOpen(true);
            if (prize.id.startsWith('item-stars-')) {
                updateBalance(prize.value);
            }
        }, isFast ? 2000 : 5000);

    }, [caseData, user, caseItems, isSpinning, updateBalance, showAlert, generateRouletteReel]);

    const closeModal = () => {
        setIsWinModalOpen(false);
        setIsSpinning(false);
        setRouletteItems([]);
        setRouletteOffset(0);
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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {caseItems.map(item => (
                  <Card key={item.id} className={cn("p-1.5 flex flex-col items-center justify-center border-2", RARITY_PROPERTIES[item.rarity]?.bg, RARITY_PROPERTIES[item.rarity]?.border)}>
                    <div className="aspect-square relative w-full h-full">
                      <Image src={item.image} alt={item.name} fill sizes="15vw" className="object-contain p-1" data-ai-hint={item.imageHint} />
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
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">Roulette</h1>
                <div className="w-10"></div>
            </div>

            {/* Main content */}
            <div className="flex-grow flex flex-col items-center justify-center">
                {/* Roulette */}
                <div className="relative w-full flex flex-col items-center justify-center my-8">
                    {/* Top Marker */}
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white mb-2 z-10"></div>
                    
                    <div className="w-full h-36 overflow-hidden">
                        <div 
                            className="flex h-full items-center gap-4"
                            style={{
                                transform: `translateX(calc(50% - ${rouletteOffset}px - ${ROULETTE_ITEM_WIDTH/2}px))`,
                                transition: isSpinning ? `transform ${isSpinning ? '5s' : '0s'} cubic-bezier(0.2, 0.5, 0.1, 1)` : 'none',
                            }}
                        >
                            {rouletteItems.map((item, index) => (
                                <div key={index} className="flex-shrink-0 w-32 h-32">
                                     <Card className={cn("p-2 flex flex-col items-center justify-center w-full h-full border-2", RARITY_PROPERTIES[item.rarity]?.bg, RARITY_PROPERTIES[item.rarity]?.border)}>
                                        <div className="aspect-square relative w-24 h-24">
                                            <Image src={item.image} alt={item.name} fill sizes="20vw" className="object-contain" data-ai-hint={item.imageHint} />
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Bottom Marker */}
                    <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white mt-2 z-10"></div>
                </div>

                {/* Controls */}
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

            {/* Win Modal */}
            <Dialog open={isWinModalOpen} onOpenChange={(isOpen) => !isOpen && closeModal()}>
                 <DialogContent className="max-w-xs" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl">Поздравляем!</DialogTitle>
                        <DialogDescription className="text-center">Вы выиграли:</DialogDescription>
                    </DialogHeader>
                     {wonItem && (
                        <div className="flex flex-col items-center gap-4 py-4">
                             <Card className={cn("p-4 w-40 h-40 flex flex-col items-center justify-center border-2", RARITY_PROPERTIES[wonItem.rarity]?.bg, RARITY_PROPERTIES[wonItem.rarity]?.border)}>
                                <div className="aspect-square relative w-28 h-28">
                                    <Image src={wonItem.image} alt={wonItem.name} fill sizes="30vw" className="object-contain" data-ai-hint={wonItem.imageHint} />
                                </div>
                            </Card>
                            <div className="text-center">
                                <p className={cn("text-lg font-bold", RARITY_PROPERTIES[wonItem.rarity]?.text)}>{wonItem.name}</p>
                                <p className="text-sm text-muted-foreground">{wonItem.rarity}</p>
                            </div>
                        </div>
                     )}
                     <DialogFooter>
                        <Button className="w-full" onClick={closeModal}>Продолжить</Button>
                     </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
