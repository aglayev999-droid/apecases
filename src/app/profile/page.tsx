'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Copy, Moon, Sun, Settings, Check } from 'lucide-react';
import { useAlertDialog } from '@/contexts/AlertDialogContext';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

const DEFAULT_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

const LanguageSelector = () => {
    const { language, setLanguage, t } = useTranslation();
    
    return (
        <div className="space-y-2">
            <h3 className="font-semibold text-foreground">{t('profilePage.languageTitle')}</h3>
            <RadioGroup defaultValue={language} onValueChange={(value) => setLanguage(value as 'en' | 'ru' | 'uz')}>
                <Label className="flex items-center justify-between p-4 rounded-lg bg-card cursor-pointer hover:bg-muted">
                    <span>{t('profilePage.lang_uz')}</span>
                    <RadioGroupItem value="uz" id="lang-uz" />
                </Label>
                <Label className="flex items-center justify-between p-4 rounded-lg bg-card cursor-pointer hover:bg-muted">
                    <span>{t('profilePage.lang_ru')}</span>
                    <RadioGroupItem value="ru" id="lang-ru" />
                </Label>
                <Label className="flex items-center justify-between p-4 rounded-lg bg-card cursor-pointer hover:bg-muted">
                    <span>{t('profilePage.lang_en')}</span>
                    <RadioGroupItem value="en" id="lang-en" />
                </Label>
            </RadioGroup>
        </div>
    )
}

const ThemeSelector = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setMounted(true);
    }, []);
    
    if (!mounted) {
        return <Skeleton className="h-28 w-full" />
    }

    return (
         <div className="space-y-2">
            <h3 className="font-semibold text-foreground">{t('profilePage.themeTitle')}</h3>
            <div 
              className={cn(
                "flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-muted",
                theme === 'light' ? 'bg-card' : 'bg-transparent'
              )}
              onClick={() => setTheme('light')}
            >
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5" />
                <span>{t('profilePage.lightTheme')}</span>
              </div>
              {theme === 'light' && <Check className="h-5 w-5 text-primary" />}
            </div>
            <div 
              className={cn(
                "flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-muted",
                theme === 'dark' ? 'bg-card' : 'bg-transparent'
              )}
              onClick={() => setTheme('dark')}
            >
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5" />
                <span>{t('profilePage.darkTheme')}</span>
              </div>
              {theme === 'dark' && <Check className="h-5 w-5 text-primary" />}
            </div>
        </div>
    )
}


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { showAlert } = useAlertDialog();
  const { t } = useTranslation();

  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const copyReferralCode = () => {
    if (!user || !user.referrals || !user.referrals.code) return;
    navigator.clipboard.writeText(user.referrals.code);
    showAlert({
      title: t('profilePage.copySuccessTitle'),
      description: t('profilePage.copySuccessDescription'),
    });
  }

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
        <Sheet>
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                        <AvatarImage src={user.avatar || DEFAULT_AVATAR} alt={user.name} />
                        <AvatarFallback className="text-3xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex-grow">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">{user.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-muted-foreground text-sm">{t('profilePage.id')}: {user.telegramId}</p>
                    </div>
                </div>
                 <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <Settings className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
            </div>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{t('profilePage.settingsTitle')}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                    <ThemeSelector />
                    <LanguageSelector />
                </div>
            </SheetContent>
        </Sheet>
      
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t('profilePage.balancesTitle')}</CardTitle>
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
            <CardTitle className="text-xl">{t('profilePage.referralProgramTitle')}</CardTitle>
            <CardDescription>{t('profilePage.referralProgramDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('profilePage.friendsReferred')}</span>
              <span className="font-bold text-lg">{user.referrals.count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('profilePage.commissionEarned')}</span>
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
