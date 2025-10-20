'use client';

import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const DEFAULT_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

const starPackages = [
    { amount: 1000, priceTon: 0.1 },
    { amount: 5000, priceTon: 0.45 },
    { amount: 10000, priceTon: 0.8 },
    { amount: 25000, priceTon: 1.8 },
];

const BalanceTopUpDialog = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold">Top Up Balance</DialogTitle>
                    <DialogDescription className="text-center">
                        Select a package to buy Stars with TON.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    {starPackages.map((pkg) => (
                        <Card key={pkg.amount} className="p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted">
                            <div className="flex items-center gap-2">
                                <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={24} height={24} className="h-6 w-6 object-contain" />
                                <span className="text-xl font-bold">{pkg.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-primary font-semibold mt-2">
                               <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><path d="M10.424 16.5414L15.3533 5.45874C15.5457 5.04949 16.2052 5.04949 16.3976 5.45874L21.3269 16.5414C21.5476 17.0014 21.1896 17.5 20.6693 17.5H11.0822C10.5619 17.5 10.2039 17.0014 10.4246 16.5414" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M15.876 17.5L18.4355 22.0412C18.6562 22.5012 18.2982 23 17.7779 23H8.1908C7.67051 23 7.31251 22.5012 7.53321 22.0412L10.0927 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M10.0927 17.5L7.53321 12.9588C7.31251 12.4988 7.67051 12 8.1908 12H17.7779C18.2982 12 18.6562 12.4988 18.4355 12.9588L15.876 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M15.876 17.5H10.0927" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                               <span>{pkg.priceTon} TON</span>
                            </div>
                        </Card>
                    ))}
                </div>
                 <Button disabled className="w-full">Purchase (Coming Soon)</Button>
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
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
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
