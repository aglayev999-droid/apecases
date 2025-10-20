

'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Copy, Moon, Sun, Settings, Check, Trash2, X, ArrowRightLeft, Goal, Swords } from 'lucide-react';
import { useAlertDialog } from '@/contexts/AlertDialogContext';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';
import { InventoryCard } from '@/components/InventoryCard';
import type { InventoryItem } from '@/lib/types';
import Link from 'next/link';
import { useTonWallet } from '@tonconnect/ui-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Progress } from "@/components/ui/progress"


const DEFAULT_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

const LanguageSelector = () => {
    const { language, setLanguage, t } = useTranslation();
    
    return (
        <div className="space-y-2">
            <h3 className="font-semibold text-foreground">{t('profilePage.languageTitle')}</h3>
            <RadioGroup defaultValue={language} onValueChange={(value) => setLanguage(value as 'en' | 'ru' | 'uz')}>
                <Label className="flex items-center justify-between p-4 rounded-lg bg-card cursor-pointer hover:bg-muted">
                    <span>{t('profilePage.lang_uz')}</span>
                    <RadioGroupItem value="uz" id="lang-uz" />
                </Label>
                <Label className="flex items-center justify-between p-4 rounded-lg bg-card cursor-pointer hover:bg-muted">
                    <span>{t('profilePage.lang_ru')}</span>
                    <RadioGroupItem value="ru" id="lang-ru" />
                </Label>
                <Label className="flex items-center justify-between p-4 rounded-lg bg-card cursor-pointer hover:bg-muted">
                    <span>{t('profilePage.lang_en')}</span>
                    <RadioGroupItem value="en" id="lang-en" />
                </Label>
            </RadioGroup>
        </div>
    )
}

const ThemeSelector = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setMounted(true);
    }, []);
    
    if (!mounted) {
        return <Skeleton className="h-28 w-full" />
    }

    return (
         <div className="space-y-2">
            <h3 className="font-semibold text-foreground">{t('profilePage.themeTitle')}</h3>
            <div 
              className={cn(
                "flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-muted",
                theme === 'light' ? 'bg-card' : 'bg-transparent'
              )}
              onClick={() => setTheme('light')}
            >
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5" />
                <span>{t('profilePage.lightTheme')}</span>
              </div>
              {theme === 'light' && <Check className="h-5 w-5 text-primary" />}
            </div>
            <div 
              className={cn(
                "flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-muted",
                theme === 'dark' ? 'bg-card' : 'bg-transparent'
              )}
              onClick={() => setTheme('dark')}
            >
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5" />
                <span>{t('profilePage.darkTheme')}</span>
              </div>
              {theme === 'dark' && <Check className="h-5 w-5 text-primary" />}
            </div>
        </div>
    )
}

const EmptyInventory = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="relative w-40 h-40">
                <Image src="https://i.ibb.co/27KjDLVY/model0emoji-5936013938331222567-by-Gift-Changes-Helper2-Bot-Ag-AD6-Fo.png" alt="No Items" width={160} height={160} />
            </div>
            <h2 className="text-2xl font-bold mt-6">{t('inventoryPage.emptyInventoryTitle')}</h2>
            <p className="text-muted-foreground mt-2">
                {t('inventoryPage.emptyInventoryDescription')}
            </p>
            <div className="mt-8 space-y-4 w-full max-w-xs">
               <Link href="/" passHref>
                    <Button className="w-full" size="lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box mr-2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>
                        {t('inventoryPage.goToCases')}
                    </Button>
               </Link>
            </div>
        </div>
    );
}

const ItemActionModal = ({ 
    item, 
    isOpen, 
    onClose 
} : { 
    item: InventoryItem | null, 
    isOpen: boolean, 
    onClose: () => void 
}) => {
    const { showAlert } = useAlertDialog();
    const { removeInventoryItem, updateBalance } = useUser();
    const wallet = useTonWallet();
    const firestore = useFirestore();
    const { t } = useTranslation();
    const router = useRouter();

    const handleSell = () => {
        if (!item) return;
        updateBalance(item.value);
        removeInventoryItem(item.inventoryId);
        onClose();
        showAlert({
            title: t('inventoryPage.inventoryCard.itemSoldTitle'),
            description: t('inventoryPage.inventoryCard.itemSoldDescription', { name: item.name, value: item.value }),
        });
    };

    const handleWithdraw = async () => {
        if (!item) return;
        if (!wallet) {
            showAlert({
                title: t('inventoryPage.inventoryCard.walletNotConnectedTitle'),
                description: t('inventoryPage.inventoryCard.walletNotConnectedDescription'),
            });
            return;
        }
        if (!firestore) {
            showAlert({ title: 'Error', description: t('inventoryPage.inventoryCard.dbError') });
            return;
        }
        if (!item.collectionAddress) {
            showAlert({
                title: t('inventoryPage.inventoryCard.withdrawErrorTitle'),
                description: t('inventoryPage.inventoryCard.withdrawErrorDescription', { name: item.name }),
            });
            return;
        }

        try {
            const queueRef = collection(firestore, 'withdrawal_queue');
            await addDoc(queueRef, {
                user_wallet_address: wallet.account.address,
                nft_id: item.id,
                nft_contract_address: item.collectionAddress,
                status: 'pending',
                timestamp: serverTimestamp(),
            });
            removeInventoryItem(item.inventoryId);
            onClose();
            showAlert({
                title: t('inventoryPage.inventoryCard.withdrawRequestSentTitle'),
                description: t('inventoryPage.inventoryCard.withdrawRequestSentDescription', { name: item.name }),
            });
        } catch (error) {
            console.error("Error sending withdrawal request:", error);
            showAlert({
                title: t('inventoryPage.inventoryCard.withdrawFailedTitle'),
                description: t('inventoryPage.inventoryCard.withdrawFailedDescription'),
            });
        }
    };
    
    const handleUpgrade = () => {
        onClose();
        router.push('/upgrade');
    }
    
    if (!item) return null;

    const isNFT = item.rarity === 'NFT';
    const isUpgradable = item.isUpgradable ?? !isNFT;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xs text-center p-0 rounded-2xl" onInteractOutside={onClose}>
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-xl font-bold">{item.name}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 px-6">
                    <Card className="p-4 flex flex-col items-center justify-center w-48 h-48 border-0 shadow-lg bg-card">
                       <div className="aspect-square relative w-40 h-40">
                           <Image src={item.image} alt={item.name} fill sizes="40vw" className="object-contain drop-shadow-lg" data-ai-hint={item.imageHint} />
                       </div>
                    </Card>
                    <p className={cn("text-lg font-bold")}>{item.rarity}</p>
                 </div>
                 <DialogFooter className="p-4 flex flex-col gap-2">
                     {isUpgradable && (
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base" onClick={handleUpgrade}>
                           <ArrowRightLeft className="mr-2 h-4 w-4" />
                           {t('inventoryPage.inventoryCard.upgrade')}
                        </Button>
                     )}
                    <div className="grid grid-cols-2 gap-2">
                         <Button variant="destructive" className="h-12 text-base" onClick={handleSell}>
                            {t('inventoryPage.inventoryCard.sellFor')} {item.value}
                            <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={16} height={16} className="w-4 h-4 ml-1 object-contain" />
                        </Button>
                        <Button variant="secondary" className="h-12 text-base" onClick={handleWithdraw} disabled={!isNFT}>
                           {t('inventoryPage.inventoryCard.withdraw')}
                        </Button>
                    </div>
                 </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const InventorySection = () => {
  const { inventory, removeInventoryItems, updateBalance, isUserLoading } = useUser();
  const { showAlert } = useAlertDialog();
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const nonNftItems = React.useMemo(() => {
    if (!inventory) return [];
    return inventory.filter(item => item.rarity !== 'NFT');
  }, [inventory]);

  const totalSellValue = React.useMemo(() => {
    return nonNftItems.reduce((sum, item) => sum + item.value, 0);
  }, [nonNftItems]);


  const handleSellAll = () => {
    if (nonNftItems.length === 0) {
      showAlert({
        title: t('inventoryPage.nothingToSellTitle'),
        description: t('inventoryPage.nothingToSellDescription'),
      });
      return;
    }
    
    const itemIdsToSell = nonNftItems.map(item => item.inventoryId);
    
    updateBalance(totalSellValue);
    removeInventoryItems(itemIdsToSell);

    showAlert({
      title: t('inventoryPage.itemsSoldTitle'),
      description: t('inventoryPage.itemsSoldDescription', { value: totalSellValue }),
    });
  };
  
  if (isUserLoading) {
      return (
         <div className="space-y-4 mt-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">{t('inventoryPage.title')}</h1>
                <Skeleton className="h-9 w-40" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <Skeleton className="aspect-square w-full rounded-xl" />
                        <Skeleton className="h-5 w-2/3" />
                    </div>
                ))}
            </div>
        </div>
      )
  }

  if (!inventory || inventory.length === 0) {
    return <EmptyInventory />;
  }

  return (
    <>
      <div className="space-y-4 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">{t('inventoryPage.title')}</h1>
          <Button variant="destructive" size="sm" onClick={handleSellAll} disabled={nonNftItems.length === 0}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('inventoryPage.sellAll')} {totalSellValue}
               <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={16} height={16} className="w-4 h-4 ml-1 object-contain" />
          </Button>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {inventory.map((item: InventoryItem) => (
            <InventoryCard 
              key={item.inventoryId} 
              item={item} 
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>
      </div>
      <ItemActionModal item={selectedItem} isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  );
}

export default function ProfilePage() {
  const { user, isUserLoading, setHasNewItems } = useUser();
  const { showAlert } = useAlertDialog();
  const { t } = useTranslation();

  useEffect(() => {
    setHasNewItems(false);
  }, [setHasNewItems]);

  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const copyReferralCode = () => {
    if (!user || !user.referrals || !user.referrals.code) return;
    navigator.clipboard.writeText(user.referrals.code);
    showAlert({
      title: t('profilePage.copySuccessTitle'),
      description: t('profilePage.copySuccessDescription'),
    });
  }
  
  const MissionsSheet = ({ user }: { user: any }) => {
    const { t } = useTranslation();
    const goal = 1000;
    const currentProgress = user?.starsSpentOnCases || 0;
    const isCompleted = currentProgress >= goal;
    const progressPercentage = Math.min((currentProgress / goal) * 100, 100);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Goal className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{t('profilePage.missionsTitle')}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                    <Card className="p-4">
                        <div className="flex items-start gap-4">
                            <div className={cn("p-3 rounded-lg", isCompleted ? "bg-green-500/20" : "bg-primary/20")}>
                               <Swords className={cn("h-6 w-6", isCompleted ? "text-green-500" : "text-primary")} />
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold">{t('profilePage.missionUnlockBattles')}</p>
                                <p className="text-sm text-muted-foreground">{t('profilePage.missionUnlockBattlesDescription')}</p>
                                <Progress value={progressPercentage} className="mt-2 h-2" />
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-muted-foreground">
                                        {currentProgress.toLocaleString()} / {goal.toLocaleString()} ★
                                    </span>
                                    {isCompleted && <Check className="h-5 w-5 text-green-500" />}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </SheetContent>
        </Sheet>
    );
  };


  if (isUserLoading || !user) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
            <Skeleton className="h-6 w-64 mx-auto sm:mx-0" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <Sheet>
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                        <AvatarImage src={user.avatar || DEFAULT_AVATAR} alt={user.name} />
                        <AvatarFallback className="text-3xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex-grow">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">{user.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-muted-foreground text-sm">{t('profilePage.id')}: {user.telegramId}</p>
                    </div>
                </div>
                 <MissionsSheet user={user} />
                 <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <Settings className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
            </div>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{t('profilePage.settingsTitle')}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                    <ThemeSelector />
                    <LanguageSelector />
                </div>
            </SheetContent>
        </Sheet>
      
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t('profilePage.balancesTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-card-foreground/5 dark:bg-card-foreground/5">
              <div className="flex items-center gap-3">
                <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={32} height={32} className="h-8 w-8 object-contain" />
                <span className="text-lg font-bold">Stars</span>
              </div>
              <span className="text-xl font-mono font-bold">{formatNumber(user.balance.stars)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t('profilePage.referralProgramTitle')}</CardTitle>
            <CardDescription>{t('profilePage.referralProgramDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('profilePage.friendsReferred')}</span>
              <span className="font-bold text-lg">{user.referrals.count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('profilePage.commissionEarned')}</span>
              <div className="flex items-center gap-2 font-bold text-lg text-primary">
                <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={20} height={20} className="h-5 w-5 object-contain" />
                {formatNumber(user.referrals.commissionEarned)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input readOnly value={user.referrals.code} className="w-full bg-background border p-2 rounded-md font-mono text-sm" />
              <Button size="icon" variant="ghost" onClick={copyReferralCode}>
                <Copy className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <InventorySection />

    </div>
  );
}
