import type { Item, Case, User, LeaderboardEntry } from './types';

const DEFAULT_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

export const ALL_ITEMS: Item[] = [
  { id: 'item-sword-1', name: 'Cyberblade', rarity: 'Common', image: 'https://i.ibb.co/6gSBFxV/s1.jpg', imageHint: 'cyberpunk sword', value: 50, description: 'A standard issue energy-edged sword.' },
  { id: 'item-shield-1', name: 'Kinetic Barrier', rarity: 'Uncommon', image: 'https://i.ibb.co/JyW3PzM/s2.jpg', imageHint: 'energy shield', value: 150, description: 'A personal shield that hardens on impact.' },
  { id: 'item-helmet-1', name: 'Aegis Visor', rarity: 'Rare', image: 'https://i.ibb.co/d2C1r8S/s3.jpg', imageHint: 'glowing helmet', value: 500, description: 'Provides enhanced tactical data.' },
  { id: 'item-armor-1', name: 'Goliath Plate', rarity: 'Epic', image: 'https://i.ibb.co/tYHwZ29/s4.jpg', imageHint: 'futuristic armor', value: 2000, description: 'Nearly impenetrable composite armor.' },
  { id: 'item-boots-1', name: 'Hermes Greaves', rarity: 'Legendary', image: 'https://i.ibb.co/PQLPj58/s5.jpg', imageHint: 'glowing boots', value: 10000, description: 'Grants unbelievable speed and agility.' },
  { id: 'item-gloves-1', name: 'Power Grips', rarity: 'Rare', image: 'https://i.ibb.co/V9ZDBJg/s6.jpg', imageHint: 'power gloves', value: 450, description: 'Enhances strength and weapon handling.' },
  { id: 'item-nft-1', name: 'CryptoKey Alpha', rarity: 'NFT', image: 'https://i.ibb.co/JmB9Z1G/s7.jpg', imageHint: 'crypto art', value: 50000, description: 'A unique, verifiable digital artifact from the Old Web.' },
];

export const MOCK_CASES: Case[] = [
  {
    id: 'case-free-2',
    name: 'Free box',
    price: 0,
    image: 'https://i.ibb.co/bJC2S3M/photo-2024-07-29-19-14-10.jpg',
    imageHint: 'gift box gingerbread',
    freeCooldownSeconds: 86400, // 24 hours
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
    image: 'https://i.ibb.co/Pgp1dD1/photo-2024-07-29-19-14-11.jpg',
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
    image: 'https://i.ibb.co/gDFsYk2/photo-2024-07-29-19-14-11-2.jpg',
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
    image: 'https://i.ibb.co/0VfNThY/photo-2024-07-29-19-14-12.jpg',
    imageHint: 'legendary artifact',
    items: [
      { itemId: 'item-sword-1', probability: 0.7 },
      { itemId: 'item-shield-1', probability: 0.2 },
      { itemId: 'item-helmet-1', probability: 0.09 },
      { "itemId": "item-nft-1", probability: 0.01 },
    ],
  },
];

export const MOCK_USER: User = {
  id: 'user-123',
  telegramId: '987654321',
  name: 'Cipher',
  username: 'cipher_dev',
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
  { rank: 1, user: { name: 'Ghost', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 150000 },
  { rank: 2, user: { name: 'Viper', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 125000 },
  { rank: 3, user: { name: 'Cipher', avatar: DEFAULT_AVATAR }, spent: MOCK_USER.weeklySpending },
  { rank: 4, user: { name: 'Rogue', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 98000 },
  { rank: 5, user: { name: 'Spectre', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 76000 },
  { rank: 6, user: { name: 'Nomad', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 54000 },
  { rank: 7, user: { name: 'Reaper', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 32000 },
  { rank: 8, user: { name: 'Blitz', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 21000 },
  { rank: 9, user: { name: 'Fury', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 15000 },
  { rank: 10, user: { name: 'Wraith', avatar: 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg' }, spent: 8000 },
];