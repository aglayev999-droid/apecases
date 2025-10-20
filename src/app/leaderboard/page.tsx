'use client';

import { MOCK_LEADERBOARD } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from '@/contexts/LanguageContext';

const DEFAULT_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

export default function LeaderboardPage() {
  const { user } = useUser();
  const { t } = useTranslation();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };
  
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-muted-foreground';
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter">{t('leaderboardPage.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('leaderboardPage.description')}</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-center">{t('leaderboardPage.rank')}</TableHead>
              <TableHead>{t('leaderboardPage.user')}</TableHead>
              <TableHead className="text-right">{t('leaderboardPage.starsSpent')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_LEADERBOARD.map((entry) => (
              <TableRow key={entry.rank} className={cn(entry.user.name === user?.name && 'bg-primary/10')}>
                <TableCell className="font-bold text-center text-lg">
                  <span className={cn(getRankColor(entry.rank), "flex items-center justify-center gap-1")}>
                    {entry.rank <= 3 && <Trophy className="w-5 h-5" />}
                    {entry.rank}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={entry.user.name === user?.name ? DEFAULT_AVATAR : entry.user.avatar} alt={entry.user.name} />
                      <AvatarFallback>{entry.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{entry.user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 font-semibold">
                    <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={20} height={20} className="h-5 w-5 object-contain" />
                    {formatNumber(entry.spent)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
