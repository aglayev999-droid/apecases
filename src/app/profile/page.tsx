'use client';

import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StarIcon } from '@/components/icons/StarIcon';
import { DiamondIcon } from '@/components/icons/DiamondIcon';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user } = useUser();
  const { toast } = useToast();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };
  
  const copyReferralCode = () => {
    if(!user) return;
    navigator.clipboard.writeText(user.referrals.code);
    toast({
      title: 'Copied!',
      description: 'Referral code copied to clipboard.',
    });
  }

  if (!user) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/2 mx-auto" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="h-24 w-24 border-4 border-primary">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="text-3xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">{user.name}</h1>
          <p className="text-muted-foreground">Telegram ID: {user.telegramId}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Balances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-card-foreground/5">
              <div className="flex items-center gap-3">
                <StarIcon className="h-8 w-8 text-yellow-400" />
                <span className="text-lg font-bold">Stars</span>
              </div>
              <span className="text-xl font-mono font-bold">{formatNumber(user.balance.stars)}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-card-foreground/5">
              <div className="flex items-center gap-3">
                <DiamondIcon className="h-8 w-8 text-cyan-400" />
                <span className="text-lg font-bold">Diamonds</span>
              </div>
              <span className="text-xl font-mono font-bold">{formatNumber(user.balance.diamonds)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Referral Program</CardTitle>
            <CardDescription>Invite friends and earn commissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Friends Referred</span>
              <span className="font-bold text-lg">{user.referrals.count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Commission Earned</span>
              <div className="flex items-center gap-2 font-bold text-lg text-primary">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                {formatNumber(user.referrals.commissionEarned)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input readOnly value={user.referrals.code} className="w-full bg-background border p-2 rounded-md font-mono" />
              <Button size="icon" variant="ghost" onClick={copyReferralCode}>
                <Copy className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
