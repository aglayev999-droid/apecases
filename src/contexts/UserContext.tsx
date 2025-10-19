'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { User, InventoryItem, Item } from '@/lib/types';
import { useAuth as useFirebaseAuth, useFirestore, useDoc, useCollection, addDocumentNonBlocking, useMemoFirebase, useAuth } from '@/firebase';
import { doc, collection, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

interface UserContextType {
  user: User | null;
  inventory: InventoryItem[] | null;
  updateBalance: (stars: number) => void;
  addInventoryItem: (item: Item) => void;
  removeInventoryItem: (inventoryId: string) => void;
  removeInventoryItems: (inventoryIds: string[]) => void;
  updateSpending: (amount: number) => void;
  lastFreeCaseOpen: Date | null;
  setLastFreeCaseOpen: (date: Date) => void;
  isUserLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user: firebaseUser, isUserLoading } = useFirebaseAuth();
  
  const userDocRef = useMemoFirebase(() => 
    firestore && firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : null, 
    [firestore, firebaseUser]
  );
  const { data: user } = useDoc<User>(userDocRef);

  const inventoryColRef = useMemoFirebase(() =>
    firestore && firebaseUser ? collection(firestore, 'users', firebaseUser.uid, 'inventory') : null,
    [firestore, firebaseUser]
  );
  const { data: inventory } = useCollection<InventoryItem>(inventoryColRef);

  const [lastFreeCaseOpen, setLastFreeCaseOpenState] = useState<Date | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedDate = localStorage.getItem('lastFreeCaseOpen');
    return savedDate ? new Date(savedDate) : null;
  });

  useEffect(() => {
    if (!isUserLoading && !firebaseUser && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, firebaseUser, auth]);

  const setLastFreeCaseOpen = (date: Date) => {
    setLastFreeCaseOpenState(date);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastFreeCaseOpen', date.toISOString());
    }
  };

  const updateBalance = useCallback((stars: number) => {
    if (!userDocRef || !firestore) return;
    const batch = writeBatch(firestore);
    batch.update(userDocRef, { 'balance.stars': increment(stars) });
    batch.commit().catch(e => console.error("Failed to update balance:", e));
  }, [firestore, userDocRef]);
  
  const addInventoryItem = useCallback((item: Item) => {
    if (!inventoryColRef) return;
    const newInventoryItem: Omit<InventoryItem, 'id'> & { wonAt: any } = {
      ...item,
      status: 'won',
      wonAt: serverTimestamp(),
    };
    addDocumentNonBlocking(inventoryColRef, newInventoryItem);
  }, [inventoryColRef]);

  const removeInventoryItem = useCallback((inventoryId: string) => {
    if (!inventoryColRef || !firestore) return;
    const batch = writeBatch(firestore);
    const itemRef = doc(inventoryColRef, inventoryId);
    batch.delete(itemRef);
    batch.commit().catch(e => console.error("Failed to remove item:", e));
  }, [firestore, inventoryColRef]);
  
  const removeInventoryItems = useCallback((inventoryIds: string[]) => {
    if (!inventoryColRef || !firestore) return;
    const batch = writeBatch(firestore);
    inventoryIds.forEach(id => {
      const itemRef = doc(inventoryColRef, id);
      batch.delete(itemRef);
    });
    batch.commit().catch(e => console.error("Failed to remove items:", e));
  }, [firestore, inventoryColRef]);

  const updateSpending = useCallback((amount: number) => {
    if (!userDocRef || !firestore) return;
    const batch = writeBatch(firestore);
    batch.update(userDocRef, { weeklySpending: increment(amount) });
    batch.commit().catch(e => console.error("Failed to update spending:", e));
  }, [firestore, userDocRef]);


  return (
    <UserContext.Provider value={{ 
      user, 
      inventory,
      updateBalance, 
      addInventoryItem, 
      removeInventoryItem,
      removeInventoryItems,
      updateSpending, 
      lastFreeCaseOpen, 
      setLastFreeCaseOpen,
      isUserLoading,
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
