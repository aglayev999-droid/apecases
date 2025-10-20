
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import type { User, InventoryItem, Item } from '@/lib/types';
import { useAuth as useFirebaseAuth, useFirestore, useDoc, useCollection, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc, collection, writeBatch, serverTimestamp, increment, setDoc, deleteDoc } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Auth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAlertDialog } from './AlertDialogContext';
import { useTranslation } from './LanguageContext';
import { ALL_ITEMS } from '@/lib/data';

// Define the Telegram user structure on the window object
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code: string;
            is_premium?: boolean;
          };
        };
        ready: () => void;
        close: () => void;
      };
    };
  }
}

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
    const tgUser = window.Telegram?.WebApp.initDataUnsafe.user;
    
    let newUser: User;

    if (tgUser) {
        // If Telegram data is available, use it
        newUser = {
            id: firebaseUser.uid,
            telegramId: String(tgUser.id),
            name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
            username: tgUser.username || `tg_${tgUser.id}`,
            avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg', // You can add logic to fetch profile photo later
            balance: { stars: 1000, diamonds: 0 },
            referrals: { count: 0, commissionEarned: 0, code: `ref-${firebaseUser.uid.slice(0, 5)}` },
            weeklySpending: 0,
        };
    } else {
        // Fallback for when not in Telegram (e.g., web browser)
        newUser = {
            id: firebaseUser.uid,
            telegramId: `tg-web-${Math.random().toString(36).substring(2, 9)}`,
            name: 'Web User',
            username: `user${Math.floor(Math.random() * 90000) + 10000}`,
            avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg',
            balance: { stars: 10000, diamonds: 0 }, // Higher balance for web testing
            referrals: { count: 0, commissionEarned: 0, code: `ref-${firebaseUser.uid.slice(0, 5)}` },
            weeklySpending: 0,
        };
    }

    await setDoc(userDocRef, newUser);
    return newUser;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user: firebaseUser, isUserLoading: isAuthLoading, auth } = useFirebaseAuth();
  const { showAlert } = useAlertDialog();
  const { t } = useTranslation();
  
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
  const { data: rawInventory } = useCollection<Omit<InventoryItem, 'inventoryId'>>(inventoryColRef);

  const inventory: InventoryItem[] | null = useMemo(() => {
    if (!rawInventory) return null;
    
    // Create a map of the base items for quick lookup
    const baseItemsMap = new Map(ALL_ITEMS.map(item => [item.id, item]));

    return rawInventory.map(invItem => {
        const baseItem = baseItemsMap.get(invItem.id);
        return {
            ...invItem,
            inventoryId: invItem.id, // The doc id from Firestore is on the 'id' field
            isUpgradable: baseItem?.isUpgradable ?? false,
            isTargetable: baseItem?.isTargetable ?? false,
        };
    });
  }, [rawInventory]);


  const [lastFreeCaseOpen, setLastFreeCaseOpenState] = useState<Date | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedDate = localStorage.getItem('lastFreeCaseOpen');
    return savedDate ? new Date(savedDate) : null;
  });

  const [isAppLoading, setIsAppLoading] = useState(true);
  
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
    
    if (!isAuthLoading && !firebaseUser && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isAuthLoading, firebaseUser, auth]);
  
  // Multi-account detection
   useEffect(() => {
    if (user && window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const tgUserId = String(window.Telegram.WebApp.initDataUnsafe.user.id);
      if (user.telegramId !== tgUserId) {
        showAlert({
          title: t('userContext.accountMismatchTitle'),
          description: t('userContext.accountMismatchDescription'),
          onConfirm: () => {
              auth?.signOut().then(() => {
                  // This will trigger a re-login flow
                   window.location.reload();
              })
          }
        });
      }
    }
  }, [user, auth, showAlert, t]);

  useEffect(() => {
    if (!isAuthLoading && !isUserDocLoading) {
      const timer = setTimeout(() => {
        setIsAppLoading(false);
      }, 2000); // Keep loading screen for at least 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, isUserDocLoading]);


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
    const { isUpgradable, isTargetable, ...baseItem } = item;
    const newInventoryItem: Omit<InventoryItem, 'id' | 'inventoryId'> & { wonAt: any } = {
      ...baseItem,
      status: 'won',
      wonAt: serverTimestamp(),
    };
    addDocumentNonBlocking(inventoryColRef, newInventoryItem);
  }, [inventoryColRef]);

  const removeInventoryItem = useCallback((inventoryId: string) => {
    if (!inventoryColRef || !firestore) return;
    const itemRef = doc(inventoryColRef, inventoryId);
    deleteDoc(itemRef).catch(e => console.error("Failed to remove item:", e));
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

  if (isAppLoading) {
    return <LoadingScreen />;
  }

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
