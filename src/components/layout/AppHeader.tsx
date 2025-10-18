'use client';

import { useUser } from '@/contexts/UserContext';
import { StarIcon } from '@/components/icons/StarIcon';
import { DiamondIcon } from '@/components/icons/DiamondIcon';
import { Button } from '@/components/ui/button';
import { MoreVertical, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { TonConnectButton } from '@tonconnect/ui-react';

export default function AppHeader() {
  const { user } = useUser();

  const formatNumber = (num: number) => {
    // Format to 2 decimal places, but remove trailing .00
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
    return formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted;
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
              <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-primary">
                <Plus className="h-4 w-4 text-primary-foreground" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-green-500/20 text-green-400">
                <span className="font-bold text-sm">D</span>
              </Button>
            </div>
          )}

          <TonConnectButton />

          <div className='flex items-center'>
            <Button size="icon" variant="ghost">
                <MoreVertical className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost">
                <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
