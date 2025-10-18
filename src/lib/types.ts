export interface Item {
  id: string;
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'NFT';
  image: string;
  imageHint: string;
  value: number; // in Stars
  description?: string;
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
  inventoryId: string;
  status: 'won' | 'exchanged' | 'shipped';
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
  inventory: InventoryItem[];
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
