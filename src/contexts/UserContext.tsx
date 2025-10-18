'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { User, InventoryItem, Item, RocketGameState, RocketPlayer } from '@/lib/types';
import { MOCK_USER } from '@/lib/data';

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateBalance: (stars: number, diamonds: number) => void;
  addInventoryItem: (item: Item) => void;
  removeInventoryItem: (inventoryId: string) => void;
  removeInventoryItems: (inventoryIds: string[]) => void;
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
    
    setPlayers(currentPlayers => {
        const playerMap = new Map<string, RocketPlayer>();

        const humanPlayer = currentPlayers.find(p => p.id === user?.id);
        if (humanPlayer) {
            playerMap.set(humanPlayer.id, { ...humanPlayer, bet: 0, status: 'waiting', cashedOutAt: null });
        }
        
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
        inventoryId: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'won',
      };
      return {
        ...currentUser,
        inventory: [newInventoryItem, ...currentUser.inventory],
      };
    });
  }, []);

  const removeInventoryItem = useCallback((inventoryId: string) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      return {
        ...currentUser,
        inventory: currentUser.inventory.filter(item => item.inventoryId !== inventoryId),
      };
    });
  }, []);
  
  const removeInventoryItems = useCallback((inventoryIds: string[]) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      const idSet = new Set(inventoryIds);
      return {
        ...currentUser,
        inventory: currentUser.inventory.filter(item => !idSet.has(item.inventoryId)),
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
      removeInventoryItem,
      removeInventoryItems,
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
