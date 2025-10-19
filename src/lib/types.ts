import { Timestamp } from 'firebase/firestore';

export interface Item {
  id: string;
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'NFT';
  image: string;
  imageHint: string;
  value: number; // in Stars
  description?: string;
  animationUrl?: string;
}

export interface Case {
  id: string;
  name: string;
  price: number; // in Stars
  image: string;
  imageHint: string;
  items: { itemId: string; probability: number }[]; // Sum of probabilities should be 1
  freeCooldownSeconds?: number;
}

export interface InventoryItem extends Item {
  // The 'id' from the top-level 'items' collection is duplicated here for convenience,
  // but the document ID in the subcollection is the unique inventory identifier.
  status: 'won' | 'exchanged' | 'shipped';
  wonAt: Timestamp;
}

export interface User {
  id: string;
  telegramId: string;
  name: string;
  username: string;
  avatar: string;
  balance: {
    stars: number;
    diamonds: number;
  };
  // inventory is now a sub-collection, so it's not stored directly on the user document.
  referrals: {
    count: number;
    commissionEarned: number;
    code: string;
  };
  weeklySpending: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    name: string;
    avatar: string;
  };
  spent: number;
}

// Rocket Game Types
export type RocketGameState = 'waiting' | 'playing' | 'crashed';
export type RocketPlayerStatus = 'waiting' | 'playing' | 'cashed_out' | 'lost';

export interface RocketPlayer {
  id: string;
  name: string;
  avatar: string;
  bet: number;
  status: RocketPlayerStatus;
  cashedOutAt: number | null;
}
