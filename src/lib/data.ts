
import type { Item, Case, User, LeaderboardEntry } from './types';

const DEFAULT_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

export const ALL_ITEMS: Item[] = [
  { id: 'item-sword-1', name: 'Cyberblade', rarity: 'Common', image: 'https://picsum.photos/seed/item1/200/200', imageHint: 'cyberpunk sword', value: 50, description: 'A standard issue energy-edged sword.' },
  { id: 'item-shield-1', name: 'Kinetic Barrier', rarity: 'Uncommon', image: 'https://picsum.photos/seed/item2/200/200', imageHint: 'energy shield', value: 150, description: 'A personal shield that hardens on impact.' },
  { id: 'item-helmet-1', name: 'Aegis Visor', rarity: 'Rare', image: 'https://picsum.photos/seed/item3/200/200', imageHint: 'glowing helmet', value: 500, description: 'Provides enhanced tactical data.' },
  { id: 'item-armor-1', name: 'Goliath Plate', rarity: 'Epic', image: 'https://picsum.photos/seed/item4/200/200', imageHint: 'futuristic armor', value: 2000, description: 'Nearly impenetrable composite armor.' },
  { id: 'item-boots-1', name: 'Hermes Greaves', rarity: 'Legendary', image: 'https://picsum.photos/seed/item5/200/200', imageHint: 'glowing boots', value: 10000, description: 'Grants unbelievable speed and agility.' },
  { id: 'item-gloves-1', name: 'Power Grips', rarity: 'Rare', image: 'https://picsum.photos/seed/item7/200/200', imageHint: 'power gloves', value: 450, description: 'Enhances strength and weapon handling.' },
  { id: 'item-nft-1', name: 'CryptoKey Alpha', rarity: 'NFT', image: 'https://picsum.photos/seed/item6/200/200', imageHint: 'crypto art', value: 50000, description: 'A unique, verifiable digital artifact from the Old Web.' },
];

export const MOCK_CASES: Case[] = [
  {
    id: 'case-free-2',
    name: 'Free box',
    price: 0,
    image: 'https://picsum.photos/seed/case1/400/300',
    imageHint: 'gift box gingerbread',
    items: [
      { itemId: 'item-armor-1', probability: 0.5 },
      { itemId: 'item-boots-1', probability: 0.3 },
      { itemId: 'item-nft-1', probability: 0.2 },
    ],
  },
  {
    id: 'case-floor-8',
    name: 'FLOOR CASE',
    price: 180,
    image: 'https://picsum.photos/seed/case2/400/300',
    imageHint: 'glowing chest',
    items: [
      { itemId: 'item-sword-1', probability: 0.4 },
      { itemId: 'item-shield-1', probability: 0.3 },
      { itemId: 'item-helmet-1', probability: 0.15 },
      { itemId: 'item-armor-1', probability: 0.1 },
      { itemId: 'item-nft-1', probability: 0.05 },
    ],
  },
  {
    id: 'case-labubu-10',
    name: 'LABUBU CASE',
    price: 240,
    image: 'https://picsum.photos/seed/case3/400/300',
    imageHint: 'epic treasure',
    items: [
      { itemId: 'item-shield-1', probability: 0.3 },
      { itemId: 'item-helmet-1', probability: 0.3 },
      { itemId: 'item-armor-1', probability: 0.25 },
      { itemId: 'item-boots-1', probability: 0.1 },
      { itemId: 'item-nft-1', probability: 0.05 },
    ],
  },
  {
    id: 'case-snoop-7',
    name: 'SNOOP DOG CASE',
    price: 180,
    image: 'https://picsum.photos/seed/case4/400/300',
    imageHint: 'legendary artifact',
    items: [
      { itemId: 'item-sword-1', probability: 0.7 },
      { itemId: 'item-shield-1', probability: 0.2 },
      { itemId: 'item-helmet-1', probability: 0.09 },
      { itemId: 'item-nft-1', probability: 0.01 },
    ],
  },
];

export const MOCK_USER: User = {
  id: 'user-123',
  telegramId: '987654321',
  name: 'Cipher',
  avatar: DEFAULT_AVATAR,
  balance: {
    stars: 25000,
    diamonds: 0,
  },
  inventory: [],
  referrals: {
    count: 0,
    commissionEarned: 0,
    code: 'CIPHER-ALPHA',
  },
  weeklySpending: 0,
};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user: { name: 'Ghost', avatar: 'https://picsum.photos/seed/lead1/100/100' }, spent: 150000 },
  { rank: 2, user: { name: 'Viper', avatar: 'https://picsum.photos/seed/lead2/100/100' }, spent: 125000 },
  { rank: 3, user: { name: 'Cipher', avatar: DEFAULT_AVATAR }, spent: MOCK_USER.weeklySpending },
  { rank: 4, user: { name: 'Rogue', avatar: 'https://picsum.photos/seed/lead4/100/100' }, spent: 98000 },
  { rank: 5, user: { name: 'Spectre', avatar: 'https://picsum.photos/seed/lead5/100/100' }, spent: 76000 },
  { rank: 6, user: { name: 'Nomad', avatar: 'https://picsum.photos/seed/lead6/100/100' }, spent: 54000 },
  { rank: 7, user: { name: 'Reaper', avatar: 'https://picsum.photos/seed/lead7/100/100' }, spent: 32000 },
  { rank: 8, user: { name: 'Blitz', avatar: 'https://picsum.photos/seed/lead8/100/100' }, spent: 21000 },
  { rank: 9, user: { name: 'Fury', avatar: 'https://picsum.photos/seed/lead9/100/100' }, spent: 15000 },
  { rank: 10, user: { name: 'Wraith', avatar: 'https://picsum.photos/seed/lead10/100/100' }, spent: 8000 },
];
