'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { HistoryIcon } from '@/components/icons/HistoryIcon';
import { useAlertDialog } from '@/contexts/AlertDialogContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Volume2, VolumeX } from 'lucide-react';
import { RocketIcon } from '@/components/icons/RocketIcon';
import { useRocket } from '@/contexts/RocketContext';
import type { RocketPlayer } from '@/lib/types';


const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return <div className={cn("px-3 py-1 rounded-md text-sm font-bold", className)} {...props} />
}

const History = React.memo(({ gameState, history }: { gameState: string, history: number[] }) => (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
        <HistoryIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        {gameState === 'waiting' && <Badge className="bg-primary/20 text-primary">Ожидание</Badge>}
        {history.map((h, i) => (
            <Badge
                key={i}
                className={cn(
                    "flex-shrink-0",
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
));
History.displayName = 'History';

const GameScreen = React.memo(({ gameState, multiplier, countdown, isMuted, setIsMuted }: { gameState: string, multiplier: number, countdown: number, isMuted: boolean, setIsMuted: (isMuted: boolean) => void }) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0, rotation: 0 });
    const [trailPath, setTrailPath] = useState('');

    useEffect(() => {
        if (!gameContainerRef.current) return;

        const containerWidth = gameContainerRef.current.offsetWidth;
        const containerHeight = gameContainerRef.current.offsetHeight;
        const startX = 40;
        const startY = containerHeight - 60;
        
        const getRocketPosition = () => {
            if (gameState === 'waiting' || gameState === 'crashed') {
                return { x: startX, y: startY, rotation: -25 };
            }

            const progress = Math.min((multiplier - 1) / 10, 1);
            
            const x = startX + (containerWidth - startX - 120) * progress;
            const y = startY - (startY * 0.4) * progress * progress; 
            const rotation = -25 + (25 * progress);
            
            return { x: Math.min(x, containerWidth - 60), y: Math.max(y, 40), rotation: rotation };
        };
        
        const newPos = getRocketPosition();
        setPosition(newPos);
        
        if (gameState === 'playing') {
             setTrailPath(prev => prev + ` L ${newPos.x} ${newPos.y}`);
        }

    }, [multiplier, gameState]);

    useEffect(() => {
        if (gameState === 'playing') {
            if (gameContainerRef.current) {
                const containerHeight = gameContainerRef.current.offsetHeight;
                const startX = 40;
                const startY = containerHeight - 60;
                setTrailPath(`M ${startX} ${startY}`);
            }
        }
    }, [gameState]);

    const rocketStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) rotate(${position.rotation}deg)`,
        transition: 'none',
        willChange: 'transform, left, top',
        width: '120px',
        height: '120px'
    };

    return (
        <div ref={gameContainerRef} className="h-96 flex flex-col items-center justify-center relative w-full overflow-hidden rounded-lg border bg-gray-900">
            {/* Background */}
             <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a122d] to-[#0d1a44] opacity-100">
                 <div id="stars"></div>
                 <div id="stars2"></div>
                 <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0d1a44] via-transparent to-transparent"/>
            </div>
             <style>
                {`
                    @keyframes animStar { from { transform: translateY(0px); } to { transform: translateY(-1000px); } }
                    #stars, #stars2 {
                      position: absolute;
                      top: 0;
                      left: 0;
                      right: 0;
                      bottom: 0;
                      width: 100%;
                      height: 100%;
                      display: block;
                      background: transparent;
                    }
                    #stars {
                      background-image: radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ddd, rgba(0,0,0,0)), radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0));
                      background-repeat: repeat;
                      background-size: 200px 200px;
                      animation: animStar 50s linear infinite;
                    }
                    #stars2 {
                       background-image: radial-gradient(1px 1px at 40px 20px, #eee, rgba(0,0,0,0)), radial-gradient(1px 1px at 80px 60px, #fff, rgba(0,0,0,0));
                       background-repeat: repeat;
                       background-size: 250px 250px;
                       animation: animStar 100s linear infinite;
                    }
                `}
            </style>
            
            {/* Mute Button */}
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-30" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX className="h-6 w-6 text-white" /> : <Volume2 className="h-6 w-6 text-white" />}
            </Button>

            {/* Trail */}
             <svg className="absolute inset-0 z-10 w-full h-full">
                 <path
                    d={trailPath}
                    stroke="rgba(75, 126, 255, 0.5)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                 />
             </svg>

            {/* Rocket & Explosion */}
             <div
                className={cn("z-20")}
                style={rocketStyle}
            >
                <div className="relative w-full h-full">
                     {gameState === 'crashed' && (
                         <Image src="https://i.ibb.co/bX6GfqY/e1e1a556-9e1f-4709-a78b-1a98625906a2-removebg-preview.png" alt="Explosion" layout="fill" objectFit="contain" />
                     )}
                     {gameState === 'playing' && (
                        <Image src="https://i.ibb.co/93bWYZZ/3f7ad183-dda1-4dda-996c-69961a4fabdc-removebg-preview.png" alt="Rocket" layout="fill" objectFit="contain" />
                     )}
                </div>
            </div>

            {/* Multiplier/Status Text */}
            {gameState === 'crashed' ? (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                    <h1 className="text-8xl font-bold text-red-500 animate-in fade-in-0 zoom-in-75">
                        x{multiplier.toFixed(2)}
                    </h1>
                </div>
            ) : gameState === 'waiting' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-30 text-center text-white">
                    <Image src="https://i.ibb.co/XZHF0G6/776f01cf-fb67-4fb6-aaab-beaa022d0f0a-removebg-preview.png" width={80} height={80} alt="1case logo" className="mb-4 h-20 w-20"/>
                    <p className="text-lg uppercase tracking-widest text-muted-foreground">Ожидание следующего раунда</p>
                    <p className="text-8xl font-bold">{countdown}</p>
                 </div>
            ) : (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-30">
                    <h1 className="text-8xl font-bold text-white">
                        x{multiplier.toFixed(2)}
                    </h1>
                </div>
            )}
        </div>
    )
});
GameScreen.displayName = 'GameScreen';

const BetControls = React.memo(({ betAmount, setBetAmount, handlePlaceBet, handleCashOut, playerStatus, gameState, multiplier, user }: { betAmount: string, setBetAmount: (amount: string) => void, handlePlaceBet: () => void, handleCashOut: () => void, playerStatus?: RocketPlayer, gameState: string, multiplier: number, user: any }) => {
    const parsedBetAmount = parseInt(betAmount) || 0;
    const hasPlacedBet = !!playerStatus?.bet && playerStatus.bet > 0;
    
    const canCashOut = gameState === 'playing' && playerStatus?.status === 'playing';

    let buttonText: React.ReactNode = 'Place Bet';
    let buttonAction = handlePlaceBet;
    let buttonClass = 'bg-primary hover:bg-primary/90';
    let isButtonDisabled = false;

    if (canCashOut) {
        buttonText = `Cash out ${Math.floor((playerStatus?.bet || 0) * multiplier).toLocaleString()}`;
        buttonAction = handleCashOut;
        buttonClass = 'bg-green-500 hover:bg-green-600';
        isButtonDisabled = false;
    } else if (hasPlacedBet) {
        if (gameState === 'waiting') {
            buttonText = 'Waiting for round';
            isButtonDisabled = true;
        } else if (playerStatus?.status === 'cashed_out' && playerStatus.cashedOutAt) {
            const winnings = (playerStatus.bet || 0) * playerStatus.cashedOutAt;
            buttonText = `You won ${winnings.toFixed(0)}`;
            buttonClass = 'bg-green-500';
            isButtonDisabled = true;
        } else { // Crashed or waiting for next round after a loss
            buttonText = 'Place Bet for Next Round';
            buttonAction = handlePlaceBet;
            buttonClass = 'bg-primary hover:bg-primary/90';
            isButtonDisabled = gameState !== 'waiting';
        }
    } else { // Hasn't placed a bet
         if (gameState !== 'waiting') {
            buttonText = 'Waiting for next round';
            isButtonDisabled = true;
         } else {
            buttonText = (
                <>
                    Сделать ставку <RocketIcon className="w-5 h-5" />
                </>
            );
            buttonAction = handlePlaceBet;
            isButtonDisabled = !(user && user.balance.stars >= parsedBetAmount && parsedBetAmount > 0);
         }
    }
    
    if(isButtonDisabled) {
         buttonClass += ' disabled:opacity-50 cursor-not-allowed';
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
});
BetControls.displayName = 'BetControls';

const PlayerList = React.memo(({ players, user, gameState, multiplier }: { players: RocketPlayer[], user: any, gameState: string, multiplier: number }) => (
    <div className="w-full max-w-md mt-4 space-y-2 flex-grow min-h-0">
        <h3 className="text-lg font-semibold px-2">{players.length} Players</h3>
         <Card className="h-full">
            <ScrollArea className="h-[200px] md:h-auto md:max-h-[300px]">
                <CardContent className="p-2 space-y-1">
                    {players.map(p => {
                        if (p.bet === 0) return null;
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
                                    {p.status === 'playing' && gameState === 'playing' && (
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
                                     {(p.status === 'waiting' || (p.status !== 'cashed_out' && p.status !== 'lost')) && gameState !== 'playing' && (
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
));
PlayerList.displayName = 'PlayerList';


export default function RocketPage() {
    const { user } = useUser();
    const { 
        gameState, 
        multiplier, 
        history, 
        players, 
        countdown, 
        playerBet, 
        playerCashOut,
        getPlayerStatus 
    } = useRocket();
    const { showAlert } = useAlertDialog();
    const [betAmount, setBetAmount] = useState('25');
    const musicRef = useRef<HTMLAudioElement>(null);
    const crashSfxRef = useRef<HTMLAudioElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        const musicElement = musicRef.current;
        if (musicElement) {
            musicElement.volume = 0.1;
            if (isMuted) {
                musicElement.pause();
            } else {
                musicElement.play().catch(error => {
                    console.log("Audio autoplay prevented:", error);
                });
            }
        }
    }, [isMuted]);

     useEffect(() => {
        if (gameState === 'crashed' && crashSfxRef.current && !isMuted) {
            crashSfxRef.current.volume = 0.2;
            crashSfxRef.current.play().catch(e => console.log("Crash SFX autoplay error", e));
        }
    }, [gameState, isMuted]);
    
    const playerStatus = user ? getPlayerStatus(user.id) : undefined;
    
    const handlePlaceBet = useCallback(() => {
        const parsedBetAmount = parseInt(betAmount) || 0;
        if (!user || user.balance.stars < parsedBetAmount || parsedBetAmount <= 0) {
            showAlert({ title: "Not enough stars", description: "You don't have enough stars to place this bet." });
            return;
        }
        if (gameState === 'waiting') {
            playerBet(user.id, parsedBetAmount, user.avatar, user.name);
            showAlert({ title: "You bet 25 stars" });
        }
    }, [user, betAmount, gameState, playerBet, showAlert]);

    const handleCashOut = useCallback(() => {
        if (!user || gameState !== 'playing' || playerStatus?.status !== 'playing') return;
        playerCashOut(user.id);
    }, [user, gameState, playerStatus, playerCashOut]);


    return (
        <div className="flex flex-col h-full">
            <audio ref={musicRef} src="https://cdn.pixabay.com/audio/2022/08/04/audio_2d9ce45e99.mp3" loop />
            <audio ref={crashSfxRef} src="https://cdn.pixabay.com/audio/2022/03/10/audio_b6238b0b87.mp3" />
            <History gameState={gameState} history={history} />
            <div className="py-4 flex-shrink-0">
                <GameScreen 
                    gameState={gameState}
                    multiplier={multiplier}
                    countdown={countdown}
                    isMuted={isMuted}
                    setIsMuted={setIsMuted}
                />
            </div>
            <div className="w-full flex flex-col items-center flex-grow min-h-0">
                <BetControls 
                    betAmount={betAmount}
                    setBetAmount={setBetAmount}
                    handlePlaceBet={handlePlaceBet}
                    handleCashOut={handleCashOut}
                    playerStatus={playerStatus}
                    gameState={gameState}
                    multiplier={multiplier}
                    user={user}
                />
                <PlayerList 
                    players={players}
                    user={user}
                    gameState={gameState}
                    multiplier={multiplier}
                />
            </div>
        </div>
    );
}
