'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Copy, Moon, Sun } from 'lucide-react';
import { useAlertDialog } from '@/contexts/AlertDialogContext';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const DEFAULT_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { showAlert } = useAlertDialog();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const copyReferralCode = () => {
    if (!user || !user.referrals || !user.referrals.code) return;
    navigator.clipboard.writeText(user.referrals.code);
    showAlert({
      title: 'Copied!',
      description: 'Referral code copied to clipboard.',
    });
  }
  
  const handleThemeChange = (isChecked: boolean) => {
    setTheme(isChecked ? 'dark' : 'light');
  };


  if (isUserLoading || !user) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
            <Skeleton className="h-6 w-64 mx-auto sm:mx-0" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-center gap-6">
        <Avatar className="h-24 w-24 border-4 border-primary">
          <AvatarImage src={user.avatar || DEFAULT_AVATAR} alt={user.name} />
          <AvatarFallback className="text-3xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">{user.name}</h1>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
            <a href="https://t.me/apexcasesbot" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-sm">@apexcasesbot</a>
            <p className="text-muted-foreground text-sm">ID: {user.telegramId}</p>
          </div>
        </div>
      </div>
      
       <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {!mounted ? (
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Skeleton className="h-5 w-5 rounded-full" />
                     <Skeleton className="h-5 w-20" />
                   </div>
                   <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-switch" className="flex items-center gap-2 cursor-pointer">
                    {theme === 'dark' ? <Moon className="h-5 w-5"/> : <Sun className="h-5 w-5" />}
                    <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                  </Label>
                  <Switch
                    id="theme-switch"
                    checked={theme === 'dark'}
                    onCheckedChange={handleThemeChange}
                  />
                </div>
              )}
            </CardContent>
          </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Balances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-card-foreground/5 dark:bg-card-foreground/5">
              <div className="flex items-center gap-3">
                <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={32} height={32} className="h-8 w-8 object-contain" />
                <span className="text-lg font-bold">Stars</span>
              </div>
              <span className="text-xl font-mono font-bold">{formatNumber(user.balance.stars)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Referral Program</CardTitle>
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
                <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={20} height={20} className="h-5 w-5 object-contain" />
                {formatNumber(user.referrals.commissionEarned)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input readOnly value={user.referrals.code} className="w-full bg-background border p-2 rounded-md font-mono text-sm" />
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
