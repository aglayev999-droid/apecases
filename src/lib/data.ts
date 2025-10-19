import type { Item, Case, User, LeaderboardEntry } from './types';

const DEFAULT_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

// ALL_ITEMS will now be fetched from Firestore, but we can keep it here as a fallback or for reference
export const ALL_ITEMS: Item[] = [
  // Common
  { id: 'item-gift', name: 'Gift', rarity: 'Common', image: 'https://i.ibb.co/WvnMSb5J/000-1.png', imageHint: 'red gift box', value: 25, description: 'A small, mysterious gift.' },
  { id: 'item-champagne', name: 'Champagne', rarity: 'Common', image: 'https://i.ibb.co/m54YJrg8/shampain.png', imageHint: 'champagne bottle', value: 50, description: 'A bottle of celebratory champagne.' },
  
  // Uncommon
  { id: 'item-cup', name: 'Cup', rarity: 'Uncommon', image: 'https://i.ibb.co/gFL7K15Z/kubok.png', imageHint: 'golden trophy cup', value: 100, description: 'A shiny golden cup.' },
  { id: 'item-diamond', name: 'Diamond', rarity: 'Uncommon', image: 'https://i.ibb.co/RGtr2rCb/diamond.png', imageHint: 'blue diamond gem', value: 150, description: 'A sparkling diamond.' },
  { id: 'item-ring', name: 'Ring', rarity: 'Uncommon', image: 'https://i.ibb.co/hxy5rG61/ring.png', imageHint: 'silver diamond ring', value: 200, description: 'A beautiful silver ring.' },

  // Rare
  { id: 'item-desk-calendar-random', name: 'Desk Calendar (Random)', rarity: 'Rare', image: 'https://i.ibb.co/bRrhpVKL/9ac8f934df67fea7-removebg-preview.png', imageHint: 'desk calendar birthday', value: 318, description: 'A desk calendar with a random date.' },
  { id: 'item-lol-pop-random', name: 'Lol Pop (Random)', rarity: 'Rare', image: 'https://i.ibb.co/8gfrrt0R/download-removebg-preview-1.png', imageHint: 'swirl lollipop', value: 360, description: 'A sweet and colorful lollipop.' },

  // Epic
  { id: 'item-tama-gadget', name: 'Tama Gadget (Random)', rarity: 'Epic', image: 'https://i.ibb.co/Xf6HPpYc/tama.png', imageHint: 'tamagotchi virtual pet', value: 480, description: 'A nostalgic virtual pet gadget.' },
  { id: 'item-witch-hat', name: 'Witch Hat (Random)', rarity: 'Epic', image: 'https://i.ibb.co/nMHVqgnM/witch.png', imageHint: 'purple witch hat', value: 700, description: 'A magical witch hat.' },

  // Legendary
  { id: 'item-spy-agaric', name: 'Spy Agaric (Random)', rarity: 'Legendary', image: 'https://i.ibb.co/sXXQnrY/spy.png', imageHint: 'green mushroom', value: 800, description: 'A mysterious and watchful mushroom.' },
  { id: 'item-evil-eye', name: 'Evil Eye (Random)', rarity: 'Legendary', image: 'https://i.ibb.co/yvsRNdc/evil.png', imageHint: 'eyeball art', value: 846, description: 'A powerful and protective evil eye charm.' },

  // NFT
  { id: 'item-nft-ape', name: 'Bored Ape NFT', rarity: 'NFT', image: 'https://i.ibb.co/Y0p2k1j/bored-ape.png', imageHint: 'bored ape nft', value: 10000, description: 'A unique Bored Ape NFT. Super rare!' },
  { id: 'item-nft-punk', name: 'CryptoPunk NFT', rarity: 'NFT', image: 'https://i.ibb.co/L6WvXQ4/cryptopunk.png', imageHint: 'cryptopunk nft', value: 15000, description: 'A legendary CryptoPunk NFT.' },
];

export const MOCK_CASES: Case[] = [
    {
      id: 'case-free-2',
      name: 'FREE BOX',
      price: 0,
      image: 'https://i.ibb.co/jZZBNxLD/free-box.png',
      imageHint: 'red apex case',
      items: [
        { itemId: 'item-gift', probability: 0.8 },
        { itemId: 'item-champagne', probability: 0.15 },
        { itemId: 'item-cup', probability: 0.05 },
      ],
      freeCooldownSeconds: 86400, // 24 hours
    },
    {
      id: 'case-floor-8',
      name: 'FLOOR CASE',
      price: 180,
      image: 'https://i.ibb.co/twnxRfvP/floor.png',
      imageHint: 'blue apex case',
      items: [
        { itemId: 'item-gift', probability: 0.44 },
        { itemId: 'item-champagne', probability: 0.3 },
        { itemId: 'item-cup', probability: 0.15 },
        { itemId: 'item-diamond', probability: 0.08 },
        { itemId: 'item-ring', probability: 0.02 },
        { itemId: 'item-desk-calendar-random', probability: 0.01 },
      ],
    },
     {
      id: 'case-labubu-10',
      name: 'LABUBU CASE',
      price: 450,
      image: 'https://i.ibb.co/20Fh8RKz/labubu.png',
      imageHint: 'green labubu case',
      items: [
        { itemId: 'item-diamond', probability: 0.4 },
        { itemId: 'item-ring', probability: 0.3 },
        { itemId: 'item-desk-calendar-random', probability: 0.15 },
        { itemId: 'item-lol-pop-random', probability: 0.1 },
        { itemId: 'item-tama-gadget', probability: 0.05 },
      ],
    },
    {
      id: 'case-snoop-7',
      name: 'SNOOP DOGG CASE',
      price: 1000,
      image: 'https://i.ibb.co/F4V0dGX3/Apex-Case.png',
      imageHint: 'purple snoop dogg case',
      items: [
        { itemId: 'item-witch-hat', probability: 0.4 },
        { itemId: 'item-spy-agaric', probability: 0.3 },
        { itemId: 'item-evil-eye', probability: 0.25 },
        { itemId: 'item-nft-ape', probability: 0.05 },
      ],
    },
     {
      id: 'case-legendary-1',
      name: 'LEGENDARY',
      price: 5000,
      image: 'https://i.ibb.co/f2kC2gr/legend-case.png',
      imageHint: 'golden legendary case',
      items: [
        { itemId: 'item-spy-agaric', probability: 0.5 },
        { itemId: 'item-evil-eye', probability: 0.3 },
        { itemId: 'item-nft-ape', probability: 0.15 },
        { itemId: 'item-nft-punk', probability: 0.05 },
      ],
    },
];

export const MOCK_USER: User | null = null;


export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user: { name: 'Ghost', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 150000 },
  { rank: 2, user: { name: 'Viper', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 125000 },
  { rank: 3, user: { name: 'Cipher', avatar: DEFAULT_AVATAR }, spent: 105000 },
  { rank: 4, user: { name: 'Rogue', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 98000 },
  { rank: 5, user: { name: 'Spectre', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 76000 },
  { rank: 6, user: { name: 'Nomad', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 54000 },
  { rank: 7, user: { name: 'Reaper', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 32000 },
  { rank: 8, user: { name: 'Blitz', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 21000 },
  { rank: 9, user: { name: 'Fury', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 15000 },
  { rank: 10, user: { name: 'Wraith', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 8000 },
];
