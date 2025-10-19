'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, Trash2, X, Gift } from 'lucide-react';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';

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

const selectItem = (currentCase: Case, allItems: Item[]): Item | undefined => {
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const { itemId, probability } of currentCase.items) {
        cumulativeProbability += probability;
        if (rand < cumulativeProbability) {
            return allItems.find(i => i.id === itemId);
        }
    }
    // Fallback to a random item from the case if something goes wrong
    const fallbackItemId = currentCase.items[Math.floor(Math.random() * currentCase.items.length)].itemId;
    return allItems.find(i => i.id === fallbackItemId);
};

const shuffleArray = (array: any[]) => {
    if (typeof window === 'undefined') return array;
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    const { user, updateBalance, addInventoryItem, updateSpending, setLastFreeCaseOpen, lastFreeCaseOpen } = useUser();
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
        if (!firestore) return;
        const fetchCaseAndItemsData = async () => {
            if (!itemsColRef || !caseRef) return;
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
        if (caseItems.length === 0) return;
        const extendedItems = [...caseItems, ...caseItems, ...caseItems, ...caseItems, ...caseItems];
        setReelItems(shuffleArray(extendedItems));
        
    }, [caseItems]);
    
    useEffect(() => {
        if (!emblaApi) return;
        
        const applyTransition = () => {
            const engine = emblaApi.internalEngine();
            engine.translate.toggleActive(false); // Disable internal translation
            const container = emblaApi.containerNode();
            if (container) {
                container.style.transition = 'transform 5s ease-out';
            }
        };

        emblaApi.on('init', applyTransition);
        emblaApi.on('reInit', applyTransition);

        return () => {
             emblaApi.off('init', applyTransition);
             emblaApi.off('reInit', applyTransition);
        };
    }, [emblaApi]);

    const handleSpin = useCallback((isFast: boolean = false) => {
        if (isSpinning || !caseData || !user || !emblaApi || caseItems.length === 0 || allItems.length === 0) return;
        
        const isFree = caseData.price === 0;
        
        if (isFree) {
            if (lastFreeCaseOpen && caseData.freeCooldownSeconds) {
                const now = new Date();
                const endTime = new Date(lastFreeCaseOpen.getTime() + caseData.freeCooldownSeconds * 1000);
                if (now < endTime) {
                    showAlert({ title: "Cooldown Active", description: "You can't open this free case yet." });
                    return;
                }
            }
        } else {
            if (user.balance.stars < caseData.price) {
              showAlert({ title: "Not enough stars", description: "You don't have enough stars to open this case." });
              return;
            }
            updateBalance(-caseData.price);
            updateSpending(caseData.price);
        }
        
        setIsSpinning(true);
        setWonItem(null);
        
        if (isFree) {
            setLastFreeCaseOpen(new Date());
        }

        // --- BUG FIX LOGIC ---
        // 1. Generate the logical prize first
        const logicalPrize = selectItem(caseData, allItems);
        if (!logicalPrize) {
            console.error("Could not select a prize.");
            setIsSpinning(false);
            return;
        }

        // 2. Create a new shuffled reel.
        const newReelItems = shuffleArray([...caseItems, ...caseItems, ...caseItems, ...caseItems, ...caseItems]);

        // 3. Find a specific, deterministic index for the prize to land on.
        // We'll aim for somewhere in the middle-to-end of the reel for a better visual.
        let prizeIndexInReel = -1;
        const preferredStartIndex = Math.floor(newReelItems.length / 2);

        for (let i = preferredStartIndex; i < newReelItems.length; i++) {
            if (newReelItems[i]?.id === logicalPrize.id) {
                prizeIndexInReel = i;
                break;
            }
        }
        
        // If not found in the latter half, find the first occurrence.
        if (prizeIndexInReel === -1) {
          prizeIndexInReel = newReelItems.findIndex(item => item?.id === logicalPrize.id);
        }

        // If still not found (should be impossible but as a fallback), add it and use that index.
         if (prizeIndexInReel === -1) {
            console.error("Prize item not found in reel items array. Adding it.");
            newReelItems.push(logicalPrize);
            prizeIndexInReel = newReelItems.length - 1;
        }
        
        // 4. Set the new reel for rendering
        setReelItems(newReelItems);
        
        const spinTime = isFast ? 1000 : 5000;

        // Give React time to re-render the shuffled reel before scrolling
        setTimeout(() => {
            if (emblaApi) {
                const container = emblaApi.containerNode();
                if(container) {
                    container.style.transition = `transform ${spinTime / 1000}s ease-out`;
                }
                // Re-initialize to make sure the carousel knows about the new items
                emblaApi.reInit();
                // 5. Scroll to the PRE-DETERMINED index.
                emblaApi.scrollTo(prizeIndexInReel, false);
            }
        }, 100);

        
        const onSpinEnd = () => {
            setIsSpinning(false);
            // 6. The prize is already the correct one determined at the start.
            setWonItem(logicalPrize);
            setIsWinModalOpen(true);
            
            if (logicalPrize.id.startsWith('item-stars-')) {
                updateBalance(logicalPrize.value);
            } else {
                addInventoryItem(logicalPrize);
            }
        };

        setTimeout(onSpinEnd, spinTime + 200);


    }, [caseData, user, emblaApi, updateBalance, updateSpending, addInventoryItem, showAlert, caseItems, allItems, setLastFreeCaseOpen, lastFreeCaseOpen, isSpinning]);

    const closeModal = () => {
        setIsWinModalOpen(false);
        setWonItem(null);
    }

    const handleSell = () => {
        if (!wonItem) return;
        updateBalance(wonItem.value);
        showAlert({
            title: `Sold: ${wonItem.name}!`,
            description: `You got ${wonItem.value} stars.`,
        });
        closeModal();
    };

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
            <AccordionTrigger className="justify-center gap-2 text-muted-foreground hover:no-underline font-bold">
                <Gift className="h-5 w-5 text-primary"/>
                <span>Gifts Inside</span>
            </AccordionTrigger>
            <AccordionContent>
                <div className="grid grid-cols-3 gap-2">
                    {caseItems.map(item => {
                        if (!item) return null;
                        return (
                            <Card key={item.id} className={cn("p-2 border-2", RARITY_PROPERTIES[item.rarity].border)}>
                                <div className="aspect-square relative">
                                    <Image src={item.image} alt={item.name} fill sizes="30vw" className="object-contain p-2" data-ai-hint={item.imageHint}/>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
    );

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
                 <div className="flex-grow flex flex-col items-center justify-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-primary z-10">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 5L22 15H2L12 5Z"/></svg>
                    </div>
                    
                    <div className="overflow-hidden w-full" ref={emblaRef} style={{ willChange: 'transform' }}>
                        <div className="flex">
                            {reelItems.length > 0 ? reelItems.map((item, index) => (
                                <div key={index} className="flex-[0_0_9rem] mx-2">
                                    <Card className={cn(
                                        "p-2 border-2 bg-card/50 transition-all duration-300", 
                                        item ? RARITY_PROPERTIES[item.rarity].border : 'border-gray-500',
                                        isSpinning ? 'opacity-70 scale-95' : 'opacity-50'
                                        )}>
                                        <div className="aspect-square relative">
                                            {item && <Image src={item.image} alt={item.name} fill sizes="10vw" className="object-contain" data-ai-hint={item.imageHint}/>}
                                        </div>
                                    </Card>
                                </div>
                            )) : (
                                <div className="flex-[0_0_9rem] mx-2">
                                    <Card className="p-2 border-2 bg-card/50">
                                         <div className="aspect-square relative" />
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-primary z-10">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 19L2 9H22L12 19Z"/></svg>
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-auto pt-8">
                    <Button 
                        onClick={() => handleSpin(false)}
                        onDoubleClick={() => handleSpin(true)}
                        disabled={isSpinning || !canAfford || reelItems.length === 0} 
                        className="w-full h-16 text-xl"
                        size="lg"
                    >
                       <div className="flex flex-col">
                            <div className="flex items-center justify-center gap-2">
                                <span>{isFree ? 'Spin' : `Spin ${caseData.price}`}</span>
                                {!isFree && <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={24} height={24} className="h-6 w-6 object-contain" />}
                            </div>
                             <span className="text-xs font-normal text-primary-foreground/70">(Double-click for a quick spin)</span>
                       </div>
                    </Button>
                    <div className="mt-4">
                        <GiftsInside />
                    </div>
                </div>
            </div>

            {/* Win Modal */}
            <Dialog open={isWinModalOpen} onOpenChange={setIsWinModalOpen}>
                <DialogContent className="sm:max-w-[425px] p-0 border-0 bg-transparent shadow-none" onInteractOutside={(e) => {
                    if (isWinModalOpen) {
                        e.preventDefault();
                    }
                }}>
                     {wonItem && (
                        <div className="text-center space-y-4 p-6 bg-card rounded-lg relative">
                             <DialogTitle className="sr-only">You Won!</DialogTitle>
                             <DialogClose asChild>
                                <button onClick={closeModal} className="absolute top-2 right-2 p-1 rounded-full bg-background/50 hover:bg-background">
                                    <X className="h-5 w-5 text-muted-foreground" />
                                </button>
                            </DialogClose>

                            <div className="relative w-48 h-48 mx-auto">
                                <Image src={wonItem.image} alt={wonItem.name} fill sizes="50vw" className="object-contain" data-ai-hint={wonItem.imageHint} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">You won: <span className={cn(RARITY_PROPERTIES[wonItem.rarity].text)}>{wonItem.name}</span></h3>
                                <p className={cn("font-semibold", RARITY_PROPERTIES[wonItem.rarity].text)}>{wonItem.rarity}</p>
                            </div>
                            { wonItem.id.startsWith('item-stars-') ? (
                                <Button variant="default" size="lg" className="w-full" onClick={closeModal}>
                                    Awesome!
                                </Button>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <Button variant="destructive" size="lg" onClick={handleSell}>
                                        Sell {wonItem.value}
                                        <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={20} height={20} className="h-5 w-5 object-contain ml-2" />
                                    </Button>
                                    <Button variant="default" size="lg" onClick={handleGoToInventory}>
                                        Go to inventory
                                    </Button>
                                </div>
                            )}
                        </div>
                     )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
