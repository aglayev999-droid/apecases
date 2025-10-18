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
}

export interface InventoryItem extends Item {
  inventoryId: string;
  status: 'won' | 'exchanged' | 'shipped';
}

export interface User {
  id: string;
  telegramId: string;
  name: string;
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
