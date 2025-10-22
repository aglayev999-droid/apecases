
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User as UserIcon, BarChart3, Rocket, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiamondIcon } from '@/components/icons/DiamondIcon';
import { useTranslation } from '@/contexts/LanguageContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: '/battles', label: t('bottomNav.battles'), icon: Swords },
    { href: '/upgrade', label: t('bottomNav.upgrade'), icon: DiamondIcon, isBeta: true },
    { href: '/rocket', label: t('bottomNav.rocket'), icon: Rocket, isBeta: true },
    { href: '/', label: t('bottomNav.cases'), icon: 'main', isMain: true },
    { href: '/leaderboard', label: t('bottomNav.rating'), icon: BarChart3 },
    { href: '/profile', label: t('bottomNav.profile'), icon: UserIcon },
  ];
  
  const mainButtonIndex = navItems.findIndex(item => item.isMain);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-sm border-t border-border md:hidden rounded-t-xl">
      <div className="container mx-auto max-w-md px-2">
        <div className="grid h-20" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)`}}>
          {navItems.map((item, index) => {
            const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href) && item.href.length > 1;

            if (item.isMain) {
              return (
                <div key={item.href} className="flex flex-col items-center justify-center -mt-6" style={{ gridColumnStart: mainButtonIndex + 1 }}>
                  <Link href={item.href} className={cn(
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
                  </Link>
                </div>
              );
            }

            const IconComponent = item.icon as React.ElementType; // Cast icon to a valid component type

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
                  
                  <IconComponent className={cn(
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
