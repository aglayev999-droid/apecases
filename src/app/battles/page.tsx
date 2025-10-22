
'use client';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/LanguageContext';
import { Swords } from 'lucide-react';
import React from 'react';

export default function BattlesPage() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col h-full text-center">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-primary via-amber-300 to-primary bg-clip-text text-transparent">
                    {t('battlesPage.title')}
                </h1>
            </div>

            <div className="mb-8">
                <Button size="lg" className="h-14 text-lg font-bold bg-gradient-to-r from-primary to-amber-400 hover:from-primary/90 hover:to-amber-400/90 text-black">
                    <Swords className="mr-2 h-6 w-6" />
                    {t('battlesPage.createBattle')}
                </Button>
            </div>

            {/* Placeholder for battle list */}
            <div className="flex-grow flex items-center justify-center bg-card/50 rounded-lg border-2 border-dashed border-muted">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">{t('battlesPage.comingSoonTitle')}</h2>
                    <p className="text-muted-foreground mt-2">
                        {t('battlesPage.comingSoonDescription')}
                    </p>
                </div>
            </div>
        </div>
    );
}

    