'use client';

import { useUser } from '@/contexts/UserContext';
import { StarIcon } from '@/components/icons/StarIcon';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { TonConnectButton } from '@tonconnect/ui-react';
import { DiamondIcon } from '../icons/DiamondIcon';

export default function AppHeader() {
  const { user } = useUser();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/">
             <h1 className="font-headline text-2xl font-bold tracking-wider">1CASE</h1>
          </Link>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <div className="flex items-center gap-1 sm:gap-2 rounded-full bg-card p-1 border">
              <div className="flex items-center gap-1 text-yellow-400">
                <StarIcon className="h-5 w-5" />
                <span className="font-semibold text-sm">{formatNumber(user.balance.stars)}</span>
              </div>
              <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-green-500">
                <Plus className="h-4 w-4 text-primary-foreground" />
              </Button>
            </div>
          )}

          <TonConnectButton />
        </div>
      </div>
    </header>
  );
}
