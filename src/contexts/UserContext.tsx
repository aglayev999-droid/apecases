
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import type { User, InventoryItem, Item } from '@/lib/types';
import { useAuth as useFirebaseAuth, useFirestore, useDoc, useCollection, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc, collection, writeBatch, serverTimestamp, increment, setDoc, deleteDoc, getDocs, query, where, limit } from 'firebase/firestore';
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
          start_param?: string;
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
  updateStarsSpent: (amount: number) => void;
  lastFreeCaseOpen: Date | null;
  setLastFreeCaseOpen: (date: Date) => void;
  isUserLoading: boolean;
  hasNewItems: boolean;
  setHasNewItems: (hasNew: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const handleReferral = async (firestore: any, referralCode: string) => {
    if (!referralCode) return null;

    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('referrals.code', '==', referralCode), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const referrerDoc = querySnapshot.docs[0];
        const referrerRef = doc(firestore, 'users', referrerDoc.id);

        const batch = writeBatch(firestore);
        batch.update(referrerRef, { 
            'referrals.count': increment(1),
            'referrals.commissionEarned': increment(2) // Referrer gets 2 stars
        });
        await batch.commit();

        return referrerDoc.id; // Return referrer's UID
    }
    return null;
};


const createNewUserDocument = async (firestore: any, firebaseUser: FirebaseUser) => {
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const tg = window.Telegram?.WebApp.initDataUnsafe;
    const tgUser = tg?.user;
    const referralCode = tg?.start_param;

    let invitedById = null;
    if (referralCode) {
        invitedById = await handleReferral(firestore, referralCode);
    }
    
    let newUser: User;

    if (tgUser) {
        newUser = {
            id: firebaseUser.uid,
            telegramId: String(tgUser.id),
            name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
            username: tgUser.username || `tg_${tgUser.id}`,
            avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg',
            balance: { stars: 1000, diamonds: 0 },
            referrals: { count: 0, commissionEarned: 0, code: `ref-${firebaseUser.uid.slice(0, 6)}` },
            starsSpentOnCases: 0,
            ...(invitedById && { invitedById }),
        };
    } else {
        newUser = {
            id: firebaseUser.uid,
            telegramId: `tg-web-${Math.random().toString(36).substring(2, 9)}`,
            name: 'Web User',
            username: `user${Math.floor(Math.random() * 90000) + 10000}`,
            avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg',
            balance: { stars: 10000, diamonds: 0 },
            referrals: { count: 0, commissionEarned: 0, code: `ref-${firebaseUser.uid.slice(0, 6)}` },
            starsSpentOnCases: 0,
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

    const baseItemsMap = new Map(ALL_ITEMS.map(item => [item.id, item]));

    return rawInventory.map(invItem => {
        // Here invItem.id is the document ID from firestore,
        // and invItem.itemId is the ID that links to ALL_ITEMS
        const baseItem = baseItemsMap.get(invItem.itemId);
        
        return {
            ...invItem,
            inventoryId: invItem.id, // This is the unique ID for the inventory entry
            id: invItem.itemId,      // This is the base item ID
            name: baseItem?.name || invItem.name,
            image: baseItem?.image || invItem.image,
            imageHint: baseItem?.imageHint || invItem.imageHint,
            rarity: baseItem?.rarity || invItem.rarity,
            value: baseItem?.value || invItem.value,
            description: baseItem?.description || invItem.description,
            isUpgradable: baseItem?.isUpgradable ?? false,
            isTargetable: baseItem?.isTargetable ?? false,
            collectionAddress: baseItem?.collectionAddress,
            animationUrl: baseItem?.animationUrl,
        };
    });
}, [rawInventory]);


  const [lastFreeCaseOpen, setLastFreeCaseOpenState] = useState<Date | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedDate = localStorage.getItem('lastFreeCaseOpen');
    return savedDate ? new Date(savedDate) : null;
  });
  
  const [hasNewItems, setHasNewItems] = useState(false);

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
    const { isUpgradable, isTargetable, id: itemId, ...baseItemWithoutId } = item;
    const newInventoryItem: Omit<InventoryItem, 'id' | 'inventoryId'> & { wonAt: any, itemId: string } = {
      ...baseItemWithoutId,
      itemId: itemId, // explicitly add itemId
      status: 'won',
      wonAt: serverTimestamp(),
    };
    addDocumentNonBlocking(inventoryColRef, newInventoryItem);
    setHasNewItems(true);
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

  const updateStarsSpent = useCallback((amount: number) => {
    if (!userDocRef || !firestore) return;
    const batch = writeBatch(firestore);
    batch.update(userDocRef, { starsSpentOnCases: increment(amount) });
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
      updateStarsSpent, 
      lastFreeCaseOpen, 
      setLastFreeCaseOpen,
      isUserLoading: isAuthLoading || isUserDocLoading,
      hasNewItems,
      setHasNewItems
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
