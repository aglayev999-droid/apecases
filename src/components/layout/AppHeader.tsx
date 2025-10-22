'use client';

import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Plus, X, Search, ArrowUpDown, Send, ShieldCheck, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';
import type { InventoryItem } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { useAlertDialog } from '@/contexts/AlertDialogContext';

const DEFAULT_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';
const OFFICIAL_DEPOSIT_ID = '@nullprime';

const starPackages = [200, 500, 1000, 2500, 5000];

const DepositViaItemDialog = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const { inventory, updateBalance, removeInventoryItem } = useUser();
    const { t } = useTranslation();
    const { showAlert } = useAlertDialog();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const giftableItems = useMemo(() => {
        return inventory || [];
    }, [inventory]);

    const filteredAndSortedItems = useMemo(() => {
        let items = [...giftableItems];
        if (searchQuery) {
            items = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        items.sort((a, b) => {
            if (sortOrder === 'desc') return b.value - a.value;
            return a.value - b.value;
        });
        return items;
    }, [giftableItems, searchQuery, sortOrder]);

    const handleConfirmDeposit = () => {
        if (!selectedItem) return;
        
        updateBalance(selectedItem.value);
        removeInventoryItem(selectedItem.inventoryId);

        showAlert({
            title: t('header.depositSuccessTitle'),
            description: t('header.depositSuccessDescription', { value: selectedItem.value }),
        });
        
        onOpenChange(false);
    }
    
    useEffect(() => {
        if (!isOpen) {
            setSelectedItem(null);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-4 flex flex-col h-[80vh]">
                <DialogHeader className="text-center items-center">
                    <DialogTitle className="text-xl font-bold text-primary">{t('header.depositViaItemTitle')}</DialogTitle>
                     <DialogDescription className="text-center px-4">
                        {t('header.depositViaItemDescription')}
                    </DialogDescription>
                </DialogHeader>
                
                 <div className="flex gap-2">
                    <div className="relative flex-grow">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder={t('upgradePage.quickSearch')}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        {t('header.sortByValue')}
                    </Button>
                </div>

                <ScrollArea className="flex-grow my-2">
                    <div className="space-y-2">
                        {filteredAndSortedItems.map(item => (
                            <Card 
                                key={item.inventoryId}
                                className={cn(
                                    "p-2 flex items-center justify-between cursor-pointer border-2 transition-all",
                                    selectedItem?.inventoryId === item.inventoryId ? 'border-primary shadow-lg shadow-primary/20' : 'border-transparent'
                                )}
                                onClick={() => setSelectedItem(item)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-card p-1 border">
                                        <Image src={item.image} alt={item.name} fill sizes="10vw" className="object-contain" />
                                    </div>
                                    <span className="font-semibold">{item.name}</span>
                                </div>
                                 <div className="flex items-center gap-1 font-bold text-primary">
                                    {item.value.toLocaleString()}
                                    <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={16} height={16} className="h-4 w-4" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
                
                <DialogFooter className="flex-col gap-2 pt-2 border-t">
                     <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-bold text-muted-foreground">{t('header.recipientFixedLabel')}</span>
                        </div>
                        <span className="text-sm font-mono">{OFFICIAL_DEPOSIT_ID}</span>
                    </div>

                    {selectedItem && (
                        <div className="text-center my-2 text-primary font-bold">
                            {t('header.amountToCredit', { value: selectedItem.value.toLocaleString() })}
                        </div>
                    )}
                    
                    <Button
                        className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-amber-400 hover:from-primary/90 hover:to-amber-400/90 text-black"
                        disabled={!selectedItem}
                        onClick={handleConfirmDeposit}
                    >
                        {t('header.confirmDepositButton')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const BalanceTopUpDialog = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const { user } = useUser();
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');
    const [isDepositViaItemOpen, setIsDepositViaItemOpen] = useState(false);

    const handleDepositViaItemClick = () => {
        onOpenChange(false);
        setIsDepositViaItemOpen(true);
    };

    return (
        <>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm p-4">
                <DialogHeader className="text-center items-center -mb-2">
                    <DialogTitle className="text-xl font-bold">{t('header.balanceTopUpTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('header.balanceTopUpDescription')}
                    </DialogDescription>
                    <DialogClose className="absolute right-2 top-2 p-1">
                        <X className="h-5 w-5" />
                    </DialogClose>
                </DialogHeader>
                <Tabs defaultValue="stars" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="stars">{t('header.starsTab')}</TabsTrigger>
                        <TabsTrigger value="ton" disabled>{t('header.tonTab')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="stars" className="space-y-4 pt-4">
                        <div className="relative">
                            <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={20} height={20} className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 object-contain" />
                            <Input 
                                type="number"
                                placeholder={t('header.amountPlaceholder')}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-10 text-base"
                            />
                        </div>

                        <div className='text-right text-sm text-muted-foreground'>
                            {t('header.balanceLabel')}: {user?.balance.stars.toLocaleString() || 0} ★
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {starPackages.map((pkg) => (
                                <Button 
                                    key={pkg}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setAmount(String(pkg))}
                                >
                                    {pkg.toLocaleString()} ★
                                </Button>
                            ))}
                        </div>

                        <Button disabled className="w-full h-12 text-base bg-gradient-to-r from-primary/50 to-amber-400/50 text-black">
                            <CreditCard className="mr-2 h-5 w-5" />
                            {t('header.topUpButton')}
                        </Button>

                        <div className="flex items-center gap-4">
                            <div className="flex-grow border-t border-dashed"></div>
                            <span className="text-muted-foreground text-sm">{t('header.orSeparator')}</span>
                            <div className="flex-grow border-t border-dashed"></div>
                        </div>

                        <Button 
                            variant="secondary" 
                            className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-amber-400 hover:from-primary/90 hover:to-amber-400/90 text-black" 
                            onClick={handleDepositViaItemClick}
                        >
                           <Send className="mr-2 h-5 w-5"/>
                           {t('header.depositViaItemButton')}
                        </Button>

                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
        <DepositViaItemDialog isOpen={isDepositViaItemOpen} onOpenChange={setIsDepositViaItemOpen} />
        </>
    )
}

export default function AppHeader() {
  const { user, isUserLoading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return '...';
    return new Intl.NumberFormat('en-US').format(num);
  };
  
  if (!mounted) {
    return (
        <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                </div>
                 <div className="flex items-center gap-2 sm:gap-4">
                    <Skeleton className="h-8 w-28 rounded-full" />
                 </div>
            </div>
        </header>
    )
  }

  return (
    <>
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
        <div className="flex items-center gap-2">
          {isUserLoading ? (
             <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
             </div>
          ) : user && (
            <div className="flex items-center gap-2">
               <Link href="/profile">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                      <AvatarImage src={user.avatar || DEFAULT_AVATAR} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
               </Link>
               <div className="flex items-center gap-1 rounded-full bg-card p-1 border">
                <div className="flex items-center gap-1 text-yellow-400 pl-2">
                  <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={20} height={20} className="h-5 w-5 object-contain" />
                  <span className="font-bold text-sm text-foreground">{formatNumber(user.balance.stars)}</span>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-green-500 hover:bg-green-600" onClick={() => setIsTopUpOpen(true)}>
                  <Plus className="h-4 w-4 text-primary-foreground" />
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <TonConnectButton />
        </div>
      </div>
    </header>
    <BalanceTopUpDialog isOpen={isTopUpOpen} onOpenChange={setIsTopUpOpen} />
    </>
  );
}
