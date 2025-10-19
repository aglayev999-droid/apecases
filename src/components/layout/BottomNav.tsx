'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, User as UserIcon, BarChart3, Rocket, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiamondIcon } from '@/components/icons/DiamondIcon';

const navItems = [
  { href: '/inventory', label: 'Inventory', icon: Box },
  { href: '/profile', label: 'Profile', icon: UserIcon },
  { href: '/giveaways', label: 'Giveaways', icon: Gift },
  { href: '/', label: 'Cases', icon: Box, isMain: true },
  { href: '/rocket', label: 'Rocket', icon: Rocket, isBeta: true },
  { href: '/upgrade', label: 'Upgrade', icon: DiamondIcon, isBeta: true },
  { href: '/leaderboard', label: 'Rating', icon: BarChart3 },
];

const mainButtonIndex = navItems.findIndex(item => item.isMain);

export default function BottomNav() {
  const pathname = usePathname();

  const getGridPosition = (index: number) => {
    if (index < mainButtonIndex) return `col-start-${index + 1}`;
    if (index > mainButtonIndex) return `col-start-${index + 2}`;
    return `col-start-${mainButtonIndex + 1}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-sm border-t border-border md:hidden rounded-t-xl">
      <div className="container mx-auto max-w-md px-2">
        <div className="grid h-20 grid-cols-7 items-center">
          {navItems.map((item, index) => {
            const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href) && item.href.length > 1;

            if (item.isMain) {
              return (
                <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center -mt-6", getGridPosition(index))}>
                  <div className={cn(
                    'rounded-full p-2 transition-all transform',
                    pathname === '/' ? 'bg-primary shadow-lg' : 'bg-card border'
                  )}>
                    <div className="relative h-14 w-14">
                      <img
                        src="https://i.ibb.co/ZpJBWrdY/626624c3-f89f-4f89-9d69-35d6ec78c83f-removebg-preview.png"
                        alt="Cases"
                        className="object-contain p-1"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("flex flex-col items-center justify-center gap-1", getGridPosition(index))}
              >
                <div className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors w-[60px] relative',
                  isActive ? 'bg-primary/20' : ''
                )}>
                  {item.isBeta && <span className="absolute top-0 right-0 text-[8px] bg-accent text-accent-foreground px-1 rounded-full">beta</span>}
                  <item.icon className={cn(
                    'h-6 w-6',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span className={cn(
                    'text-xs font-bold',
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
