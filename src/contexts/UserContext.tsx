'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { User, InventoryItem, Item, RocketGameState, RocketPlayer } from '@/lib/types';
import { MOCK_USER } from '@/lib/data';

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateBalance: (stars: number, diamonds: number) => void;
  addInventoryItem: (item: Item) => void;
  updateSpending: (amount: number) => void;
  lastFreeCaseOpen: Date | null;
  setLastFreeCaseOpen: (date: Date) => void;
  // Rocket Game State
  gameState: RocketGameState;
  multiplier: number;
  history: number[];
  players: RocketPlayer[];
  crashPoint: number;
  countdown: number;
  playerBet: (userId: string, betAmount: number, avatar: string, name: string) => void;
  playerCashOut: (userId: string) => void;
  getPlayerStatus: (userId: string) => RocketPlayer | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const generateCrashPoint = () => {
    // Provably fair-ish
    const r = Math.random();
    if (r < 0.5) return 1 + Math.random(); // 50% chance for 1-2x
    if (r < 0.8) return 2 + Math.random() * 2; // 30% chance for 2-4x
    if (r < 0.95) return 4 + Math.random() * 6; // 15% chance for 4-10x
    return 10 + Math.random() * 20; // 5% chance for 10-30x
};

const mockPlayersData = [
    { id: 'p2', name: 'Hector_1312', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' },
    { id: 'p3', name: 'e_r_a_7_7_7', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' },
    { id: 'p4', name: 'okoneews', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' },
    { id: 'p5', name: 'Player5', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' },
    { id: 'p6', name: 'Player6', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' },
];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [lastFreeCaseOpen, setLastFreeCaseOpenState] = useState<Date | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const savedDate = localStorage.getItem('lastFreeCaseOpen');
    return savedDate ? new Date(savedDate) : null;
  });

  // ROCKET GAME STATE
  const [gameState, setGameState] = useState<RocketGameState>('waiting');
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(generateCrashPoint());
  const [countdown, setCountdown] = useState(10);
  const [history, setHistory] = useState<number[]>([]);
  const [players, setPlayers] = useState<RocketPlayer[]>([]);

  const resetGame = useCallback(() => {
    setGameState('waiting');
    setMultiplier(1.00);
    setCrashPoint(generateCrashPoint());
    setCountdown(10);
    
    // Reset players for the new round, keeping the current user if they exist
    setPlayers(currentPlayers => {
        const playerMap = new Map<string, RocketPlayer>();

        // Re-add human player if they exist, resetting their status for the new round
        const humanPlayer = currentPlayers.find(p => p.id === user?.id);
        if (humanPlayer) {
            playerMap.set(humanPlayer.id, { ...humanPlayer, bet: 0, status: 'waiting', cashedOutAt: null });
        }
        
        // Add some bots
        const numBots = 2 + Math.floor(Math.random() * (mockPlayersData.length - 2));
        const shuffledBots = mockPlayersData.sort(() => 0.5 - Math.random());
        
        shuffledBots.slice(0, numBots).forEach(p => {
             if (!playerMap.has(p.id)) {
                 playerMap.set(p.id, {
                    id: p.id,
                    name: p.name,
                    avatar: p.avatar,
                    bet: Math.floor(10 + Math.random() * 100),
                    status: 'waiting',
                    cashedOutAt: null,
                });
             }
        });
        
        return Array.from(playerMap.values());
    });
  }, [user?.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === 'waiting') {
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        } else {
            setGameState('playing');
             // Set status to 'playing' for everyone who has placed a bet
            setPlayers(currentPlayers => currentPlayers.map(p => 
                p.bet > 0 ? { ...p, status: 'playing' } : p
            ));
        }
    } else if (gameState === 'playing') {
        timer = setTimeout(() => {
            const newMultiplier = multiplier + (0.01 + multiplier * 0.01);
            if (newMultiplier >= crashPoint) {
                setGameState('crashed');
                setMultiplier(crashPoint);
            } else {
                setMultiplier(newMultiplier);
                // Simulate bots cashing out
                setPlayers(currentPlayers => currentPlayers.map(p => {
                    if (p.id.startsWith('p') && p.status === 'playing' && Math.random() < 0.015) { // 1.5% chance each tick
                         return { ...p, status: 'cashed_out', cashedOutAt: newMultiplier };
                    }
                    return p;
                }));
            }
        }, 60);
    } else if (gameState === 'crashed') {
        setHistory(prev => [crashPoint, ...prev.slice(0, 9)]);
        setPlayers(currentPlayers => currentPlayers.map(p => p.status === 'playing' ? {...p, status: 'lost' } : p));
        timer = setTimeout(resetGame, 3000);
    }

    return () => clearTimeout(timer);
  }, [gameState, countdown, multiplier, crashPoint, resetGame]);


  const setLastFreeCaseOpen = (date: Date) => {
    setLastFreeCaseOpenState(date);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastFreeCaseOpen', date.toISOString());
    }
  };

  const updateBalance = useCallback((stars: number, diamonds: number) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      return {
        ...currentUser,
        balance: {
          stars: currentUser.balance.stars + stars,
          diamonds: currentUser.balance.diamonds + diamonds,
        },
      };
    });
  }, []);
  
  const addInventoryItem = useCallback((item: Item) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      const newInventoryItem: InventoryItem = {
        ...item,
        inventoryId: `inv-${Date.now()}-${Math.random()}`,
        status: 'won',
      };
      return {
        ...currentUser,
        inventory: [newInventoryItem, ...currentUser.inventory],
      };
    });
  }, []);

  const updateSpending = useCallback((amount: number) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      return {
        ...currentUser,
        weeklySpending: currentUser.weeklySpending + amount,
      }
    })
  }, []);

  const playerBet = useCallback((userId: string, betAmount: number, avatar: string, name: string) => {
    if (gameState !== 'waiting') return;
    
    setUser(currentUser => {
        if (!currentUser || currentUser.balance.stars < betAmount) return currentUser;

        setPlayers(currentPlayers => {
            const playerMap = new Map(currentPlayers.map(p => [p.id, p]));
            playerMap.set(userId, {
              id: userId,
              name,
              avatar,
              bet: betAmount,
              status: 'waiting',
              cashedOutAt: null,
            });
            return Array.from(playerMap.values());
        });
        
        // Deduct balance
        return {
            ...currentUser,
            balance: { ...currentUser.balance, stars: currentUser.balance.stars - betAmount }
        };
    });
  }, [gameState]);

  const playerCashOut = useCallback((userId: string) => {
    if (gameState !== 'playing' || !user) return;

    let playerToUpdate: RocketPlayer | undefined;
    
    setPlayers(currentPlayers => {
        const playerIndex = currentPlayers.findIndex(p => p.id === userId);
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
        setUser(currentUser => {
            if (!currentUser) return null;
            return {
                ...currentUser,
                balance: {
                    ...currentUser.balance,
                    stars: currentUser.balance.stars + winnings,
                },
            };
        });
    }
  }, [gameState, multiplier, user, setUser]);

  const getPlayerStatus = useCallback((userId: string) => {
      return players.find(p => p.id === userId);
  }, [players]);

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      updateBalance, 
      addInventoryItem, 
      updateSpending, 
      lastFreeCaseOpen, 
      setLastFreeCaseOpen,
      // Rocket Game
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
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
