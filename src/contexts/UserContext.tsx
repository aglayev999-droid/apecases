'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { User, InventoryItem, Item } from '@/lib/types';
import { useAuth as useFirebaseAuth, useFirestore, useDoc, useCollection, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc, collection, writeBatch, serverTimestamp, increment, setDoc } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Auth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

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

const createNewUserDocument = async (firestore: any, firebaseUser: FirebaseUser) => {
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const newUser: User = {
        id: firebaseUser.uid,
        telegramId: `tg-${Math.random().toString(36).substring(2, 9)}`,
        name: 'Anonymous',
        username: `user${Math.floor(Math.random() * 90000) + 10000}`,
        avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg',
        balance: { stars: 1000, diamonds: 0 },
        referrals: { count: 0, commissionEarned: 0, code: `ref-${firebaseUser.uid.slice(0, 5)}` },
        weeklySpending: 0,
    };
    await setDoc(userDocRef, newUser);
    return newUser;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user: firebaseUser, isUserLoading: isAuthLoading, auth } = useFirebaseAuth();
  
  const userDocRef = useMemoFirebase(() => 
    firestore && firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : null, 
    [firestore, firebaseUser]
  );
  
  const handleCreateUser = useCallback((firebaseUser: FirebaseUser) => {
      if (!firestore) {
          throw new Error("Firestore not available");
      }
      return createNewUserDocument(firestore, firebaseUser);
  }, [firestore]);
  
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userDocRef, {
      onCreate: handleCreateUser
  });

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
    if (!isAuthLoading && !firebaseUser && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isAuthLoading, firebaseUser, auth]);


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
      isUserLoading: isAuthLoading || isUserDocLoading,
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
