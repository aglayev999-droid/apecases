'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { User, InventoryItem, Item } from '@/lib/types';
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [lastFreeCaseOpen, setLastFreeCaseOpenState] = useState<Date | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const savedDate = localStorage.getItem('lastFreeCaseOpen');
    return savedDate ? new Date(savedDate) : null;
  });

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
