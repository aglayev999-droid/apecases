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
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card md:hidden">
      <div className="container mx-auto max-w-md px-2">
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
