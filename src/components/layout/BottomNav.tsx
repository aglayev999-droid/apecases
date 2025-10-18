'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Swords, Trophy, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { StarIcon } from '../icons/StarIcon';
import { DiamondIcon } from '../icons/DiamondIcon';

const navItems = [
  { href: '/', label: 'Cases', icon: Box },
  { href: '/inventory', label: 'Inventory', icon: Swords },
  { href: '/leaderboard', label: 'Ranking', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="container mx-auto max-w-md px-2">
        {user && (
           <div className="sm:hidden flex justify-center items-center gap-4 py-1.5">
              <div className="flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs border">
                <StarIcon className="h-4 w-4 text-yellow-400" />
                <span className="font-semibold">{formatNumber(user.balance.stars)}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs border">
                <DiamondIcon className="h-4 w-4 text-cyan-400" />
                <span className="font-semibold">{formatNumber(user.balance.diamonds)}</span>
              </div>
            </div>
        )}
        <div className="grid h-16 grid-cols-4 items-center">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-6 w-6" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
