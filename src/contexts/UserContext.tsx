'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { User, InventoryItem, Item } from '@/lib/types';
import { MOCK_USER } from '@/lib/data';

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateBalance: (stars: number, diamonds: number) => void;
  addInventoryItem: (item: Item) => void;
  updateSpending: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(MOCK_USER);

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

  return (
    <UserContext.Provider value={{ user, setUser, updateBalance, addInventoryItem, updateSpending }}>
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
