'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import type { Item, InventoryItem } from '@/lib/types';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ALL_ITEMS } from '@/lib/data';
import { useAlertDialog } from '@/contexts/AlertDialogContext';
import { useTranslation } from '@/contexts/LanguageContext';

export default function UpgradePage() {
    const { inventory, addInventoryItem, removeInventoryItems } = useUser();
    const { showAlert } = useAlertDialog();
    
    const [yourItems, setYourItems] = useState<InventoryItem[]>([]);
    const [targetItem, setTargetItem] = useState<Item | null>(null);

    const [isYourItemsModalOpen, setIsYourItemsModalOpen] = useState(false);
    const [isTargetItemModalOpen, setIsTargetItemModalOpen] = useState(false);
    
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [upgradeResult, setUpgradeResult] = useState<'success' | 'failure' | null>(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [spinnerRotation, setSpinnerRotation] = useState(0);
    const [useTransition, setUseTransition] = useState(true);
    const spinnerRef = useRef<HTMLDivElement>(null);

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
      const { t } = useTranslation();
    
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
                placeholder={t('upgradePage.quickSearch')} 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <ScrollArea className="flex-grow">
              {filteredItems.length === 0 ? (
                 <div className="text-center text-muted-foreground py-10">
                    {t('upgradePage.notFound')}
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
                  {t('upgradePage.confirm')}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      );
    };
    
    const UpgradeResultModal = ({ isOpen, onClose, isSuccess, item }: { isOpen: boolean, onClose: () => void, isSuccess: boolean, item: Item | null }) => {
        const { t } = useTranslation();
        if (!item) return null;
    
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-xs text-center p-0 rounded-2xl" onInteractOutside={onClose}>
                     <DialogHeader className="p-6 pb-4">
                        <DialogTitle className={cn("text-2xl font-bold", isSuccess ? "text-green-400" : "text-red-500")}>
                            {isSuccess ? t('upgradePage.successTitle') : t('upgradePage.failureTitle')}
                        </DialogTitle>
                    </DialogHeader>
                     <div className="flex flex-col items-center gap-4 py-2 px-6">
                        <Card className={cn("p-4 flex flex-col items-center justify-center w-40 h-40 border-0 shadow-lg", isSuccess ? "bg-green-900/20" : "bg-red-900/20")}>
                            <div className={cn("aspect-square relative w-32 h-32", !isSuccess && "opacity-50 grayscale")}>
                                <Image src={item.image} alt={item.name} fill sizes="30vw" className="object-contain drop-shadow-lg" data-ai-hint={item.imageHint} />
                            </div>
                        </Card>
                         <div>
                            <p className="text-lg font-bold">{item.name}</p>
                        </div>
                     </div>
                     <DialogFooter className="p-4">
                        <Button className="w-full h-12 text-base" onClick={onClose}>{t('upgradePage.continueButton')}</Button>
                     </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    const upgradableItems = useMemo(() => {
        return inventory?.filter(item => item.isUpgradable) || [];
    }, [inventory]);
    
    const yourItemsValue = useMemo(() => {
        return yourItems.reduce((sum, item) => sum + item.value, 0);
    }, [yourItems]);

    const targetableItems = useMemo(() => {
        return ALL_ITEMS.filter(item => item.isTargetable && item.value > yourItemsValue);
    }, [yourItemsValue]);
    
    const { chance, multiplier } = useMemo(() => {
        if (yourItemsValue === 0 || !targetItem) {
            return { chance: 0, multiplier: 0 };
        }
        const targetValue = targetItem.value;
        const calculatedChance = Math.min((yourItemsValue / targetValue) * 100, 95);
        const calculatedMultiplier = targetValue / yourItemsValue;
        return { 
            chance: parseFloat(calculatedChance.toFixed(1)), 
            multiplier: parseFloat(calculatedMultiplier.toFixed(1)) 
        };
    }, [yourItemsValue, targetItem]);
    
    const greenZoneAngle = chance * 3.6;
    const { t } = useTranslation();

    useEffect(() => {
        if (targetItem && targetItem.value <= yourItemsValue) {
            setTargetItem(null);
        }
    }, [yourItemsValue, targetItem]);

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
        if (yourItems.length === 0 || !targetItem || isUpgrading) return;
        
        setUseTransition(true);
        setIsUpgrading(true);
        setUpgradeResult(null);

        const randomOutcome = Math.random() * 100;
        const isSuccess = randomOutcome <= chance;
        
        const baseRotations = 4 * 360; 
        let stopAngle;

        if (isSuccess) {
            const margin = greenZoneAngle > 5 ? 2 : 0;
            stopAngle = margin + Math.random() * (greenZoneAngle - margin * 2);
        } else {
            const redZoneSize = 360 - greenZoneAngle;
            const margin = redZoneSize > 5 ? 2 : 0;
            stopAngle = greenZoneAngle + margin + Math.random() * (redZoneSize - margin * 2);
        }
        
        const totalRotation = baseRotations + stopAngle;
        setSpinnerRotation(totalRotation);
        
        setTimeout(() => {
            const yourItemIds = yourItems.map(i => i.inventoryId);
            removeInventoryItems(yourItemIds);

            if (isSuccess && targetItem) {
                addInventoryItem(targetItem);
                setUpgradeResult('success');
            } else {
                setUpgradeResult('failure');
            }

            setTimeout(() => {
                 setShowResultModal(true);
            }, 1000);
            
        }, 5000); // Corresponds to animation duration + a small buffer
    };

    const resetUpgrade = () => {
        setShowResultModal(false);
        setUpgradeResult(null);
        setYourItems([]);
        setTargetItem(null);
        setIsUpgrading(false);
        
        // Reset rotation logic
        setUseTransition(false); // Disable transition for instant reset
        setSpinnerRotation(0);
        
        // Force a reflow to ensure the transform is applied without transition
        if(spinnerRef.current) {
            // Reading a property like offsetHeight forces the browser to reflow
            void spinnerRef.current.offsetHeight;
        }

        // Re-enable transition for the next spin
        setTimeout(() => {
            setUseTransition(true);
        }, 50);
    };
    
    const resultGlowClass = upgradeResult === 'success' 
        ? 'shadow-[0_0_30px_8px_theme(colors.green.500)]' 
        : upgradeResult === 'failure' 
        ? 'shadow-[0_0_30px_8px_theme(colors.red.600)]'
        : '';
        
    const spinnerBgClass = isUpgrading 
        ? 'animate-pulse' 
        : (upgradeResult === 'success' 
            ? 'bg-green-500' 
            : (upgradeResult === 'failure' ? 'bg-red-600' : ''));

    return (
        <>
            <div className="flex flex-col h-full text-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent mb-6">
                    {t('upgradePage.title')}
                </h1>

                <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute left-0 text-lg font-bold text-green-400">{chance}%</div>
                     <div className="relative w-40 h-40">
                         <div 
                            className={cn(
                                "w-full h-full rounded-full transition-all duration-500",
                                spinnerBgClass,
                                resultGlowClass
                            )}
                            style={{
                                background: !isUpgrading && !upgradeResult
                                    ? `conic-gradient(from 0deg, hsl(var(--primary)) 0deg ${greenZoneAngle}deg, #3f3f46 ${greenZoneAngle}deg 360deg)`
                                    : '',
                            }}
                        />
                        
                        <div className="absolute inset-1.5 bg-card rounded-full" />
                        
                        <div 
                            ref={spinnerRef}
                            className="absolute inset-0 flex items-start justify-center"
                            style={{ 
                                transform: `rotate(${spinnerRotation}deg)`,
                                transition: useTransition ? `transform 4500ms cubic-bezier(0.25, 1, 0.5, 1)` : 'none',
                             }}
                        >
                             <div className="h-1/2 w-0.5 bg-white shadow-lg" style={{ boxShadow: '0 0 10px white' }}/>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center text-primary text-4xl font-bold">
                            {isUpgrading ? '' : `x${multiplier.toFixed(1)}`}
                        </div>
                     </div>
                    <div className="absolute right-0 text-lg font-bold text-primary">x{multiplier.toFixed(1)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                     <Card className="h-32 flex flex-col items-center justify-center bg-card/50 border-dashed border-2 border-muted cursor-pointer hover:border-primary relative group" onClick={() => !isUpgrading && setIsYourItemsModalOpen(true)}>
                        {yourItems.length > 0 ? (
                            <>
                                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded-full z-10">
                                    <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={12} height={12}/>
                                    {yourItemsValue.toLocaleString()}
                                </div>
                                <div className="grid grid-cols-2 gap-1 p-1">
                                    {yourItems.slice(0, 4).map(item => (
                                         <div key={item.inventoryId} className="relative w-12 h-12">
                                            <Image src={item.image} alt={item.name} fill sizes="10vw" className="object-contain" data-ai-hint={item.imageHint}/>
                                        </div>
                                    ))}
                                </div>
                                {yourItems.length > 4 && <div className="absolute bottom-1 right-1 text-xs font-bold bg-black/50 rounded-full px-1.5">+ {yourItems.length - 4}</div>}
                            </>
                        ) : (
                            <>
                                <div className="text-4xl text-muted-foreground">+</div>
                                <p className="text-sm text-muted-foreground">{t('upgradePage.selectYourItems')}</p>
                            </>
                        )}
                    </Card>
                     <Card className="h-32 flex flex-col items-center justify-center bg-card/50 border-dashed border-2 border-muted cursor-pointer hover:border-primary relative" onClick={() => !isUpgrading && setIsTargetItemModalOpen(true)}>
                         {targetItem ? (
                             <>
                                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded-full z-10">
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
                                <p className="text-sm text-muted-foreground">{t('upgradePage.selectTargetNft')}</p>
                            </>
                        )}
                    </Card>
                </div>
                
                 <Button className="w-full h-14 text-lg mb-4 bg-gradient-to-r from-primary to-amber-400 hover:from-primary/90 hover:to-amber-400/90 text-black" disabled={yourItems.length === 0 || !targetItem || isUpgrading} onClick={handleUpgrade}>
                    {isUpgrading ? "Upgrading..." : t('upgradePage.upgradeButton')}
                </Button>

                <div className="flex-grow flex flex-col bg-card rounded-t-2xl p-4 min-h-0">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-center font-bold">{t('upgradePage.yourInventoryForUpgrade')}</p>
                        {yourItems.length > 0 && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYourItems([])}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <ScrollArea className="h-full">
                        {upgradableItems.length === 0 ? (
                            <div className="text-center text-muted-foreground py-10">
                                {t('upgradePage.emptyInventory')}
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                {upgradableItems.map(item => (
                                    <Card 
                                        key={item.inventoryId} 
                                        className={cn("p-1.5 cursor-pointer transition-all border-2", yourItems.some(i => i.inventoryId === item.inventoryId) ? 'border-primary' : 'border-transparent', isUpgrading && "opacity-50 pointer-events-none")}
                                        onClick={() => !isUpgrading && handleSelectYourItem(item)}
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
                title={t('upgradePage.selectYourItems')}
                isMultiSelect={true}
            />

            <ItemSelectionModal 
                isOpen={isTargetItemModalOpen}
                onClose={() => setIsTargetItemModalOpen(false)}
                items={targetableItems}
                selectedItems={targetItem ? [targetItem] : []}
                onSelect={(item) => handleSelectTargetItem(item as Item)}
                title={t('upgradePage.selectTargetNft')}
                isMultiSelect={false}
            />

            <UpgradeResultModal
                isOpen={showResultModal}
                onClose={resetUpgrade}
                isSuccess={upgradeResult === 'success'}
                item={targetItem}
            />
        </>
    );
}

    