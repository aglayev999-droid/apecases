'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, Trash2, X, Gift } from 'lucide-react';
import { doc, getDocs, collection, getDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog';
import { useUser } from '@/contexts/UserContext';
import { useAlertDialog } from '@/contexts/AlertDialogContext';
import type { Case, Item } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { MOCK_CASES, ALL_ITEMS as MOCK_ITEMS } from '@/lib/data';
import { openCase } from '@/ai/flows/open-case-flow';


const RARITY_PROPERTIES = {
    Common: {
        glow: 'shadow-gray-400/50',
        text: 'text-gray-400',
    },
    Uncommon: {
        glow: 'shadow-green-400/60',
        text: 'text-green-400',
    },
    Rare: {
        glow: 'shadow-blue-400/70',
        text: 'text-blue-400',
    },
    Epic: {
        glow: 'shadow-purple-400/80',
        text: 'text-purple-400',
    },
    Legendary: {
        glow: 'shadow-orange-400/90',
        text: 'text-orange-400',
    },
    NFT: {
        glow: 'shadow-purple-400/90',
        text: 'bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500',
    },
};


export default function CasePage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const firestore = useFirestore();

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [allItems, setAllItems] = useState<Item[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [wonItem, setWonItem] = useState<Item | null>(null);
    const [isWinModalOpen, setIsWinModalOpen] = useState(false);
    const { user, lastFreeCaseOpen, setLastFreeCaseOpen } = useUser();
    const { showAlert } = useAlertDialog();
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
    const [reelItems, setReelItems] = useState<Item[]>([]);
    const [caseItems, setCaseItems] = useState<Item[]>([]);

    const caseRef = useMemoFirebase(() => 
        firestore && caseId ? doc(firestore, 'cases', caseId) : null
    , [firestore, caseId]);
    
    const itemsColRef = useMemoFirebase(() =>
        firestore ? collection(firestore, 'items') : null
    , [firestore]);

    useEffect(() => {
        if (!firestore || !caseRef || !itemsColRef) return;
        const fetchCaseAndItemsData = async () => {
            const itemsSnapshot = await getDocs(itemsColRef);
            let itemsList: Item[];

            if (!itemsSnapshot.empty) {
                itemsList = itemsSnapshot.docs.map(d => ({ ...d.data(), id: d.id } as Item));
            } else {
                itemsList = MOCK_ITEMS;
            }
            setAllItems(itemsList);

            const caseSnap = await getDoc(caseRef);
            let caseResult: Case | null = null;

            if (caseSnap.exists()) {
                caseResult = { ...caseSnap.data(), id: caseSnap.id } as Case;
            } else {
                // Fallback to mock data if case not found in Firestore
                const mockCase = MOCK_CASES.find(c => c.id === caseId);
                if (mockCase) {
                    caseResult = mockCase;
                } else {
                    console.error("Case not found in Firestore or Mock data!");
                }
            }
            
            if(caseResult) {
                setCaseData(caseResult);
                const currentCaseItems = caseResult.items
                    .map(i => itemsList.find(item => item.id === i.itemId))
                    .filter((item): item is Item => !!item);
                setCaseItems(currentCaseItems);
            }
        };

        fetchCaseAndItemsData();
    }, [caseId, firestore, caseRef, itemsColRef]);
    
    useEffect(() => {
        if (caseItems.length === 0 || !emblaApi) return;
        
        const shuffleArray = (array: Item[]) => {
            let currentIndex = array.length, randomIndex;
            while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
            }
            return array;
        }
        
        // Make the reel long enough for a smooth spin
        const reelLength = 50;
        let extendedItems: Item[] = [];
        while (extendedItems.length < reelLength) {
            extendedItems.push(...shuffleArray([...caseItems]));
        }
        extendedItems = extendedItems.slice(0, reelLength);

        setReelItems(extendedItems);
        emblaApi.reInit();
        
    }, [caseItems, emblaApi]);

    // Idle animation effect
    useEffect(() => {
        if (!emblaApi || isSpinning) return;
    
        const engine = emblaApi.internalEngine();
        let animationFrame = 0;
    
        const tick = () => {
            if (isSpinning || !engine) return;
            engine.location.add(-0.1); 
            engine.target.set(engine.location);
            engine.scrollLooper.loop(engine.scrollBody.direction());
            engine.animation.from = engine.location.get();
            engine.animation.to = engine.location.get();
    
            animationFrame = requestAnimationFrame(tick);
        };
    
        animationFrame = requestAnimationFrame(tick);
    
        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [emblaApi, isSpinning]);
    
    const handleSpin = useCallback(async (isFast: boolean = false) => {
        if (isSpinning || !caseData || !user || !emblaApi || reelItems.length === 0 || allItems.length === 0) return;

        setIsSpinning(true);
        setWonItem(null);

        try {
            const prize = await openCase({ caseId: caseData.id, userId: user.id });

            if (!prize) {
                showAlert({ title: "Error", description: "Could not determine prize from server." });
                setIsSpinning(false);
                return;
            }

            const onSpinEnd = () => {
                emblaApi?.off('settle', onSpinEnd);
                setWonItem(prize);
                setIsWinModalOpen(true);
                // Balance is already updated on server, client will sync
            };

            const targetIndex = Math.floor(reelItems.length / 2) + Math.floor(Math.random() * (reelItems.length / 4));
            const newReelItems = [...reelItems];
            newReelItems[targetIndex] = prize;
            setReelItems(newReelItems);

            setTimeout(() => {
                if (!emblaApi) return;
                emblaApi.reInit();
                emblaApi.on('settle', onSpinEnd);
                emblaApi.scrollTo(targetIndex, !isFast);
            }, 100);

        } catch (error: any) {
            showAlert({ title: "Error", description: error.message || "Failed to open case." });
            setIsSpinning(false);
        }

    }, [caseData, user, emblaApi, showAlert, reelItems, allItems, isSpinning]);

    const closeModal = () => {
        setIsWinModalOpen(false);
        setWonItem(null);
        setIsSpinning(false); // Re-enable spinning after modal is closed
    }

    const handleGoToInventory = () => {
        closeModal();
        router.push('/inventory');
    };

    if (!caseData) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Loading case...</p>
            </div>
        );
    }
    
    const isFree = caseData.price === 0;
    let canAfford = user ? user.balance.stars >= caseData.price : false;
    if (isFree) {
        canAfford = true; 
        if (lastFreeCaseOpen && caseData.freeCooldownSeconds) {
            const now = new Date();
            const endTime = new Date(lastFreeCaseOpen.getTime() + caseData.freeCooldownSeconds * 1000);
            if (now < endTime) {
                canAfford = false;
            }
        }
    }

    const GiftsInside = () => (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="[&[data-state=open]>svg]:rotate-180 justify-center gap-2 text-muted-foreground hover:no-underline font-bold py-2 rounded-lg hover:bg-card/80 transition-colors">
            <Gift className="h-5 w-5" />
            <span>Подарки внутри</span>
          </AccordionTrigger>
          <AccordionContent className="bg-card/80 p-4 rounded-b-lg">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {caseItems.map(item => {
                if (!item) return null;
                const isStars = item.id.startsWith('item-stars-');
                return (
                  <Card key={item.id} className="p-1.5 flex flex-col bg-card-foreground/5 border-border">
                    <div className="aspect-square relative w-full">
                      <Image src={item.image} alt={item.name} fill sizes="15vw" className="object-contain" data-ai-hint={item.imageHint} />
                    </div>
                    <div className="text-center mt-1">
                      <p className="text-xs font-bold truncate">{item.name}</p>
                      <div className="flex items-center justify-center gap-1 text-xs">
                        <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={12} height={12} className="h-3 w-3 object-contain" />
                        <span className={cn('font-semibold', isStars ? 'text-yellow-400' : 'text-muted-foreground')}>{item.value}</span>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    
    const PrizeDisplay = ({ item }: { item: Item }) => {
        const isStars = item.id.startsWith('item-stars-');
        
        return (
            <Card className="bg-card/70 w-48 h-48 flex flex-col items-center justify-center p-4">
                 <div className="relative w-28 h-28">
                    <Image src={item.image} alt={item.name} fill sizes="50vw" className="object-contain" data-ai-hint={item.imageHint} />
                </div>
                {isStars && <span className="text-3xl font-bold mt-2 text-yellow-400">{item.value}</span>}
            </Card>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Custom Header */}
            <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">Roulette</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="w-10 h-10 p-0 font-bold">x2</Button>
                    <Button variant="outline" className="w-10 h-10 p-0 font-bold">x3</Button>
                    <Button variant="destructive" size="icon" className="w-10 h-10">
                        <Trash2 className="h-5 w-5"/>
                    </Button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-grow flex flex-col justify-between">
                {/* Roulette Reel */}
                 <div className="flex flex-col items-center justify-center relative my-4">
                    <div className="text-white z-10 absolute -top-4">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 19L2 9H22L12 19Z"/></svg>
                    </div>
                    
                    <div className="overflow-hidden w-full" ref={emblaRef}>
                        <div className="flex">
                            {reelItems.length > 0 ? reelItems.map((item, index) => (
                                <div key={index} className="flex-[0_0_8rem] mx-2">
                                     <Card className="p-2 bg-card-foreground/5 border-border h-32 w-32">
                                        <div className="aspect-square relative">
                                            {item && <Image src={item.image} alt={item.name} fill sizes="15vw" className="object-contain p-1" data-ai-hint={item.imageHint}/>}
                                        </div>
                                    </Card>
                                </div>
                            )) : (
                                <div className="flex-[0_0_8rem] mx-2">
                                    <Card className="p-2 bg-card-foreground/5 border-border h-32 w-32">
                                         <div className="aspect-square relative" />
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-white z-10 absolute -bottom-4">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 5L22 15H2L12 5Z"/></svg>
                    </div>
                </div>

                {/* Controls */}
                <div className="w-full mt-auto">
                    <Button 
                        onClick={() => handleSpin(false)}
                        onDoubleClick={() => handleSpin(true)}
                        disabled={isSpinning || !canAfford || reelItems.length === 0} 
                        className="w-full h-14 text-lg"
                        size="lg"
                    >
                       <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center justify-center gap-2">
                                <span>{isFree ? 'Крутить' : `Крутить ${caseData.price}`}</span>
                                {!isFree && <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={24} height={24} className="h-6 w-6 object-contain" />}
                            </div>
                             <span className="text-xs font-normal text-primary-foreground/70">(Двойное нажатие для быстрого вращения)</span>
                       </div>
                    </Button>
                    <div className="mt-2">
                        <GiftsInside />
                    </div>
                </div>
            </div>

            {/* Win Modal */}
            <Dialog open={isWinModalOpen} onOpenChange={setIsWinModalOpen}>
                 <DialogContent 
                    className="w-screen h-screen max-w-full max-h-full sm:w-full sm:h-full bg-background/90 backdrop-blur-sm p-4 flex flex-col justify-center items-center border-0" 
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogTitle className="sr-only">You Won an Item!</DialogTitle>
                     {wonItem && (
                        <div className="text-center flex flex-col items-center justify-center gap-6">
                            <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={closeModal}>
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                             
                            <PrizeDisplay item={wonItem} />
                           
                            <div>
                                <h2 className="text-2xl font-bold">Поздравляем с победой!</h2>
                                <p className="text-muted-foreground">
                                    Все выигранные призы вы можете увидеть у себя в <Button variant="link" className="p-0 h-auto" onClick={handleGoToInventory}>инвентаre</Button>.
                                </p>
                            </div>
                            
                            <Button size="lg" className="w-64 h-12 text-lg" onClick={closeModal}>
                                Получить приз
                            </Button>
                        </div>
                     )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
