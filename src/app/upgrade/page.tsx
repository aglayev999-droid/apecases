'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import type { Item, InventoryItem } from '@/lib/types';
import Image from 'next/image';
import { Search, X, Loader2 } from 'lucide-react';
import { DiamondIcon } from '@/components/icons/DiamondIcon';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MOCK_CASES, ALL_ITEMS as MOCK_ITEMS } from '@/lib/data';
import { useAlertDialog } from '@/contexts/AlertDialogContext';

const ItemSelectionModal = ({
  isOpen,
  onClose,
  items,
  selectedItems,
  onSelect,
  title,
  isMultiSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: (Item | InventoryItem)[];
  selectedItems: (Item | InventoryItem)[];
  onSelect: (item: Item | InventoryItem) => void;
  title: string;
  isMultiSelect: boolean;
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, items]);
  
  const isSelected = (item: Item | InventoryItem) => {
    return selectedItems.some(selected => ('inventoryId' in item && 'inventoryId' in selected) ? item.inventoryId === selected.inventoryId : item.id === selected.id);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col h-[80vh] max-w-sm p-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative mb-2">
          <Input 
            placeholder="Быстрый поиск" 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <ScrollArea className="flex-grow">
          {filteredItems.length === 0 ? (
             <div className="text-center text-muted-foreground py-10">
                Ничего не найдено
            </div>
          ) : (
             <div className="grid grid-cols-3 gap-2">
                {filteredItems.map(item => (
                  <Card 
                      key={'inventoryId' in item ? item.inventoryId : item.id} 
                      className={cn("p-1.5 cursor-pointer transition-all border-2", isSelected(item) ? 'border-primary' : 'border-transparent')}
                      onClick={() => onSelect(item)}
                  >
                      <div className="aspect-square relative">
                          <Image src={item.image} alt={item.name} fill sizes="30vw" className="object-contain p-1" data-ai-hint={item.imageHint}/>
                      </div>
                      <p className="text-xs font-bold truncate mt-1 text-center">{item.name}</p>
                  </Card>
                ))}
            </div>
          )}
        </ScrollArea>
         {isMultiSelect && (
          <div className="flex-shrink-0 mt-2">
            <Button onClick={onClose} className="w-full">
              Подтвердить
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const UpgradeResultModal = ({ isOpen, onClose, isSuccess, item, onAnimationEnd }: { isOpen: boolean, onClose: () => void, isSuccess: boolean, item: Item | null, onAnimationEnd: () => void }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(onAnimationEnd, 1500); // Wait for animation
            return () => clearTimeout(timer);
        }
    }, [isOpen, onAnimationEnd]);
    
    if (!item) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xs text-center" onInteractOutside={(e) => e.preventDefault()}>
                 <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{isSuccess ? "Успешный апгрейд!" : "Неудача!"}</DialogTitle>
                </DialogHeader>
                 <div className="flex flex-col items-center gap-4 py-4">
                    <Card className={cn("p-4 flex flex-col items-center justify-center w-40 h-40 border-0 shadow-lg", isSuccess ? "bg-green-500/10" : "bg-red-500/10")}>
                        <div className="aspect-square relative w-32 h-32">
                            <Image src={item.image} alt={item.name} fill sizes="30vw" className="object-contain drop-shadow-lg" data-ai-hint={item.imageHint} />
                        </div>
                    </Card>
                     <div>
                        <p className="text-lg font-bold">{item.name}</p>
                    </div>
                 </div>
                 <Button className="w-full" onClick={onClose}>Продолжить</Button>
            </DialogContent>
        </Dialog>
    );
};

export default function UpgradePage() {
    const { inventory, addInventoryItem, removeInventoryItems } = useUser();
    const { showAlert } = useAlertDialog();
    
    const [yourItems, setYourItems] = useState<InventoryItem[]>([]);
    const [targetItem, setTargetItem] = useState<Item | null>(null);

    const [isYourItemsModalOpen, setIsYourItemsModalOpen] = useState(false);
    const [isTargetItemModalOpen, setIsTargetItemModalOpen] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [upgradeResult, setUpgradeResult] = useState<'success' | 'failure' | null>(null);

    const upgradableItems = useMemo(() => {
        return inventory?.filter(item => item.isUpgradable) || [];
    }, [inventory]);

    const targetableNfts = useMemo(() => {
        return MOCK_ITEMS.filter(item => item.isTargetable);
    }, []);
    
    const { chance, multiplier } = useMemo(() => {
        if (yourItems.length === 0 || !targetItem) {
            return { chance: 0, multiplier: 0 };
        }
        const yourValue = yourItems.reduce((sum, item) => sum + item.value, 0);
        const targetValue = targetItem.value;
        const calculatedChance = Math.min((yourValue / targetValue) * 75, 95);
        const calculatedMultiplier = targetValue / yourValue;
        return { 
            chance: parseFloat(calculatedChance.toFixed(1)), 
            multiplier: parseFloat(calculatedMultiplier.toFixed(1)) 
        };
    }, [yourItems, targetItem]);

    const handleSelectYourItem = (item: InventoryItem) => {
        setYourItems(prev => {
            const isSelected = prev.some(i => i.inventoryId === item.inventoryId);
            if (isSelected) {
                return prev.filter(i => i.inventoryId !== item.inventoryId);
            } else {
                return [...prev, item];
            }
        });
    };

    const handleSelectTargetItem = (item: Item) => {
        setTargetItem(item);
        setIsTargetItemModalOpen(false);
    };

    const handleUpgrade = () => {
        if (yourItems.length === 0 || !targetItem) return;

        setIsUpgrading(true);
        const random = Math.random() * 100;
        const isSuccess = random <= chance;
        
        setTimeout(() => {
            if (isSuccess) {
                setUpgradeResult('success');
                const yourItemIds = yourItems.map(i => i.inventoryId);
                removeInventoryItems(yourItemIds);
                addInventoryItem(targetItem);
            } else {
                setUpgradeResult('failure');
                 const yourItemIds = yourItems.map(i => i.inventoryId);
                removeInventoryItems(yourItemIds);
            }
        }, 3000); // Simulate upgrade duration
    };

    const resetUpgrade = () => {
        setIsUpgrading(false);
        setUpgradeResult(null);
        setYourItems([]);
        setTargetItem(null);
    };

    return (
        <>
            <div className="flex flex-col h-full text-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-6">
                    Апгрейд NFT
                </h1>

                 <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute left-4 text-lg font-bold text-green-400">{chance}%</div>
                     <div className="relative w-40 h-40">
                        {isUpgrading ? (
                             <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-24 h-24 text-primary animate-spin" />
                            </div>
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-gray-800 rounded-full animate-pulse opacity-20" />
                                <div className="absolute inset-2 bg-gray-900 rounded-full" />
                                <div className="absolute inset-4 border-4 border-gray-800 rounded-full" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <DiamondIcon className="w-16 h-16 text-cyan-400" />
                                </div>
                             </>
                        )}
                    </div>
                    <div className="absolute right-4 text-lg font-bold text-cyan-400">x{multiplier.toFixed(1)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                     <Card className="h-32 flex flex-col items-center justify-center bg-card/50 border-dashed border-2 cursor-pointer hover:bg-card/70 relative group" onClick={() => setIsYourItemsModalOpen(true)}>
                        {yourItems.length > 0 ? (
                            <>
                                <div className="absolute top-1 right-1 flex items-center gap-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                                    <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={12} height={12}/>
                                    {yourItems.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                                </div>
                                <div className="grid grid-cols-2 gap-1 p-1">
                                    {yourItems.slice(0, 4).map(item => (
                                         <div key={item.inventoryId} className="relative w-12 h-12">
                                            <Image src={item.image} alt={item.name} fill sizes="10vw" className="object-contain" />
                                        </div>
                                    ))}
                                </div>
                                {yourItems.length > 4 && <div className="absolute bottom-1 right-1 text-xs font-bold bg-black/50 rounded-full px-1.5">+ {yourItems.length - 4}</div>}
                            </>
                        ) : (
                            <>
                                <div className="text-4xl text-muted-foreground">+</div>
                                <p className="text-sm text-muted-foreground">Выберите ваши предметы</p>
                            </>
                        )}
                    </Card>
                     <Card className="h-32 flex flex-col items-center justify-center bg-card/50 border-dashed border-2 cursor-pointer hover:bg-card/70 relative" onClick={() => setIsTargetItemModalOpen(true)}>
                         {targetItem ? (
                             <>
                                <div className="absolute top-1 right-1 flex items-center gap-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                                    <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={12} height={12}/>
                                    {targetItem.value.toLocaleString()}
                                </div>
                                <div className="relative w-24 h-24">
                                     <Image src={targetItem.image} alt={targetItem.name} fill sizes="20vw" className="object-contain p-1" data-ai-hint={targetItem.imageHint}/>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-4xl text-muted-foreground">+</div>
                                <p className="text-sm text-muted-foreground">Выберите желаемый NFT</p>
                            </>
                        )}
                    </Card>
                </div>
                
                 <Button className="w-full h-14 text-lg mb-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" disabled={yourItems.length === 0 || !targetItem || isUpgrading} onClick={handleUpgrade}>
                    {isUpgrading ? <Loader2 className="animate-spin" /> : 'Апгрейд'}
                </Button>

                <div className="flex-grow flex flex-col bg-card rounded-t-2xl p-4 min-h-0">
                    <p className="text-center font-bold mb-2">Ваш инвентарь для апгрейда</p>
                    <ScrollArea className="h-full">
                        {upgradableItems.length === 0 ? (
                            <div className="text-center text-muted-foreground py-10">
                                В вашем инвентаре нет предметов для апгрейда.
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                {upgradableItems.map(item => (
                                    <Card 
                                        key={item.inventoryId} 
                                        className={cn("p-1.5 cursor-pointer transition-all border-2", yourItems.some(i => i.inventoryId === item.inventoryId) ? 'border-primary' : 'border-transparent')}
                                        onClick={() => handleSelectYourItem(item)}
                                    >
                                        <div className="aspect-square relative">
                                            <Image src={item.image} alt={item.name} fill sizes="30vw" className="object-contain p-1" data-ai-hint={item.imageHint}/>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>

            <ItemSelectionModal 
                isOpen={isYourItemsModalOpen}
                onClose={() => setIsYourItemsModalOpen(false)}
                items={upgradableItems}
                selectedItems={yourItems}
                onSelect={(item) => handleSelectYourItem(item as InventoryItem)}
                title="Выберите ваши предметы"
                isMultiSelect={true}
            />

            <ItemSelectionModal 
                isOpen={isTargetItemModalOpen}
                onClose={() => setIsTargetItemModalOpen(false)}
                items={targetableNfts}
                selectedItems={targetItem ? [targetItem] : []}
                onSelect={handleSelectTargetItem}
                title="Выберите желаемый NFT"
                isMultiSelect={false}
            />

            <UpgradeResultModal
                isOpen={!!upgradeResult}
                onClose={() => {}} // This modal is not closable by user action
                isSuccess={upgradeResult === 'success'}
                item={targetItem}
                onAnimationEnd={resetUpgrade}
            />
        </>
    );
}
