'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, Users, Clock } from 'lucide-react';
import Image from 'next/image';

// Mock data for battles - will be replaced with real data
const battles = [
  {
    id: 'battle-1',
    cases: [
      { name: 'FLOOR CASE', image: 'https://i.ibb.co/twnxRfvP/floor.png' },
    ],
    players: [
      { name: 'Ghost', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' },
      { name: 'Viper', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' },
    ],
    totalValue: 360,
    status: 'active',
  },
  {
    id: 'battle-2',
    cases: [
      { name: 'SNOOP DOGG CASE', image: 'https://i.ibb.co/F4V0dGX3/Apex-Case.png' },
      { name: 'LABUBU CASE', image: 'https://i.ibb.co/20Fh8RKz/labubu.png' },
    ],
    players: [
      { name: 'Cipher', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' },
    ],
    totalValue: 420,
    status: 'waiting',
  },
];

export default function BattlesPage() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tighter">Case Battles</h1>
        <Button>
          <Swords className="mr-2 h-4 w-4" /> Create Battle
        </Button>
      </div>

      {/* Battles List */}
      <div className="space-y-4">
        {battles.map((battle) => (
          <Card key={battle.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Cases */}
                <div className="flex -space-x-8">
                  {battle.cases.map((c, index) => (
                    <div key={index} className="relative w-24 h-24 border-2 border-primary/50 rounded-lg bg-card-foreground/5 p-1">
                       <Image src={c.image} alt={c.name} fill sizes="20vw" className="object-contain" />
                    </div>
                  ))}
                </div>

                {/* Battle Info */}
                <div className="flex-grow space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <div className="flex items-center gap-2 font-bold text-lg">
                        <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={20} height={20} className="h-5 w-5 object-contain" />
                        <span>{battle.totalValue.toLocaleString()}</span>
                      </div>
                    </div>
                    {battle.status === 'waiting' ? (
                        <Button variant="secondary" size="sm">Join</Button>
                    ) : (
                        <Button variant="outline" size="sm">View</Button>
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
        ))}
         <div className="text-center py-10 text-muted-foreground">
            <p>No other active battles right now.</p>
        </div>
      </div>
    </div>
  );
}
