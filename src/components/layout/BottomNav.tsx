'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, User as UserIcon, Store, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';


const navItems = [
  { href: '/inventory', label: 'Inventory', icon: Box },
  { href: '/profile', label: 'Profile', icon: UserIcon },
  { href: '/', label: 'Cases', icon: Store },
  { href: '/leaderboard', label: 'Rating', icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-sm border-t border-border md:hidden rounded-t-xl">
      <div className="container mx-auto max-w-md px-2">
        <div className="grid h-16 grid-cols-4 items-center">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1"
              >
                <div className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors w-[60px]',
                    isActive ? 'bg-primary/20' : ''
                  )}>
                  <item.icon className={cn(
                    'h-6 w-6',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span className={cn(
                    'text-xs font-medium',
                     isActive ? 'text-primary' : 'text-muted-foreground'
                    )}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
