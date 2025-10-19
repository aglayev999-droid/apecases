'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Star, Users } from 'lucide-react';
import { CoinsIcon } from '@/components/icons/CoinsIcon';

const giveaways = [
    {
        id: 1,
        isPremium: true,
        title: '50 Gifts',
        participants: 338,
        channels: 1,
        timeleft: '6d 10h',
        images: [
            'https://placehold.co/100x100/A9A388/FFFFFF?text=Item1',
            'https://placehold.co/100x100/F5C396/FFFFFF?text=Item2',
            'https://placehold.co/100x100/C4E3D8/FFFFFF?text=Item3'
        ],
        imageHints: ['blue candle', 'orange candle', 'snow globe']
    },
    {
        id: 2,
        isPremium: true,
        isVolume: true,
        title: '50 Gifts',
        participants: 2400,
        channels: 2,
        timeleft: '11h 3m',
        images: [
            'https://placehold.co/100x100/F5D76E/FFFFFF?text=ItemA',
            'https://placehold.co/100x100/E8E8E8/FFFFFF?text=ItemB',
            'https://placehold.co/100x100/E08283/FFFFFF?text=ItemC'
        ],
        imageHints: ['gold hand', 'silver ring', 'red egg']
    }
];

export default function GiveawaysPage() {
    const formatParticipants = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num;
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Giveaways</h1>
                <div className="flex items-center gap-4 text-muted-foreground font-semibold">
                    <button className="hover:text-foreground">Create</button>
                    <button className="hover:text-foreground">History</button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="explore" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-card border">
                    <TabsTrigger value="explore">Explore</TabsTrigger>
                    <TabsTrigger value="joined">Joined</TabsTrigger>
                </TabsList>
                <TabsContent value="explore">
                    <div className="space-y-4 mt-6">
                        {giveaways.map((giveaway) => (
                            <Card key={giveaway.id} className="p-4 rounded-xl border-2">
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {giveaway.images.map((src, index) => (
                                         <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                                            <Image 
                                                src={src} 
                                                alt={`Giveaway item ${index + 1}`} 
                                                fill
                                                sizes="30vw"
                                                className="object-cover"
                                                data-ai-hint={giveaway.imageHints[index]}
                                            />
                                         </div>
                                    ))}
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                        {giveaway.isPremium && <span className="flex items-center gap-1 text-purple-400"><Star className="w-4 h-4 fill-purple-400" /> PREMIUM</span>}
                                        {giveaway.isVolume && <span className="flex items-center gap-1 text-green-400"><CoinsIcon className="w-4 h-4" /> VOLUME</span>}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold">{giveaway.title}</h2>
                                        <div className="flex items-center gap-2 text-sm bg-muted text-muted-foreground font-semibold px-3 py-1 rounded-md">
                                            <Clock className="w-4 h-4" />
                                            <span>{giveaway.timeleft}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="w-4 h-4" />
                                        <span>{formatParticipants(giveaway.participants)} participants</span>
                                        <span>&middot;</span>
                                        <span>{giveaway.channels} channel{giveaway.channels > 1 && 's'}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="joined">
                    <div className="text-center py-16 text-muted-foreground">
                        <p>You haven&apos;t joined any giveaways yet.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
