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
import { ScrollArea } from '@/components/ui/scroll-area';

const RARITY_PROPERTIES = {
    Common: { glow: 'shadow-gray-400/50', border: 'border-gray-500', text: 'text-gray-400' },
    Uncommon: { glow: 'shadow-green-400/60', border: 'border-green-500', text: 'text-green-400' },
    Rare: { glow: 'shadow-blue-400/70', border: 'border-blue-500', text: 'text-blue-400' },
    Epic: { glow: 'shadow-purple-400/80', border: 'border-purple-500', text: 'text-purple-400' },
    Legendary: { glow: 'shadow-orange-400/90', border: 'border-orange-500', text: 'text-orange-400' },
    NFT: { glow: 'shadow-purple-400/90', border: 'border-purple-400', text: 'bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500' },
};

const selectItem = (currentCase: Case, allItems: Item[]): Item | undefined => {
    if (typeof window === 'undefined') {
        const fallbackItemId = currentCase.items[0].itemId;
        return allItems.find(i => i.id === fallbackItemId);
    }
    const rand = Math.random();
    let cumulativeProbability = 0;
    const sortedCaseItems = [...currentCase.items].sort((a, b) => a.probability - b.probability);
    for (const { itemId, probability } of sortedCaseItems) {
        cumulativeProbability += probability;
        if (rand < cumulativeProbability) {
            return allItems.find(i => i.id === itemId);
        }
    }
    const fallbackItemId = currentCase.items[Math.floor(Math.random() * currentCase.items.length)].itemId;
    return allItems.find(i => i.id === fallbackItemId);
};

const Reel = ({ items, onSpinEnd, isFast }: { items: Item[], onSpinEnd: (prize: Item) => void, isFast: boolean }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.reInit();
    }, [items, emblaApi]);

    useEffect(() => {
        if (!emblaApi || items.length < 100) return;

        const spin = async () => {
            const spinTime = isFast ? 1000 : 5000;
            const targetIndex = 75; // The prize
            
            emblaApi.scrollTo(0, true);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const container = emblaApi.containerNode();
            if (container) container.style.transition = `transform ${spinTime}ms ease-out`;
            
            emblaApi.scrollTo(targetIndex);

            await new Promise(resolve => setTimeout(resolve, spinTime));
            if (container) container.style.transition = '';

            onSpinEnd(items[targetIndex]);
        };

        spin();
    }, [emblaApi, items, isFast, onSpinEnd]);

    return (
        <div className="relative w-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-primary z-10"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5L22 15H2L12 5Z"/></svg></div>
            <div className="overflow-hidden w-full" ref={emblaRef}>
                <div className="flex">
                    {items.map((item, index) => (
                        <div key={index} className="flex-[0_0_9rem] mx-2">
                            <Card className={cn("p-2 border-2 bg-card/50 transition-all duration-300 opacity-50", item ? RARITY_PROPERTIES[item.rarity].border : 'border-gray-500')}>
                                <div className="aspect-square relative">{item && <Image src={item.image} alt={item.name} fill sizes="10vw" className="object-contain" data-ai-hint={item.imageHint}/>}</div>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-primary z-10"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 19L2 9H22L12 19Z"/></svg></div>
        </div>
    );
};

export default function CasePage() {
    const params = useParams();
    const router = useRouter();
    const caseId = params.caseId as string;
    const firestore = useFirestore();

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [allItems, setAllItems] = useState<Item[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [isFastSpin, setIsFastSpin] = useState(false);
    const [wonItems, setWonItems] = useState<Item[]>([]);
    const [isWinModalOpen, setIsWinModalOpen] = useState(false);
    const { user, updateBalance, addInventoryItem, updateSpending, setLastFreeCaseOpen, lastFreeCaseOpen } = useUser();
    const { showAlert } = useAlertDialog();
    
    const [reels, setReels] = useState<Item[][]>([]);
    const [caseItems, setCaseItems] = useState<Item[]>([]);
    const [spinMultiplier, setSpinMultiplier] = useState(1);
    
    const caseRef = useMemoFirebase(() => firestore && caseId ? doc(firestore, 'cases', caseId) : null, [firestore, caseId]);
    const itemsColRef = useMemoFirebase(() => firestore ? collection(firestore, 'items') : null, [firestore]);

    useEffect(() => {
        if (!firestore) return;
        const fetchCaseAndItemsData = async () => {
            if (!itemsColRef || !caseRef) return;
            const itemsSnapshot = await getDocs(itemsColRef);
            let itemsList: Item[] = !itemsSnapshot.empty
                ? itemsSnapshot.docs.map(d => ({ ...d.data(), id: d.id } as Item))
                : MOCK_ITEMS;
            setAllItems(itemsList);

            const caseSnap = await getDoc(caseRef);
            let caseResult: Case | null = caseSnap.exists()
                ? { ...caseSnap.data(), id: caseSnap.id } as Case
                : MOCK_CASES.find(c => c.id === caseId) || null;
            
            if(caseResult) {
                setCaseData(caseResult);
                const currentCaseItems = caseResult.items
                    .map(i => itemsList.find(item => item.id === i.itemId))
                    .filter((item): item is Item => !!item)
                    .sort((a,b) => a.value - b.value);
                setCaseItems(currentCaseItems);
            } else {
                console.error("Case not found!");
            }
        };
        fetchCaseAndItemsData();
    }, [caseId, firestore, caseRef, itemsColRef]);
    
    const handleSpin = useCallback(async (isFast: boolean = false) => {
        if (isSpinning || !caseData || !user || caseItems.length === 0 || allItems.length === 0) return;
        
        const isFree = caseData.price === 0;
        const numSpins = isFree ? 1 : spinMultiplier;
        const totalCost = caseData.price * numSpins;

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
            if (user.balance.stars < totalCost) {
              showAlert({ title: "Not enough stars", description: `You need ${totalCost} stars to open ${numSpins} cases.` });
              return;
            }
            updateBalance(-totalCost);
            updateSpending(totalCost);
        }
        
        setIsSpinning(true);
        setIsFastSpin(isFast);
        setWonItems([]);
        if (isFree) setLastFreeCaseOpen(new Date());

        const prizes: Item[] = [];
        for (let i = 0; i < numSpins; i++) {
            const prize = selectItem(caseData, allItems);
            if (prize) prizes.push(prize);
        }

        if (prizes.length === 0) {
            console.error("Could not select any prizes. Aborting spin.");
            setIsSpinning(false);
            return;
        }

        const reelLength = 100;
        const targetIndex = 75;

        const newReels = prizes.map(prize => {
            let newReelItems = Array.from({ length: reelLength }, () => caseItems[Math.floor(Math.random() * caseItems.length)]);
            newReelItems[targetIndex] = prize;
            return newReelItems;
        });

        setReels(newReels);

    }, [caseData, user, updateBalance, updateSpending, addInventoryItem, showAlert, caseItems, allItems, setLastFreeCaseOpen, lastFreeCaseOpen, isSpinning, spinMultiplier]);
    
    const onSpinEnd = useCallback((prize: Item) => {
        setWonItems(prevWonItems => {
            const newWonItems = [...prevWonItems, prize];

            if (newWonItems.length === spinMultiplier) {
                setTimeout(() => {
                    setIsSpinning(false);
                    setReels([]);
                    setIsWinModalOpen(true);
                    
                    newWonItems.forEach(p => {
                        if (p.id.startsWith('item-stars-')) {
                            updateBalance(p.value);
                        } else {
                            addInventoryItem(p);
                        }
                    });

                }, 500); // Wait half a second before showing modal
            }
            return newWonItems;
        });
    }, [spinMultiplier, addInventoryItem, updateBalance]);


    const handleModalOpenChange = (open: boolean) => {
        if (!open && !isSpinning) {
            setIsWinModalOpen(false);
            setWonItems([]);
            router.push('/');
        }
    }

    const totalWonValue = useMemo(() => {
        return wonItems.reduce((sum, item) => sum + item.value, 0);
    }, [wonItems]);

    const handleSellAllWon = () => {
        updateBalance(totalWonValue);
        showAlert({
            title: `Sold ${wonItems.length} items!`,
            description: `You got ${totalWonValue} stars.`,
        });
        handleModalOpenChange(false);
    };

    if (!caseData) return <div className="flex items-center justify-center h-full"><p>Loading case...</p></div>;
    
    const isFree = caseData.price === 0;
    const totalCost = caseData.price * (isFree ? 1 : spinMultiplier);
    let canAfford = user ? user.balance.stars >= totalCost : false;
    if (isFree) {
        canAfford = true; 
        if (lastFreeCaseOpen && caseData.freeCooldownSeconds) {
            const now = new Date();
            const endTime = new Date(lastFreeCaseOpen.getTime() + caseData.freeCooldownSeconds * 1000);
            if (now < endTime) canAfford = false;
        }
    }
    
    const displayedMultiplier = isFree ? 1 : spinMultiplier;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft className="h-6 w-6" /></Button>
                <h1 className="text-xl font-bold">Roulette</h1>
                <div className="flex items-center gap-2">
                    {[2, 3].map(multi => (
                        <Button key={multi} variant={spinMultiplier === multi ? 'default' : 'outline'} className="w-10 h-10 p-0 font-bold" onClick={() => setSpinMultiplier(multi)} disabled={isSpinning || isFree}>x{multi}</Button>
                    ))}
                    <Button variant="destructive" size="icon" className="w-10 h-10" onClick={() => setSpinMultiplier(1)} disabled={isSpinning || isFree}><Trash2 className="h-5 w-5"/></Button>
                </div>
            </div>

            <div className="flex-grow flex flex-col justify-between">
                <div className="flex-grow flex flex-col items-center justify-center relative space-y-4">
                    {isSpinning ? (
                        reels.map((reelItems, index) => (
                            <Reel key={index} items={reelItems} onSpinEnd={onSpinEnd} isFast={isFastSpin} />
                        ))
                    ) : (
                        Array.from({ length: displayedMultiplier }).map((_, index) => (
                            <div key={index} className="relative w-full">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-primary z-10"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5L22 15H2L12 5Z"/></svg></div>
                                <div className="overflow-hidden w-full">
                                    <div className="flex">
                                        <div className="flex-[0_0_9rem] mx-auto">
                                            <Card className="p-2 border-2 bg-card/50 border-gray-500">
                                                <div className="aspect-square relative"><Image src={caseData.image} alt={caseData.name} fill sizes="10vw" className="object-contain" data-ai-hint={caseData.imageHint}/></div>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-primary z-10"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 19L2 9H22L12 19Z"/></svg></div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-auto pt-8">
                    <Button onMouseDown={() => handleSpin(false)} onDoubleClick={() => handleSpin(true)} disabled={isSpinning || !canAfford} className="w-full h-16 text-xl" size="lg">
                       <div className="flex flex-col">
                            <div className="flex items-center justify-center gap-2">
                                <span>{isFree ? 'Spin' : `Spin x${spinMultiplier} for ${totalCost}`}</span>
                                {!isFree && <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={24} height={24} className="h-6 w-6 object-contain" />}
                            </div>
                             <span className="text-xs font-normal text-primary-foreground/70">(Double-click for a quick spin)</span>
                       </div>
                    </Button>
                    <div className="mt-4">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1" className="border-none">
                            <AccordionTrigger className="justify-center gap-2 text-muted-foreground hover:no-underline font-bold"><Gift className="h-5 w-5 text-primary"/><span>Gifts Inside</span></AccordionTrigger>
                            <AccordionContent>
                                <div className="grid grid-cols-3 gap-2">
                                    {caseItems.map(item => item && (
                                         <Card key={item.id} className={cn("p-2 border-2 text-center", RARITY_PROPERTIES[item.rarity].border)}>
                                            <div className="aspect-square relative"><Image src={item.image} alt={item.name} fill sizes="30vw" className="object-contain p-2" data-ai-hint={item.imageHint}/></div>
                                             <p className="text-xs font-bold truncate mt-1">{item.name}</p>
                                             <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-400">
                                                <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={12} height={12} className="h-3 w-3 object-contain" />
                                                {item.value}
                                             </div>
                                        </Card>
                                    ))}
                                </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </div>

            <Dialog open={isWinModalOpen} onOpenChange={handleModalOpenChange}>
                <DialogContent className="sm:max-w-md w-[90vw] p-0 border-0 bg-transparent shadow-none" onInteractOutside={(e) => { if (isWinModalOpen || isSpinning) e.preventDefault(); }}>
                     {wonItems.length > 0 && (
                        <div className="text-center space-y-4 p-4 sm:p-6 bg-card rounded-lg relative">
                           <button onClick={() => handleModalOpenChange(false)} className="absolute right-2 top-2 p-1 rounded-full bg-background/50 hover:bg-background/80"><X className="h-4 w-4" /></button>
                            <DialogTitle className="text-2xl font-bold">You Won {wonItems.length} Item{wonItems.length > 1 ? 's' : ''}!</DialogTitle>
                            <ScrollArea className="max-h-64 pr-4">
                                <div className="grid grid-cols-3 gap-2">
                                    {wonItems.map((item, index) => (
                                        <Card key={index} className={cn("p-2", RARITY_PROPERTIES[item.rarity].border)}>
                                            <div className="aspect-square relative"><Image src={item.image} alt={item.name} fill sizes="30vw" className="object-contain" data-ai-hint={item.imageHint} /></div>
                                            <p className="text-xs font-bold truncate mt-1">{item.name}</p>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <Button variant="destructive" size="lg" onClick={handleSellAllWon}>
                                    Sell All for {totalWonValue}
                                    <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={20} height={20} className="h-5 w-5 object-contain ml-2" />
                                </Button>
                                <Button variant="default" size="lg" onClick={() => router.push('/inventory')}>
                                    Go to inventory
                                </Button>
                            </div>
                        </div>
                     )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
