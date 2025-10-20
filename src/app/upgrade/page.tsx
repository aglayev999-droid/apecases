'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import type { Item, InventoryItem } from '@/lib/types';
import Image from 'next/image';
import { Search, ChevronDown } from 'lucide-react';
import { DiamondIcon } from '@/components/icons/DiamondIcon';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function UpgradePage() {
    const { inventory } = useUser();
    const [yourItem, setYourItem] = useState<InventoryItem | null>(null);
    const [targetItem, setTargetItem] = useState<Item | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const upgradableItems = useMemo(() => {
        return inventory?.filter(item => item.value >= 100) || [];
    }, [inventory]);

    const targetableNfts = useMemo(() => {
        // This would be fetched from a global list of NFTs
        return inventory?.filter(item => item.rarity === 'NFT') || [];
    }, [inventory]);

    const filteredInventory = useMemo(() => {
        if (!searchQuery) return upgradableItems;
        return upgradableItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, upgradableItems]);
    
    const filteredNfts = useMemo(() => {
        if (!searchQuery) return targetableNfts;
        return targetableNfts.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, targetableNfts]);

    const { chance, multiplier } = useMemo(() => {
        if (!yourItem || !targetItem) {
            return { chance: 0, multiplier: 0 };
        }
        const calculatedChance = Math.min((yourItem.value / targetItem.value) * 50, 95);
        const calculatedMultiplier = targetItem.value / yourItem.value;
        return { chance: parseFloat(calculatedChance.toFixed(1)), multiplier: parseFloat(calculatedMultiplier.toFixed(1)) };
    }, [yourItem, targetItem]);

    const ItemCard = ({ item, onSelect, isSelected }: { item: Item | InventoryItem, onSelect: () => void, isSelected: boolean }) => (
        <Card 
            className={cn(
                "p-2 cursor-pointer transition-all border-2", 
                isSelected ? 'ring-2 ring-primary' : ''
            )}
            onClick={onSelect}
        >
            <div className="aspect-square relative">
                <Image src={item.image} alt={item.name} fill sizes="30vw" className="object-contain" data-ai-hint={item.imageHint}/>
            </div>
            <p className="text-xs font-bold truncate mt-1">{item.name}</p>
        </Card>
    );

    return (
        <div className="flex flex-col h-full text-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-6">
                Апгрейд NFT
            </h1>

            <div className="relative flex items-center justify-center mb-6">
                <div className="absolute left-0 text-lg font-bold">{chance}%</div>
                <div className="relative w-40 h-40">
                    <div className="absolute inset-0 bg-gray-800 rounded-full animate-pulse opacity-20" />
                    <div className="absolute inset-2 bg-gray-900 rounded-full" />
                    <div className="absolute inset-4 border-4 border-gray-800 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <DiamondIcon className="w-16 h-16 text-cyan-400" />
                    </div>
                </div>
                <div className="absolute right-0 text-lg font-bold">0x</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <Card className="h-32 flex flex-col items-center justify-center bg-card/50 border-dashed border-2 cursor-pointer hover:bg-card/70" onClick={() => { /* open inventory modal */ }}>
                    {yourItem ? (
                         <div className="relative w-20 h-20">
                            <Image src={yourItem.image} alt={yourItem.name} fill sizes="20vw" className="object-contain p-1" data-ai-hint={yourItem.imageHint}/>
                        </div>
                    ) : (
                        <>
                            <div className="text-4xl text-muted-foreground">+</div>
                            <p className="text-sm text-muted-foreground">Выберите ваш предмет</p>
                        </>
                    )}
                </Card>
                <Card className="h-32 flex flex-col items-center justify-center bg-card/50 border-dashed border-2 cursor-pointer hover:bg-card/70" onClick={() => { /* open target modal */ }}>
                     {targetItem ? (
                        <div className="relative w-20 h-20">
                             <Image src={targetItem.image} alt={targetItem.name} fill sizes="20vw" className="object-contain p-1" data-ai-hint={targetItem.imageHint}/>
                        </div>
                    ) : (
                        <>
                            <div className="text-4xl text-muted-foreground">+</div>
                            <p className="text-sm text-muted-foreground">Выберите желаемый NFT</p>
                        </>
                    )}
                </Card>
            </div>
            
            <Button className="w-full h-14 text-lg mb-4" disabled={!yourItem || !targetItem}>
                Апгрейд
            </Button>


            <div className="flex-grow flex flex-col bg-card rounded-t-2xl p-4 min-h-0">
                <Tabs defaultValue="inventory" className="w-full flex flex-col flex-grow min-h-0">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="inventory">Инвентарь</TabsTrigger>
                        <TabsTrigger value="target">Желаемый NFT</TabsTrigger>
                    </TabsList>
                    <div className="relative mb-4">
                        <Input 
                            placeholder="Быстрый поиск" 
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>

                    <TabsContent value="inventory" className="flex-grow min-h-0">
                        <ScrollArea className="h-full">
                            {upgradableItems.length === 0 ? (
                                <div className="text-center text-muted-foreground py-10">
                                    В вашем инвентаре нет предметов стоимостью выше 100 Stars
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {filteredInventory.map(item => (
                                        <ItemCard key={item.id} item={item} onSelect={() => setYourItem(item)} isSelected={yourItem?.id === item.id}/>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="target" className="flex-grow min-h-0">
                         <ScrollArea className="h-full">
                            {targetableNfts.length === 0 ? (
                                <div className="text-center text-muted-foreground py-10">
                                    Нет доступных NFT для апгрейда
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                     {filteredNfts.map(item => (
                                        <ItemCard key={item.id} item={item} onSelect={() => setTargetItem(item)} isSelected={targetItem?.id === item.id} />
                                    ))}
                                </div>
                            )}
                         </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
