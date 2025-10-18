'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, User as UserIcon, BarChart3, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const navItems = [
  { href: '/inventory', label: 'Inventory', icon: Box },
  { href: '/profile', label: 'Profile', icon: UserIcon },
  { href: '/', label: 'Cases', icon: Box },
  { href: '/rocket', label: 'Rocket', icon: Rocket, isBeta: true },
  { href: '/leaderboard', label: 'Rating', icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();

  const middleIndex = Math.floor(navItems.length / 2);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-sm border-t border-border md:hidden rounded-t-xl">
      <div className="container mx-auto max-w-md px-2">
        <div className="grid h-20 grid-cols-5 items-center">
          {navItems.map((item, index) => {
            const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
            
            if (index === middleIndex && item.href === '/') {
                return (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center -mt-6">
                        <div className={cn(
                            'rounded-full p-2 transition-all transform',
                            isActive ? 'bg-primary shadow-lg' : 'bg-card border'
                        )}>
                            <div className="relative h-14 w-14">
                                <Image
                                    src="https://i.ibb.co/F4V0dGX3/Apex-Case.png"
                                    alt="Cases"
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>
                        </div>
                    </Link>
                )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1"
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
