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
import type { RocketPlayer } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';


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
    const { showAlert } = useAlertDialog();
    const [betAmount, setBetAmount] = useState('25');
    const musicRef = useRef<HTMLAudioElement>(null);
    const crashSfxRef = useRef<HTMLAudioElement>(null);
    
    useEffect(() => {
        if (musicRef.current) {
            musicRef.current.volume = 0.1;
            // Try to play, but catch error if browser blocks it.
            // User interaction is usually required to play audio.
            musicRef.current.play().catch(error => {
                console.log("Audio autoplay prevented by browser:", error);
            });
        }
        return () => {
            if (musicRef.current) {
                musicRef.current.pause();
            }
        }
    }, []);

     useEffect(() => {
        if (gameState === 'crashed' && crashSfxRef.current) {
            crashSfxRef.current.volume = 0.2;
            crashSfxRef.current.play().catch(e => console.log("Crash SFX autoplay error", e));
        }
    }, [gameState]);
    
    const playerStatus = user ? getPlayerStatus(user.id) : undefined;
    const hasPlacedBet = !!playerStatus?.bet && playerStatus.bet > 0;

    const handlePlaceBet = () => {
        const parsedBetAmount = parseInt(betAmount) || 0;
        if (!user || user.balance.stars < parsedBetAmount || parsedBetAmount <= 0) {
            showAlert({ title: "Not enough stars", description: "You don't have enough stars to place this bet." });
            return;
        }
        if (gameState === 'waiting') {
            playerBet(user.id, parsedBetAmount, user.avatar, user.name);
            showAlert({ title: "Bet placed!", description: `You bet ${parsedBetAmount} stars.` });
        }
    };

    const handleCashOut = () => {
        if (!user || gameState !== 'playing' || playerStatus?.status !== 'playing') return;
        playerCashOut(user.id);
    };

    const GameScreen = () => {
        const VERTICAL_THRESHOLD = 3;
        const gameContainerRef = useRef<HTMLDivElement>(null);
        const [position, setPosition] = useState({ x: 20, y: 200, rotation: -45 });
        const [trailPath, setTrailPath] = useState("");

        useEffect(() => {
            if (!gameContainerRef.current) return;

            const containerWidth = gameContainerRef.current.offsetWidth;
            const containerHeight = gameContainerRef.current.offsetHeight;
            const startX = 20;
            const startY = containerHeight - 50;

            const getRocketPosition = () => {
                if (gameState === 'waiting' || gameState === 'crashed' || multiplier < 1.01) {
                    return { x: startX, y: startY, rotation: -45 };
                }

                const progress = multiplier - 1;
                const centerTargetX = containerWidth / 2;
                const centerTargetY = containerHeight / 2;
                
                let x, y, rotation;

                if (multiplier < VERTICAL_THRESHOLD) {
                    const pathProgress = progress / (VERTICAL_THRESHOLD - 1);
                    x = startX + (centerTargetX - startX) * pathProgress;
                    y = startY - (startY - centerTargetY) * pathProgress;
                    rotation = -45;
                } else {
                    const postThresholdProgress = multiplier - VERTICAL_THRESHOLD;
                    x = centerTargetX;
                    y = centerTargetY - (postThresholdProgress * 25);
                    rotation = 0;
                }
                return { x, y, rotation };
            };

            const getTrailPath = (newPos: { x: number, y: number }) => {
                if (multiplier < 1.02) return `M ${startX} ${startY}`;

                let path = `M ${startX} ${startY}`;
                const centerTargetX = containerWidth / 2;
                const centerTargetY = containerHeight / 2;

                if (multiplier < VERTICAL_THRESHOLD) {
                    path += ` L ${newPos.x} ${newPos.y}`;
                } else {
                    path += ` L ${centerTargetX} ${centerTargetY}`;
                    path += ` L ${newPos.x} ${newPos.y}`;
                }
                return path;
            };

            const newPos = getRocketPosition();
            setPosition(newPos);
            setTrailPath(getTrailPath(newPos));

        }, [multiplier, gameState]);

        const rocketStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: `translate(-50%, -50%) rotate(${position.rotation}deg)`,
            transition: 'all 0.1s linear',
            willChange: 'transform, left, top',
            opacity: gameState === 'crashed' ? 0 : 1,
        };
    
        return (
            <div ref={gameContainerRef} className="h-64 flex flex-col items-center justify-center relative w-full overflow-hidden rounded-lg border bg-card/20">
                {/* Background Animation */}
                 <div className="absolute inset-0 z-0">
                    <div className="star-field">
                        <div className="star-sm"></div>
                        <div className="star-md"></div>
                        <div className="star-lg"></div>
                        <div className="planet-1"></div>
                        <div className="planet-2"></div>
                        <div className="planet-3"></div>
                    </div>
                </div>
                 <style>
                    {`
                        @keyframes stars-sm-anim { from { transform: translateY(0px); } to { transform: translateY(-200px); } }
                        @keyframes stars-md-anim { from { transform: translateY(0px); } to { transform: translateY(-300px); } }
                        @keyframes stars-lg-anim { from { transform: translateY(0px); } to { transform: translateY(-400px); } }
                        
                        .star-field { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; }
                        .star-sm { position: absolute; width: 2px; height: 2px; background: white; border-radius: 50%; box-shadow: 100px 50px white, 200px 150px white, 300px 80px white, 400px 20px white, 50px 180px white; animation: stars-sm-anim 100s linear infinite; }
                        .star-md { position: absolute; width: 3px; height: 3px; background: white; border-radius: 50%; box-shadow: 150px 100px white, 250px 30px white, 350px 120px white, 450px 90px white, 80px 10px white; animation: stars-md-anim 80s linear infinite; }
                        .star-lg { position: absolute; width: 4px; height: 4px; background: white; border-radius: 50%; box-shadow: 120px 70px white, 220px 160px white, 320px 50px white, 420px 130px white, 20px 150px white; animation: stars-lg-anim 60s linear infinite; }
                        
                        .planet-1, .planet-2, .planet-3 { position: absolute; border-radius: 50%; background: linear-gradient(135deg, hsl(var(--primary) / 0.5), hsl(var(--accent) / 0.5)); animation: move-planet 20s linear infinite; }
                        .planet-1 { width: 80px; height: 80px; left: 10%; top: 20%; animation-duration: 25s; }
                        .planet-2 { width: 50px; height: 50px; left: 70%; top: 60%; animation-duration: 35s; animation-delay: -10s; background: linear-gradient(135deg, hsl(var(--chart-2) / 0.5), hsl(var(--chart-4) / 0.5)); }
                        .planet-3 { width: 20px; height: 20px; left: 40%; top: 80%; animation-duration: 45s; animation-delay: -20s; }

                        @keyframes move-planet { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(20px, -30px) scale(1.1); } 100% { transform: translate(0, 0) scale(1); } }
                        
                        @keyframes shake {
                            0% { transform: translate(-50%, -50%) rotate(${position.rotation}deg) scale(1); }
                            25% { transform: translate(-50%, -50%) rotate(${position.rotation - 0.5}deg) scale(1.02); }
                            50% { transform: translate(-50%, -50%) rotate(${position.rotation}deg) scale(1); }
                            75% { transform: translate(-50%, -50%) rotate(${position.rotation + 0.5}deg) scale(0.98); }
                            100% { transform: translate(-50%, -50%) rotate(${position.rotation}deg) scale(1); }
                        }
                        .rocket-shake {
                            animation: shake 0.3s linear infinite;
                        }

                        @keyframes trail-draw { to { stroke-dashoffset: 0; } }
                        .rocket-trail {
                            stroke-dasharray: 1000;
                            stroke-dashoffset: 1000;
                            animation: trail-draw 1s linear forwards;
                        }
                    `}
                </style>
                
                {/* Rocket Trail */}
                <svg className="absolute inset-0 w-full h-full z-10">
                    <path
                        className="rocket-trail"
                        d={trailPath}
                        stroke="hsl(var(--primary))"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                {/* Rocket Image */}
                <div 
                    className={cn("z-20", { 'rocket-shake': gameState === 'playing' })}
                     style={rocketStyle}
                >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                         <Image src="https://i.ibb.co/93bWYZZf/3f7ad183-dda1-4dda-996c-69961a4fabdc-removebg-preview.png" alt="Rocket" layout="fill" objectFit="contain" />
                    </div>
                </div>

                {/* Multiplier Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-30">
                    {gameState === 'crashed' ? (
                        <h1 className="text-7xl font-bold text-red-500 animate-in fade-in-0 zoom-in-75">
                           x{multiplier.toFixed(2)}
                        </h1>
                    ) : (
                         <h1 className="text-7xl font-bold text-white [text-shadow:0_0_15px_hsl(var(--primary))]">
                           x{multiplier.toFixed(2)}
                         </h1>
                    )}
                </div>

                {/* Countdown Timer */}
                 {gameState === 'waiting' && (
                     <div className="absolute top-10 text-center z-30">
                        <p className="text-lg text-muted-foreground">Starting in...</p>
                        <p className="text-4xl font-bold">{countdown}</p>
                     </div>
                 )}
            </div>
        )
    };

    const BetControls = () => {
        const parsedBetAmount = parseInt(betAmount) || 0;
        
        const canCashOut = gameState === 'playing' && playerStatus?.status === 'playing';

        let buttonText = 'Place Bet';
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
                buttonText = 'Place Bet';
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
    }

    const History = () => (
        <div className="flex items-center gap-2 overflow-x-auto py-2">
            <HistoryIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
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
    );
    
    const PlayerList = () => (
        <div className="w-full max-w-md mt-4 space-y-2 flex-grow min-h-0">
            <h3 className="text-lg font-semibold px-2">{players.length} Players</h3>
             <Card className="h-full">
                <ScrollArea className="h-[200px] md:h-auto md:max-h-[300px]">
                    <CardContent className="p-2 space-y-1">
                        {players.map(p => {
                            if (p.bet === 0) return null; // Don't show players who haven't bet
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
    );

    return (
        <div className="flex flex-col h-full">
            <audio ref={musicRef} src="https://cdn.pixabay.com/audio/2022/08/04/audio_2d9ce45e99.mp3" loop />
            <audio ref={crashSfxRef} src="https://cdn.pixabay.com/audio/2022/03/10/audio_b6238b0b87.mp3" />
            <History />
            <div className="py-4 flex-shrink-0">
                <GameScreen />
            </div>
            <div className="w-full flex flex-col items-center flex-grow min-h-0">
                <BetControls />
                <PlayerList />
            </div>
        </div>
    );
}

const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return <div className={cn("px-3 py-1 rounded-md text-sm font-bold", className)} {...props} />
}
