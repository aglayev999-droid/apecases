'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { RocketIcon } from '@/components/icons/RocketIcon';
import { CoinsIcon } from '@/components/icons/CoinsIcon';
import { HistoryIcon } from '@/components/icons/HistoryIcon';
import { useToast } from '@/hooks/use-toast';

const MOCK_PLAYER_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

type GameState = 'waiting' | 'playing' | 'crashed';
type PlayerStatus = 'waiting' | 'playing' | 'cashed_out' | 'lost';

const generateCrashPoint = () => {
    const r = Math.random();
    if (r < 0.5) return 1 + Math.random(); 
    if (r < 0.8) return 2 + Math.random() * 2;
    if (r < 0.95) return 4 + Math.random() * 6;
    return 10 + Math.random() * 20;
};

const mockPlayers = [
    { id: 'p2', name: 'Hector_1312', avatar: MOCK_PLAYER_AVATAR },
    { id: 'p3', name: 'e_r_a_7_7_7', avatar: MOCK_PLAYER_AVATAR },
    { id: 'p4', name: 'okoneews', avatar: MOCK_PLAYER_AVATAR },
    { id: 'p5', name: 'Player5', avatar: MOCK_PLAYER_AVATAR },
    { id: 'p6', name: 'Player6', avatar: MOCK_PLAYER_AVATAR },
];


export default function RocketPage() {
    const { user, updateBalance } = useUser();
    const { toast } = useToast();
    const [gameState, setGameState] = useState<GameState>('waiting');
    const [multiplier, setMultiplier] = useState(1.00);
    const [crashPoint, setCrashPoint] = useState(1.00);
    const [betAmount, setBetAmount] = useState('25');
    const [countdown, setCountdown] = useState(10);
    const [history, setHistory] = useState<number[]>([]);
    
    const [players, setPlayers] = useState<any[]>([]);
    
    const [playerStatus, setPlayerStatus] = useState<PlayerStatus>('waiting');
    const [cashedOutMultiplier, setCashedOutMultiplier] = useState<number | null>(null);

    const parsedBetAmount = parseInt(betAmount) || 0;
    const hasPlacedBet = playerStatus !== 'waiting';

    const resetGame = useCallback(() => {
        setGameState('waiting');
        setMultiplier(1.00);
        setCrashPoint(generateCrashPoint());
        setCountdown(10);
        setPlayerStatus('waiting');
        setCashedOutMultiplier(null);
        
        const numPlayers = 2 + Math.floor(Math.random() * (mockPlayers.length - 2));
        const shuffled = mockPlayers.sort(() => 0.5 - Math.random());
        setPlayers(shuffled.slice(0, numPlayers).map(p => ({
            ...p,
            bet: Math.floor(10 + Math.random() * 100),
            cashedOutAt: null,
        })));
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (gameState === 'waiting') {
            if (countdown > 0) {
                timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
            } else {
                setGameState('playing');
            }
        } else if (gameState === 'playing') {
            timer = setTimeout(() => {
                const newMultiplier = multiplier + (0.01 + multiplier * 0.01);
                if (newMultiplier >= crashPoint) {
                    setGameState('crashed');
                    setMultiplier(crashPoint);
                    if (playerStatus === 'playing') {
                        setPlayerStatus('lost');
                    }
                    setHistory(prev => [crashPoint, ...prev.slice(0, 9)]);
                    setTimeout(resetGame, 3000);
                } else {
                    setMultiplier(newMultiplier);
                }
            }, 60);
        }

        return () => clearTimeout(timer);
    }, [gameState, countdown, multiplier, crashPoint, resetGame, playerStatus]);

    const handlePlaceBet = () => {
        if (!user || user.balance.stars < parsedBetAmount || parsedBetAmount <= 0) {
            toast({ variant: 'destructive', title: "Not enough stars", description: "You don't have enough stars to place this bet." });
            return;
        }
        updateBalance(-parsedBetAmount, 0);
        setPlayerStatus('playing');
        toast({ title: "Bet placed!", description: `You bet ${parsedBetAmount} stars.` });
    };

    const handleCashOut = async () => {
        if (gameState !== 'playing' || playerStatus !== 'playing') return;
    
        const winnings = parsedBetAmount * multiplier;
        updateBalance(winnings, 0);
    
        // Use Promise.all to ensure state updates are batched if possible,
        // but more importantly, it makes the logic clearer.
        await Promise.all([
            Promise.resolve(setPlayerStatus('cashed_out')),
            Promise.resolve(setCashedOutMultiplier(multiplier))
        ]);
    
        toast({
            title: "Cashed out!",
            description: `You won ${winnings.toFixed(0)} stars at ${multiplier.toFixed(2)}x.`
        });
    };

    const GameScreen = () => {
        const rocketPosition = Math.min((multiplier - 1) / (crashPoint > 1 ? crashPoint - 1 : 1), 1) * 70;

        return (
            <div className="flex-grow flex flex-col items-center justify-center relative w-full overflow-hidden">
                <div 
                    className={cn(
                        "absolute transition-all duration-3000 ease-in-out",
                         gameState === 'playing' ? `bottom-[${rocketPosition}%]` : 'bottom-0',
                         gameState === 'crashed' && 'opacity-0'
                    )}
                     style={{ bottom: gameState === 'playing' ? `${rocketPosition}%` : '0' }}
                >
                    <div className="relative w-48 h-48">
                         <Image src="https://i.ibb.co/3zdVvSg/rocket.png" alt="Rocket" width={192} height={192} />
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
        const canBet = gameState === 'waiting' && playerStatus === 'waiting' && user && user.balance.stars >= parsedBetAmount && parsedBetAmount > 0;
        const canCashOut = gameState === 'playing' && playerStatus === 'playing';

        const handleButtonClick = () => {
            if (canBet) {
                handlePlaceBet();
            } else if (canCashOut) {
                handleCashOut();
            }
        };
        
        let buttonText = 'Place Bet';
        let buttonClass = 'bg-primary hover:bg-primary/90';
        let isButtonDisabled = true;

        if (gameState === 'waiting') {
            if (playerStatus === 'waiting') {
                buttonText = 'Place Bet';
                isButtonDisabled = !canBet;
            } else {
                buttonText = 'Waiting for round';
                isButtonDisabled = true;
            }
        } else if (gameState === 'playing') {
            if (playerStatus === 'playing') {
                buttonText = `Cash out ${Math.floor(parsedBetAmount * multiplier).toLocaleString()}`;
                buttonClass = 'bg-green-500 hover:bg-green-600';
                isButtonDisabled = false;
            } else if (playerStatus === 'cashed_out' && cashedOutMultiplier) {
                const winnings = parsedBetAmount * cashedOutMultiplier;
                buttonText = `You won ${winnings.toFixed(0)}`;
                buttonClass = 'bg-green-500';
                isButtonDisabled = true;
            }
        } else if (gameState === 'crashed') {
            if (playerStatus === 'lost') {
                buttonText = 'Crashed';
                buttonClass = 'bg-red-500';
            } else if (playerStatus === 'cashed_out' && cashedOutMultiplier) {
                const winnings = parsedBetAmount * cashedOutMultiplier;
                buttonText = `You won ${winnings.toFixed(0)}`;
                buttonClass = 'bg-green-500';
            } else {
                 buttonText = 'Round Over';
            }
            isButtonDisabled = true;
        }


        return (
            <Card className="w-full max-w-md p-4">
                <div className="flex items-center gap-2 mb-4">
                    <CoinsIcon className="w-5 h-5 text-primary" />
                    <Input 
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        disabled={hasPlacedBet || gameState !== 'waiting'}
                        className="text-lg font-bold"
                    />
                </div>
                 <Button 
                    onClick={handleButtonClick}
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
        <div className="w-full max-w-md mt-4 space-y-2">
            <h3 className="text-lg font-semibold px-2">{players.length + (hasPlacedBet ? 1 : 0)} Players</h3>
             <Card className="max-h-64 overflow-y-auto">
                <CardContent className="p-2 space-y-1">
                    {hasPlacedBet && user && (
                         <div className={cn("flex items-center justify-between p-2 rounded-lg",
                            playerStatus === 'cashed_out' ? 'bg-green-500/20' :
                            playerStatus === 'lost' ? 'bg-red-500/20' :
                            'bg-primary/10'
                         )}>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={MOCK_PLAYER_AVATAR} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold">{user.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={16} height={16} className="h-4 w-4 object-contain" />
                                    <span>{parsedBetAmount.toLocaleString()}</span>
                                </div>
                                <div className="w-32 text-right">
                                    {playerStatus === 'playing' && gameState === 'playing' && (
                                        <span className="font-bold text-gray-400">{Math.floor(parsedBetAmount * multiplier).toLocaleString()}</span>
                                    )}
                                    {playerStatus === 'cashed_out' && cashedOutMultiplier && (
                                         <div className="flex items-center justify-end gap-1 font-bold text-green-400">
                                            <span>+{(parsedBetAmount * cashedOutMultiplier).toFixed(0)}</span>
                                            <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={16} height={16} className="h-4 w-4 object-contain" />
                                        </div>
                                    )}
                                    {playerStatus === 'lost' && (
                                        <span className="font-bold text-red-500">Crashed</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {players.map(p => (
                         <div key={p.id} className="flex items-center justify-between p-2 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={p.avatar} />
                                    <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm text-muted-foreground">{p.name}</span>
                            </div>
                             <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                     <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={16} height={16} className="h-4 w-4 object-contain" />
                                    <span>{p.bet.toLocaleString()}</span>
                                </div>
                                <span className="font-bold text-gray-500 w-32 text-right">
                                    {p.cashedOutAt ? `${p.cashedOutAt.toFixed(2)}x` : '-'}
                                </span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-14rem)] md:h-[calc(100vh-8rem)]">
            <History />
            <GameScreen />
            <div className="mt-auto w-full flex flex-col items-center">
                <BetControls />
                <PlayerList />
            </div>
        </div>
    );
}

const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return <div className={cn("px-3 py-1 rounded-md text-sm font-bold flex-shrink-0", className)} {...props} />
}

    