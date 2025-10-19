'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { RocketGameState, RocketPlayer } from '@/lib/types';
import { useUser } from '@/contexts/UserContext';

interface RocketContextType {
    gameState: RocketGameState;
    multiplier: number;
    history: number[];
    players: RocketPlayer[];
    crashPoint: number;
    countdown: number;
    playerBet: (betAmount: number) => void;
    playerCashOut: () => void;
    getPlayerStatus: (userId: string) => RocketPlayer | undefined;
}

const RocketContext = createContext<RocketContextType | undefined>(undefined);

const generateCrashPoint = () => {
    // Provably fair-ish
    const r = Math.random();
    if (r < 0.5) return 1 + Math.random(); // 50% chance for 1-2x
    if (r < 0.8) return 2 + Math.random() * 2; // 30% chance for 2-4x
    if (r < 0.95) return 4 + Math.random() * 6; // 15% chance for 4-10x
    return 10 + Math.random() * 20; // 5% chance for 10-30x
};

export const RocketProvider = ({ children }: { children: ReactNode }) => {
    const { user, updateBalance } = useUser();
    
    const [gameState, setGameState] = useState<RocketGameState>('waiting');
    const [multiplier, setMultiplier] = useState(1.00);
    const [crashPoint, setCrashPoint] = useState(0); // Set initially to 0
    const [countdown, setCountdown] = useState(10);
    const [history, setHistory] = useState<number[]>([]);
    const [players, setPlayers] = useState<RocketPlayer[]>([]);

    useEffect(() => {
        // Run only on the client
        setCrashPoint(generateCrashPoint());
    }, []);

    const resetGame = useCallback(() => {
        setGameState('waiting');
        setMultiplier(1.00);
        setCrashPoint(generateCrashPoint());
        setCountdown(10);
        
        setPlayers(currentPlayers => {
            const playerMap = new Map<string, RocketPlayer>();

            if(user) {
                const humanPlayer = currentPlayers.find(p => p.id === user.id);
                if (humanPlayer) {
                    playerMap.set(humanPlayer.id, { ...humanPlayer, bet: 0, status: 'waiting', cashedOutAt: null });
                }
            }
            
            return Array.from(playerMap.values());
        });
    }, [user]);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (gameState === 'waiting') {
            if (countdown > 0) {
                timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
            } else {
                setGameState('playing');
                setPlayers(currentPlayers => currentPlayers.map(p => 
                    p.bet > 0 ? { ...p, status: 'playing' } : p
                ));
            }
        } else if (gameState === 'playing') {
            timer = setTimeout(() => {
                const newMultiplier = multiplier + (0.01 + multiplier * 0.005);
                if (newMultiplier >= crashPoint) {
                    setGameState('crashed');
                    setMultiplier(crashPoint);
                } else {
                    setMultiplier(newMultiplier);
                }
            }, 100);
        } else if (gameState === 'crashed') {
            if (crashPoint > 0) { // Only add to history if it was a valid round
                setHistory(prev => [crashPoint, ...prev.slice(0, 9)]);
            }
            setPlayers(currentPlayers => currentPlayers.map(p => p.status === 'playing' ? {...p, status: 'lost' } : p));
            timer = setTimeout(resetGame, 3000);
        }

        return () => clearTimeout(timer);
    }, [gameState, countdown, multiplier, crashPoint, resetGame]);
    
    const playerBet = useCallback((betAmount: number) => {
        if (gameState !== 'waiting' || !user || user.balance.stars < betAmount) {
            return;
        }

        // Update player list state
        setPlayers(currentPlayers => {
            const playerMap = new Map(currentPlayers.map(p => [p.id, p]));
            playerMap.set(user.id, {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                bet: betAmount,
                status: 'waiting',
                cashedOutAt: null,
            });
            return Array.from(playerMap.values());
        });

        // Update user balance state
        updateBalance(-betAmount);

    }, [gameState, user, updateBalance]);

    const playerCashOut = useCallback(() => {
        if (gameState !== 'playing' || !user) return;

        let playerToUpdate: RocketPlayer | undefined;
        
        setPlayers(currentPlayers => {
            const playerIndex = currentPlayers.findIndex(p => p.id === user.id);
            if (playerIndex === -1 || currentPlayers[playerIndex].status !== 'playing') {
                return currentPlayers;
            }

            playerToUpdate = currentPlayers[playerIndex];
            const newPlayers = [...currentPlayers];
            newPlayers[playerIndex] = { ...playerToUpdate, status: 'cashed_out', cashedOutAt: multiplier };
            return newPlayers;
        });

        if (playerToUpdate) {
            const winnings = playerToUpdate.bet * multiplier;
            updateBalance(winnings);
        }
    }, [gameState, multiplier, user, updateBalance]);

    const getPlayerStatus = useCallback((userId: string) => {
        return players.find(p => p.id === userId);
    }, [players]);


    return (
        <RocketContext.Provider value={{
            gameState,
            multiplier,
            history,
            players,
            crashPoint,
            countdown,
            playerBet,
            playerCashOut,
            getPlayerStatus,
        }}>
            {children}
        </RocketContext.Provider>
    );
};

export const useRocket = () => {
    const context = useContext(RocketContext);
    if (context === undefined) {
        throw new Error('useRocket must be used within a RocketProvider');
    }
    return context;
};
