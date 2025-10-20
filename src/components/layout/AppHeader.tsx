'use client';

import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import Link from 'next/link';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DEFAULT_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

const starPackages = [200, 500, 1000, 2500, 5000];

const BalanceTopUpDialog = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const { user } = useUser();
    const [amount, setAmount] = useState('');

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm p-4">
                <DialogHeader className="text-center items-center -mb-2">
                    <DialogTitle className="text-xl font-bold">Выберите способ пополнения</DialogTitle>
                    <DialogDescription>
                        Введите сумму для пополнения
                    </DialogDescription>
                    <DialogClose className="absolute right-2 top-2 p-1">
                        <X className="h-5 w-5" />
                    </DialogClose>
                </DialogHeader>
                <Tabs defaultValue="stars" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="stars">STARS ★</TabsTrigger>
                        <TabsTrigger value="ton" disabled>TON ♦</TabsTrigger>
                    </TabsList>
                    <TabsContent value="stars" className="space-y-4 pt-4">
                        <div className="relative">
                            <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={20} height={20} className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 object-contain" />
                            <Input 
                                type="number"
                                placeholder="Сумма"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-10 text-base"
                            />
                        </div>

                        <div className='text-right text-sm text-muted-foreground'>
                            Баланс: {user?.balance.stars.toLocaleString() || 0} ★
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
                                    {pkg} ★
                                </Button>
                            ))}
                        </div>

                        <Button disabled className="w-full h-12 text-base">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                            Пополнить
                        </Button>

                        <div className="flex items-center gap-4">
                            <div className="flex-grow border-t border-dashed"></div>
                            <span className="text-muted-foreground text-sm">ИЛИ</span>
                            <div className="flex-grow border-t border-dashed"></div>
                        </div>

                        <Button variant="secondary" className="w-full h-12 text-base" onClick={() => window.open('https://t.me/onecase_relayer', '_blank')}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                           Подарки
                           <span className="text-muted-foreground text-xs ml-1">(Отправьте подарок)</span>
                        </Button>

                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
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
