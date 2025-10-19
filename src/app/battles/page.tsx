'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Swords, Users, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { CaseBattle } from '@/lib/types';
import { MOCK_BATTLES, MOCK_CASES } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useAlertDialog } from '@/contexts/AlertDialogContext';

const BattleCardLoader = () => (
  <Card className="overflow-hidden">
    <CardContent className="p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex -space-x-8">
            <Skeleton className="relative w-24 h-24 border-2 border-primary/50 rounded-lg bg-card-foreground/5 p-1" />
            <Skeleton className="relative w-24 h-24 border-2 border-primary/50 rounded-lg bg-card-foreground/5 p-1" />
        </div>
        <div className="flex-grow space-y-2">
            <div className="flex justify-between items-start">
                <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-8 w-20 rounded-md" />
            </div>
            <Skeleton className="h-5 w-32" />
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function BattlesPage() {
  const firestore = useFirestore();
  const { showAlert } = useAlertDialog();
  
  const battlesCollectionRef = useMemoFirebase(() => 
    firestore ? collection(firestore, 'battles') : null
  , [firestore]);

  const { data: battles, isLoading } = useCollection<CaseBattle>(battlesCollectionRef);

  const handleComingSoon = () => {
    showAlert({
        title: 'Tez Kunda!',
        description: 'Bu funksiya ustida ish olib bormoqdamiz va tez orada taqdim etamiz.',
    });
  }

  const getCaseById = (caseId: string) => {
    return MOCK_CASES.find(c => c.id === caseId);
  }
  
  if (isLoading) {
    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tighter">Case Battles</h1>
                <Button onClick={handleComingSoon}>
                <Swords className="mr-2 h-4 w-4" /> Create Battle
                </Button>
            </div>
            <div className="space-y-4">
                {[...Array(2)].map((_, i) => <BattleCardLoader key={i} />)}
            </div>
        </div>
    )
  }

  const displayBattles = battles && battles.length > 0 ? battles : MOCK_BATTLES;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tighter">Case Battles</h1>
        <Button onClick={handleComingSoon}>
          <Swords className="mr-2 h-4 w-4" /> Create Battle
        </Button>
      </div>

      {/* Battles List */}
      <div className="space-y-4">
        {displayBattles.map((battle) => {
          const totalValue = battle.players.reduce((sum, player) => sum + player.totalValue, 0);
          return (
            <Card key={battle.id} className="overflow-hidden">
                <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Cases */}
                    <div className="flex -space-x-8">
                    {battle.cases.map((caseId, index) => {
                        const caseInfo = getCaseById(caseId);
                        if (!caseInfo) return null;
                        return (
                             <div key={index} className="relative w-24 h-24 border-2 border-primary/50 rounded-lg bg-card-foreground/5 p-1">
                               <Image src={caseInfo.image} alt={caseInfo.name} fill sizes="20vw" className="object-contain" />
                            </div>
                        )
                    })}
                    </div>

                    {/* Battle Info */}
                    <div className="flex-grow space-y-2">
                    <div className="flex justify-between items-start">
                        <div>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <div className="flex items-center gap-2 font-bold text-lg">
                            <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={20} height={20} className="h-5 w-5 object-contain" />
                            <span>{totalValue.toLocaleString()}</span>
                        </div>
                        </div>
                        {battle.status === 'waiting' ? (
                            <Button variant="secondary" size="sm" onClick={handleComingSoon}>Join</Button>
                        ) : (
                            <Button variant="outline" size="sm" onClick={handleComingSoon}>View</Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                        <Users className="h-4 w-4" />
                        <span>{battle.players.length} / 2 Players</span>
                    </div>
                    </div>
                </div>
                </CardContent>
            </Card>
          )
        })}
         {displayBattles.length === 0 && (
            <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-4">
                <ShieldAlert className="w-16 h-16 text-primary/50" />
                <p className="text-lg">No active battles right now.</p>
                 <Button onClick={handleComingSoon}>
                    <Swords className="mr-2 h-4 w-4" /> Create the First Battle!
                </Button>
            </div>
         )}
      </div>
    </div>
  );
}
