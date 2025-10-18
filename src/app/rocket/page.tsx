'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { HistoryIcon } from '@/components/icons/HistoryIcon';
import { useToast } from '@/hooks/use-toast';
import type { RocketPlayer } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const MOCK_PLAYER_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

export default function RocketPage() {
    const { 
        user, 
        gameState, 
        multiplier, 
        history, 
        players, 
        countdown, 
        playerBet, 
        playerCashOut,
        getPlayerStatus 
    } = useUser();
    const { toast } = useToast();
    const [betAmount, setBetAmount] = useState('25');

    const parsedBetAmount = parseInt(betAmount) || 0;
    const playerStatus = user ? getPlayerStatus(user.id) : undefined;
    const hasPlacedBet = playerStatus?.status && playerStatus.status !== 'waiting';

    const handlePlaceBet = () => {
        if (!user || user.balance.stars < parsedBetAmount || parsedBetAmount <= 0) {
            toast({ variant: 'destructive', title: "Not enough stars", description: "You don't have enough stars to place this bet." });
            return;
        }
        if (gameState === 'waiting') {
            playerBet(user.id, parsedBetAmount, user.avatar, user.name);
            toast({ title: "Bet placed!", description: `You bet ${parsedBetAmount} stars.` });
        }
    };

    const handleCashOut = () => {
        if (!user || gameState !== 'playing' || playerStatus?.status !== 'playing') return;
        
        playerCashOut(user.id);
        const winnings = (playerStatus.bet || 0) * multiplier;

        toast({
            title: "Cashed out!",
            description: `You won ${winnings.toFixed(0)} stars at ${multiplier.toFixed(2)}x.`
        });
    };

    const GameScreen = () => {
        const rocketPosition = Math.min(multiplier / 10, 1) * 20;

        return (
            <div className="h-64 flex flex-col items-center justify-center relative w-full overflow-hidden">
                <div 
                    className={cn(
                        "absolute transition-all duration-100 ease-linear",
                         gameState === 'playing' ? 'opacity-100' : 'opacity-80',
                         gameState === 'crashed' && 'opacity-0 scale-150',
                         'transform-gpu'
                    )}
                     style={{ bottom: `${rocketPosition}%`, transform: `translateX(-50%)` , left: '50%'}}
                >
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                         <Image src="https://i.ibb.co/93bWYZZf/3f7ad183-dda1-4dda-996c-69961a4fabdc-removebg-preview.png" alt="Rocket" width={128} height={128} />
                    </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    {gameState === 'crashed' ? (
                        <h1 className="text-7xl font-bold text-red-500 animate-in fade-in-0 zoom-in-75">
                           x{multiplier.toFixed(2)}
                        </h1>
                    ) : (
                         <h1 className="text-7xl font-bold text-white">
                           x{multiplier.toFixed(2)}
                        </h1>
                    )}
                </div>
                 {gameState === 'waiting' && (
                     <div className="absolute top-10 text-center">
                        <p className="text-lg text-muted-foreground">Starting in...</p>
                        <p className="text-4xl font-bold">{countdown}</p>
                     </div>
                 )}
            </div>
        )
    };

    const BetControls = () => {
        const canPlaceBet = gameState === 'waiting' && !hasPlacedBet && user && user.balance.stars >= parsedBetAmount && parsedBetAmount > 0;
        const canCashOut = gameState === 'playing' && playerStatus?.status === 'playing';

        let buttonText = 'Waiting for round';
        let buttonAction = () => {};
        let buttonClass = 'bg-gray-500';
        let isButtonDisabled = true;

        if (canCashOut) {
            buttonText = `Cash out ${Math.floor((playerStatus?.bet || 0) * multiplier).toLocaleString()}`;
            buttonAction = handleCashOut;
            buttonClass = 'bg-green-500 hover:bg-green-600';
            isButtonDisabled = false;
        } else if (canPlaceBet) {
            buttonText = `Place Bet`;
            buttonAction = handlePlaceBet;
            buttonClass = 'bg-primary hover:bg-primary/90';
            isButtonDisabled = false;
        } else if (playerStatus?.status === 'cashed_out' && playerStatus.cashedOutAt) {
            const winnings = (playerStatus.bet || 0) * playerStatus.cashedOutAt;
            buttonText = `You won ${winnings.toFixed(0)}`;
            buttonClass = 'bg-green-500';
            isButtonDisabled = true;
        } else if (playerStatus?.status === 'lost') {
            buttonText = 'Crashed';
            buttonClass = 'bg-red-500';
            isButtonDisabled = true;
        } else if (hasPlacedBet && gameState === 'waiting') {
            buttonText = 'Waiting for next round';
            buttonClass = 'bg-gray-500';
            isButtonDisabled = true;
        } else if(hasPlacedBet && gameState === 'crashed') {
            buttonText = 'Crashed';
            buttonClass = 'bg-red-500';
            isButtonDisabled = true;
        }

        return (
            <Card className="w-full max-w-md p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={24} height={24} className="h-6 w-6 object-contain" />
                    <Input 
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        disabled={hasPlacedBet || gameState !== 'waiting'}
                        className="text-lg font-bold"
                    />
                </div>
                 <Button 
                    onClick={buttonAction}
                    disabled={isButtonDisabled}
                    className={cn( "w-full h-14 text-xl", buttonClass )}
                >
                    {buttonText}
                </Button>
            </Card>
        )
    }

    const History = () => (
        <div className="flex items-center gap-2 overflow-x-auto py-2">
            <HistoryIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            {history.map((h, i) => (
                <Badge
                    key={i}
                    className={cn(
                        h >= 10 ? "bg-orange-500/20 text-orange-400" :
                        h >= 3 ? "bg-purple-500/20 text-purple-400" :
                        h >= 2 ? "bg-blue-500/20 text-blue-400" :
                        "bg-muted text-muted-foreground"
                    )}
                >
                    {h.toFixed(2)}x
                </Badge>
            ))}
        </div>
    );
    
    const PlayerList = () => (
        <div className="w-full max-w-md mt-4 space-y-2 flex-grow min-h-0">
            <h3 className="text-lg font-semibold px-2">{players.length} Players</h3>
             <Card className="h-full">
                <ScrollArea className="h-[200px] md:h-full">
                    <CardContent className="p-2 space-y-1">
                        {players.map(p => {
                            const isCurrentUser = user?.id === p.id;
                             return (
                             <div key={p.id} className={cn("flex items-center justify-between p-2 rounded-lg",
                                p.status === 'cashed_out' ? 'bg-green-500/20' :
                                p.status === 'lost' ? 'bg-red-500/20' :
                                isCurrentUser ? 'bg-primary/10' : ''
                             )}>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={p.avatar} />
                                        <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold text-sm">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={16} height={16} className="h-4 w-4 object-contain" />
                                        <span>{p.bet.toLocaleString()}</span>
                                    </div>
                                    <div className="w-32 text-right">
                                        {p.status === 'playing' && gameState === 'playing' && isCurrentUser &&(
                                            <span className="font-bold text-gray-400">{Math.floor(p.bet * multiplier).toLocaleString()}</span>
                                        )}
                                        {p.status === 'cashed_out' && p.cashedOutAt && (
                                             <div className="flex items-center justify-end gap-1 font-bold text-green-400">
                                                <span>+{(p.bet * p.cashedOutAt).toFixed(0)}</span>
                                                <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={16} height={16} className="h-4 w-4 object-contain" />
                                            </div>
                                        )}
                                        {p.status === 'lost' && (
                                            <span className="font-bold text-red-500">Crashed</span>
                                        )}
                                         {(p.status === 'playing' || p.status === 'waiting') && gameState !== 'playing' && (
                                            <span className="font-bold text-gray-500">-</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )})}
                    </CardContent>
                </ScrollArea>
            </Card>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <History />
            <GameScreen />
            <div className="mt-4 w-full flex flex-col items-center flex-grow min-h-0">
                <BetControls />
                <PlayerList />
            </div>
        </div>
    );
}

const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return <div className={cn("px-3 py-1 rounded-md text-sm font-bold flex-shrink-0", className)} {...props} />
}
