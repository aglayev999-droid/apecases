'use client';

import { useUser } from '@/contexts/UserContext';
import { StarIcon } from '@/components/icons/StarIcon';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DEFAULT_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

export default function AppHeader() {
  const { user } = useUser();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2">
               <Link href="/profile">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                      <AvatarImage src={DEFAULT_AVATAR} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
               </Link>
               <div className="flex items-center gap-1 rounded-full bg-card p-1 border">
                <div className="flex items-center gap-1 text-yellow-400 pl-2">
                  <StarIcon className="h-5 w-5" />
                  <span className="font-semibold text-sm">{formatNumber(user.balance.stars)}</span>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-green-500">
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
  );
}
