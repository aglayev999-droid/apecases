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
import { Volume2, VolumeX } from 'lucide-react';


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
        const gameContainerRef = useRef<HTMLDivElement>(null);
        const [position, setPosition] = useState({ x: 0, y: 0, rotation: 0 });
        const [trailPath, setTrailPath] = useState("");

        useEffect(() => {
            if (!gameContainerRef.current) return;

            const containerWidth = gameContainerRef.current.offsetWidth;
            const containerHeight = gameContainerRef.current.offsetHeight;
            const startX = 40;
            const startY = containerHeight - 60;
            const endX = containerWidth;
            const endY = 0;

            const getRocketPosition = () => {
                if (gameState === 'waiting' || gameState === 'crashed' || multiplier < 1.01) {
                    return { x: startX, y: startY, rotation: -45 };
                }

                // Normalize progress from 0 to 1 based on multiplier, but don't cap it.
                // The visual path will cap at progress = 1, but the logic continues.
                const progress = (multiplier - 1) / 4; 
                const visualProgress = Math.min(progress, 1); // Cap visual movement at progress 1

                const curvePower = 0.5;
                const t = Math.pow(visualProgress, curvePower);

                const x = startX + (endX - startX) * t;
                const y = startY - (startY - endY) * Math.pow(visualProgress, 1.5);
                const rotation = -45 + (45 * visualProgress);
                
                return { x, y, rotation };
            };
            
            const getTrailPath = (newPos: { x: number, y: number }) => {
                const height = gameContainerRef.current?.offsetHeight ?? 0;
                 if (gameState === 'waiting' || gameState === 'crashed' || multiplier < 1.01) {
                    return `M ${startX-20} ${height} L ${startX+20} ${height} L ${startX+20} ${height-40} C ${startX+20} ${height-40} ${startX} ${height-20} ${startX-20} ${height} Z`;
                }

                return `M ${startX-20} ${height} L ${newPos.x+20} ${height} L ${newPos.x+20} ${newPos.y} C ${newPos.x+20} ${newPos.y+50} ${newPos.x-50} ${height} ${startX-20} ${height} Z`;
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
            transition: 'none', // Remove transition for smooth manual updates
            willChange: 'transform, left, top',
            opacity: gameState === 'crashed' ? 0 : 1,
            width: '120px',
            height: '120px'
        };
    
        return (
            <div ref={gameContainerRef} className="h-96 flex flex-col items-center justify-center relative w-full overflow-hidden rounded-lg border bg-gray-900">
                {/* Background Stars */}
                 <div className="absolute inset-0 z-0 opacity-50">
                    <div id="stars"></div>
                    <div id="stars2"></div>
                    <div id="stars3"></div>
                </div>
                 <style>
                    {`
                        @keyframes animStar { from { transform: translateY(0px); } to { transform: translateY(-2000px); } }
                        #stars, #stars2, #stars3 {
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
                          background-image: radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ddd, rgba(0,0,0,0)), radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0));
                          background-repeat: repeat;
                          background-size: 200px 200px;
                          animation: animStar 50s linear infinite;
                        }
                        #stars2 {
                           background-image: radial-gradient(1px 1px at 40px 20px, #eee, rgba(0,0,0,0)), radial-gradient(1px 1px at 80px 60px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 120px 140px, #ddd, rgba(0,0,0,0));
                           background-repeat: repeat;
                           background-size: 250px 250px;
                           animation: animStar 100s linear infinite;
                        }
                        #stars3 {
                           background-image: radial-gradient(1px 1px at 50px 50px, #eee, rgba(0,0,0,0)), radial-gradient(2px 2px at 100px 100px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 180px 20px, #ddd, rgba(0,0,0,0));
                           background-repeat: repeat;
                           background-size: 300px 300px;
                           animation: animStar 150s linear infinite;
                        }
                    `}
                </style>
                
                {/* Mute Button */}
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-30" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX className="h-6 w-6 text-white" /> : <Volume2 className="h-6 w-6 text-white" />}
                </Button>

                {/* Rocket Trail */}
                <svg className="absolute inset-0 w-full h-full z-10">
                    <path
                        d={trailPath}
                        fill="url(#trailGradient)"
                        stroke="hsl(var(--primary) / 0.5)"
                        strokeWidth="1"
                    />
                    <defs>
                        <linearGradient id="trailGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary) / 0)" />
                            <stop offset="100%" stopColor="hsl(var(--primary) / 0.4)" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Rocket Image */}
                <div 
                    className="z-20"
                     style={rocketStyle}
                >
                    <div className="relative w-full h-full">
                         <Image src="https://i.ibb.co/93bWYZZf/3f7ad183-dda1-4dda-996c-69961a4fabdc-removebg-preview.png" alt="Rocket" layout="fill" objectFit="contain" />
                    </div>
                </div>

                {/* Multiplier Text */}
                <div className="absolute top-1/2 left-10 -translate-y-1/2 text-left z-30">
                    {gameState === 'crashed' ? (
                        <h1 className="text-6xl sm:text-8xl font-bold text-red-500 animate-in fade-in-0 zoom-in-75">
                           x{multiplier.toFixed(2)}
                        </h1>
                    ) : (
                         <h1 className="text-6xl sm:text-8xl font-bold text-white">
                           x{multiplier.toFixed(2)}
                         </h1>
                    )}
                </div>

                {/* Countdown Timer */}
                 {gameState === 'waiting' && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-30 bg-black/30 p-4 rounded-xl">
                        <p className="text-lg text-muted-foreground">Starting in...</p>
                        <p className="text-5xl font-bold text-white">{countdown}</p>
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

    


