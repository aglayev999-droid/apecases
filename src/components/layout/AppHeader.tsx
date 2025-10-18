'use client';

import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarIcon } from '@/components/icons/StarIcon';
import { DiamondIcon } from '@/components/icons/DiamondIcon';
import { Logo } from '@/components/icons/Logo';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Cases' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/leaderboard', label: 'Ranking' },
];

export default function AppHeader() {
  const { user } = useUser();
  const pathname = usePathname();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl hidden sm:inline-block">Apex</span>
          </Link>
           <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === item.href ? "text-foreground" : "text-foreground/60"
              )}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 border">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-sm">{formatNumber(user.balance.stars)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 border">
                <DiamondIcon className="h-5 w-5 text-cyan-400" />
                <span className="font-semibold text-sm">{formatNumber(user.balance.diamonds)}</span>
              </div>
            </div>

            <Link href="/profile">
              <Avatar className="h-10 w-10 border-2 border-primary hover:border-accent transition-colors">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-24 rounded-full hidden sm:block" />
            <Skeleton className="h-8 w-24 rounded-full hidden sm:block" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        )}
      </div>
    </header>
  );
}
