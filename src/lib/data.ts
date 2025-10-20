
import { Item, Case, User, LeaderboardEntry, CaseBattle } from './types';
import { Timestamp } from 'firebase/firestore';


const DEFAULT_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

// ALL_ITEMS will now be fetched from Firestore, but we can keep it here as a fallback or for reference
export const ALL_ITEMS: Item[] = [
  // Stars (not real items, just for winning currency)
  { id: 'item-stars-25', name: '25 Stars', rarity: 'Common', image: 'https://i.ibb.co/WN2md4DV/stars.png', imageHint: 'gold stars', value: 25, description: 'A handful of shiny stars.', isUpgradable: false, isTargetable: false },
  { id: 'item-stars-50', name: '50 Stars', rarity: 'Common', image: 'https://i.ibb.co/WN2md4DV/stars.png', imageHint: 'gold stars', value: 50, description: 'A small pouch of stars.', isUpgradable: false, isTargetable: false },
  { id: 'item-stars-100', name: '100 Stars', rarity: 'Uncommon', image: 'https://i.ibb.co/WN2md4DV/stars.png', imageHint: 'gold stars', value: 100, description: 'A bag of stars.', isUpgradable: false, isTargetable: false },

  // Common
  { id: 'item-gift', name: 'Gift', rarity: 'Common', image: 'https://i.ibb.co/WvnMSb5J/000-1.png', imageHint: 'red gift box', value: 25, description: 'A small, mysterious gift.', isUpgradable: true, isTargetable: false },
  { id: 'item-champagne', name: 'Champagne', rarity: 'Common', image: 'https://i.ibb.co/m54YJrg8/shampain.png', imageHint: 'champagne bottle', value: 50, description: 'A bottle of celebratory champagne.', isUpgradable: true, isTargetable: false },
  { id: 'item-cup', name: 'Cup', rarity: 'Common', image: 'https://i.ibb.co/gFL7K15Z/kubok.png', imageHint: 'golden trophy cup', value: 100, description: 'A shiny golden cup.', isUpgradable: true, isTargetable: false },
  { id: 'item-diamond', name: 'Diamond', rarity: 'Common', image: 'https://i.ibb.co/RGtr2rCb/diamond.png', imageHint: 'blue diamond gem', value: 100, description: 'A sparkling diamond.', isUpgradable: true, isTargetable: false },
  
  // Uncommon
  { id: 'item-ring', name: 'Silver Ring', rarity: 'Uncommon', image: 'https://i.ibb.co/hxy5rG61/ring.png', imageHint: 'silver diamond ring', value: 100, description: 'A beautiful silver ring.', isUpgradable: true, isTargetable: false },
  { id: 'item-lol-pop-random', name: 'Lol Pop', rarity: 'Uncommon', image: 'https://i.ibb.co/Q7KdJyRN/Lol-pop.png', imageHint: 'swirl lollipop', value: 360, description: 'A colorful lollipop.', isUpgradable: true, isTargetable: false },
  { id: 'item-candy-cane', name: 'Candy Cane', rarity: 'Uncommon', image: 'https://i.ibb.co/ksnfgkCb/Candy-cane.png', imageHint: 'candy cane with bow', value: 300, description: 'A festive candy cane with a bow.', isUpgradable: true, isTargetable: false },
  { id: 'item-desk-calendar', name: 'Desk Calendar', rarity: 'Uncommon', image: 'https://i.ibb.co/xNvnLh4/Desk-Calendar.png', imageHint: 'desk calendar', value: 300, description: 'A fun desk calendar.', isUpgradable: true, isTargetable: false },
  { id: 'item-ginger-cookie', name: 'Ginger Cookie', rarity: 'Uncommon', image: 'https://i.ibb.co/sXXQnrY/spy.png', imageHint: 'gingerbread man', value: 440, description: 'A delicious ginger cookie.', isUpgradable: true, isTargetable: false },

  // Rare
  { id: 'item-party-sparkler', name: 'Party Sparkler', rarity: 'Rare', image: 'https://i.ibb.co/TMwFBvD3/Party-Sparkler.png', imageHint: 'party sparkler', value: 450, description: 'A festive party sparkler.', isUpgradable: true, isTargetable: false },
  { id: 'item-clover-pin', name: 'Clover Pin', rarity: 'Rare', image: 'https://i.ibb.co/pj0V0GXp/Clover-Pin.png', imageHint: 'clover pin', value: 470, description: 'A lucky clover pin.', isUpgradable: true, isTargetable: false },
  { id: 'item-input-key', name: 'Input Key', rarity: 'Rare', image: 'https://i.ibb.co/7tpkt39P/Input-key.png', imageHint: 'input key', value: 500, description: 'A mysterious input key.', isUpgradable: true, isTargetable: false },
  { id: 'item-fresh-socks', name: 'Fresh Socks', rarity: 'Rare', image: 'https://i.ibb.co/yFNNdRN7/Fresh-Socks.png', imageHint: 'fresh socks', value: 550, description: 'A pair of fresh socks.', isUpgradable: true, isTargetable: false },
  { id: 'item-evil-eye', name: 'Evil Eye', rarity: 'Rare', image: 'https://i.ibb.co/BH7RH5sn/Evil-eye.png', imageHint: 'evil eye amulet', value: 800, description: 'A protective evil eye amulet.', isUpgradable: true, isTargetable: false },
  { id: 'item-witch-hat', name: 'Witch Hat', rarity: 'Rare', image: 'https://i.ibb.co/KxtS9HyT/Witch-hat.png', imageHint: 'purple witch hat', value: 380, description: 'A magical witch hat.', isUpgradable: true, isTargetable: false },
  
  // Epic
  { id: 'item-spy-agaric', name: 'Spy Agaric', rarity: 'Epic', image: 'https://i.ibb.co/XZBv49Mw/Spy-agariq.png', imageHint: 'mushroom with hat', value: 700, description: 'A mysterious spy mushroom.', isUpgradable: true, isTargetable: false },
  { id: 'item-jelly-bunny', name: 'Jelly Bunny', rarity: 'Epic', image: 'https://i.ibb.co/kVhkdByX/Jelly-bunny.png', imageHint: 'jelly bunny', value: 800, description: 'A sweet jelly bunny.', isUpgradable: true, isTargetable: false },
  { id: 'item-love-potion', name: 'Love Potion', rarity: 'Epic', image: 'https://i.ibb.co/sJtXLXmz/Love-Potion.png', imageHint: 'love potion', value: 1800, description: 'A mysterious love potion.', isUpgradable: true, isTargetable: true },

  // Legendary
  { id: 'item-tama-gadget', name: 'Tama Gadget', rarity: 'Legendary', image: 'https://i.ibb.co/N629KC3k/tama-gadget.png', imageHint: 'tamagotchi device', value: 600, description: 'A nostalgic tama gadget.', isUpgradable: true, isTargetable: true },
  { id: 'item-sakura-flower', name: 'Sakura Flower', rarity: 'Legendary', image: 'https://i.ibb.co/Dg9V2MvC/Sakura-Flower.png', imageHint: 'sakura flower', value: 1200, description: 'A beautiful sakura flower.', isUpgradable: true, isTargetable: true },
  { id: 'item-cupid-charm', name: 'Cupid Charm', rarity: 'Legendary', image: 'https://i.ibb.co/C3q5PhcK/Diamond-Ring-2.png', imageHint: 'cupid charm', value: 2000, description: 'A charming cupid charm.', isUpgradable: true, isTargetable: true },
  { id: 'item-diamond-ring', name: 'Diamond Ring', rarity: 'Legendary', image: 'https://i.ibb.co/xKYxXh8d/Diamond-Ring-1.png', imageHint: 'diamond ring', value: 4000, description: 'A stunning diamond ring.', isUpgradable: true, isTargetable: true },
  { id: 'item-toy-bear', name: 'Toy Bear', rarity: 'Legendary', image: 'https://i.ibb.co/ccF1j4pZ/Toy-BEar.png', imageHint: 'toy bear', value: 4100, description: 'A cuddly toy bear.', isUpgradable: true, isTargetable: true },

  // NFT
  { id: 'item-nft-helmet-1', name: 'Cyber Helmet', rarity: 'NFT', image: 'https://i.ibb.co/hYDLm1c/cyber-helmet.png', imageHint: 'cyber helmet', value: 10000, description: 'A rare cybernetic helmet. Part of the first collection.', collectionAddress: 'EQD4-1GaaA32cfxI1x5Y1__UsoLPK9p9s3L243d4kS4wryn0', animationUrl: 'https://cdn.pixabay.com/video/2024/05/29/213089_large.mp4', isUpgradable: false, isTargetable: true },
  { id: 'item-nft-sword-1', name: 'Plasma Katana', rarity: 'NFT', image: 'https://i.ibb.co/CbfcCZ2/plasma-katana.png', imageHint: 'plasma katana', value: 15000, description: 'A legendary plasma katana that hums with energy.', collectionAddress: 'EQD4-1GaaA32cfxI1x5Y1__UsoLPK9p9s3L243d4kS4wryn0', isUpgradable: false, isTargetable: true },
  { id: 'item-nft-bot-1', name: 'R-Unit 734', rarity: 'NFT', image: 'https://i.ibb.co/YXRt6T5/r-unit-734.png', imageHint: 'robot unit', value: 12000, description: 'A loyal robot companion, R-Unit 734.', collectionAddress: 'EQD4-1GaaA32cfxI1x5Y1__UsoLPK9p9s3L243d4kS4wryn0', animationUrl: 'https://cdn.pixabay.com/video/2024/02/13/200545-913410692_large.mp4', isUpgradable: false, isTargetable: true },
];

export const MOCK_CASES: Case[] = [
    {
      id: 'case-free-2',
      name: 'FREE BOX',
      price: 0,
      image: 'https://i.ibb.co/jZZBNxLD/free-box.png',
      imageHint: 'red apex case',
      items: [
        { itemId: 'item-stars-25', probability: 0.7 },
        { itemId: 'item-gift', probability: 0.2 },
        { itemId: 'item-champagne', probability: 0.08 },
        { itemId: 'item-cup', probability: 0.02 },
      ],
      freeCooldownSeconds: 86400, // 24 hours
    },
    {
      id: 'case-floor-8',
      name: 'FLOOR CASE',
      price: 249,
      image: 'https://i.ibb.co/twnxRfvP/floor.png',
      imageHint: 'blue apex case',
      items: [
        { itemId: 'item-champagne', probability: 0.25 },
        { itemId: 'item-cup', probability: 0.18 },
        { itemId: 'item-diamond', probability: 0.18 },
        { itemId: 'item-candy-cane', probability: 0.12 },
        { itemId: 'item-desk-calendar', probability: 0.1 },
        { itemId: 'item-witch-hat', probability: 0.08 },
        { itemId: 'item-tama-gadget', probability: 0.05 },
        { itemId: 'item-spy-agaric', probability: 0.03 },
        { itemId: 'item-evil-eye', probability: 0.01 },
      ],
    },
     {
      id: 'case-labubu-10',
      name: 'LABUBU CASE',
      price: 459,
      image: 'https://i.ibb.co/20Fh8RKz/labubu.png',
      imageHint: 'green labubu case',
      items: [
        { itemId: 'item-cup', probability: 0.18 }, // 100
        { itemId: 'item-diamond', probability: 0.18 }, // 100
        { itemId: 'item-desk-calendar', probability: 0.14 }, // 300
        { itemId: 'item-candy-cane', probability: 0.14 }, // 300
        { itemId: 'item-lol-pop-random', probability: 0.10 }, // 360
        { itemId: 'item-ginger-cookie', probability: 0.08 }, // 440
        { itemId: 'item-party-sparkler', probability: 0.05 }, // 450
        { itemId: 'item-clover-pin', probability: 0.04 }, // 470
        { itemId: 'item-input-key', probability: 0.03 }, // 500
        { itemId: 'item-fresh-socks', probability: 0.02 }, // 550
        { itemId: 'item-tama-gadget', probability: 0.015 }, // 600
        { itemId: 'item-jelly-bunny', probability: 0.01 }, // 800
        { itemId: 'item-evil-eye', probability: 0.01 }, // 800
        { itemId: 'item-sakura-flower', probability: 0.002 }, // 1200
        { itemId: 'item-love-potion', probability: 0.001 }, // 1800
        { itemId: 'item-cupid-charm', probability: 0.0009 }, // 2000
        { itemId: 'item-diamond-ring', probability: 0.0006 }, // 4000
        { itemId: 'item-toy-bear', probability: 0.0005 }, // 4100
      ],
    },
    {
      id: 'case-snoop-7',
      name: 'SNOOP DOGG CASE',
      price: 799,
      image: 'https://i.ibb.co/F4V0dGX3/Apex-Case.png',
      imageHint: 'purple snoop dogg case',
      items: [
        { itemId: 'item-diamond', probability: 0.35 },
        { itemId: 'item-desk-calendar', probability: 0.25 },
        { itemId: 'item-candy-cane', probability: 0.20 },
        { itemId: 'item-party-sparkler', probability: 0.10 },
        { itemId: 'item-tama-gadget', probability: 0.05 },
        { itemId: 'item-spy-agaric', probability: 0.02 },
        { itemId: 'item-jelly-bunny', probability: 0.01 },
        { itemId: 'item-evil-eye', probability: 0.008 },
        { itemId: 'item-sakura-flower', probability: 0.006 },
        { itemId: 'item-love-potion', probability: 0.003 },
        { itemId: 'item-cupid-charm', probability: 0.002 },
        { itemId: 'item-diamond-ring', probability: 0.0006 },
        { itemId: 'item-toy-bear', probability: 0.0004 },
      ],
    },
     {
      id: 'case-legendary-1',
      name: 'LEGENDARY CASE',
      price: 4999,
      image: 'https://i.ibb.co/93nbm8ky/a6f998b1-e6a7-4e6a-9b04-29b0fa661313-removebg-preview.png',
      imageHint: 'golden legendary case',
      items: [
        { itemId: 'item-love-potion', probability: 0.3 },
        { itemId: 'item-cupid-charm', probability: 0.25 },
        { itemId: 'item-diamond-ring', probability: 0.2 },
        { itemId: 'item-toy-bear', probability: 0.15 },
        { itemId: 'item-nft-bot-1', probability: 0.05 },
        { itemId: 'item-nft-sword-1', probability: 0.03 },
        { itemId: 'item-nft-helmet-1', probability: 0.02 },
      ],
    },
];

export const MOCK_BATTLES: CaseBattle[] = [];


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

    

    
