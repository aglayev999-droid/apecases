
import { Item, Case, User, LeaderboardEntry, CaseBattle } from './types';
import { Timestamp } from 'firebase/firestore';


const DEFAULT_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

// ALL_ITEMS will now be fetched from Firestore, but we can keep it here as a fallback or for reference
export const ALL_ITEMS: Item[] = [
  // Stars (not real items, just for winning currency)
  { id: 'item-stars-25', name: '25 Stars', rarity: 'Common', image: 'https://i.ibb.co/WN2md4DV/stars.png', imageHint: 'gold stars', value: 25, description: 'A handful of shiny stars.' },
  { id: 'item-stars-50', name: '50 Stars', rarity: 'Common', image: 'https://i.ibb.co/WN2md4DV/stars.png', imageHint: 'gold stars', value: 50, description: 'A small pouch of stars.' },
  { id: 'item-stars-100', name: '100 Stars', rarity: 'Uncommon', image: 'https://i.ibb.co/WN2md4DV/stars.png', imageHint: 'gold stars', value: 100, description: 'A bag of stars.' },

  // Common
  { id: 'item-gift', name: 'Gift', rarity: 'Common', image: 'https://i.ibb.co/WvnMSb5J/000-1.png', imageHint: 'red gift box', value: 25, description: 'A small, mysterious gift.' },
  { id: 'item-champagne', name: 'Champagne', rarity: 'Common', image: 'https://i.ibb.co/m54YJrg8/shampain.png', imageHint: 'champagne bottle', value: 50, description: 'A bottle of celebratory champagne.' },
  { id: 'item-cup', name: 'Cup', rarity: 'Common', image: 'https://i.ibb.co/gFL7K15Z/kubok.png', imageHint: 'golden trophy cup', value: 100, description: 'A shiny golden cup.' },
  { id: 'item-diamond', name: 'Diamond', rarity: 'Common', image: 'https://i.ibb.co/RGtr2rCb/diamond.png', imageHint: 'blue diamond gem', value: 100, description: 'A sparkling diamond.' },
  
  // Uncommon
  { id: 'item-ring', name: 'Ring', rarity: 'Uncommon', image: 'https://i.ibb.co/hxy5rG61/ring.png', imageHint: 'silver diamond ring', value: 100, description: 'A beautiful silver ring.' },
  { id: 'item-lol-pop-random', name: 'Lol Pop (Random)', rarity: 'Uncommon', image: 'https://i.ibb.co/8gfrrt0R/download-removebg-preview-1.png', imageHint: 'swirl lollipop', value: 360, description: 'A colorful lollipop.' },
  { id: 'item-candy-cane-random', name: 'Candy Cane', rarity: 'Uncommon', image: 'https://i.ibb.co/ksnfgkCb/Candy-cane.png', imageHint: 'candy cane with bow', value: 380, description: 'A festive candy cane with a bow.' },
  { id: 'item-desk-calendar-random', name: 'Desk Calendar', rarity: 'Uncommon', image: 'https://i.ibb.co/xNvnLh4/Desk-Calendar.png', imageHint: 'desk calendar', value: 426, description: 'A fun desk calendar.', animationUrl: 'https://player.vimeo.com/video/1128782666?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&loop=1' },
  
  // Rare
  { id: 'item-evil-eye', name: 'Evil Eye', rarity: 'Rare', image: 'https://i.ibb.co/BH7RH5sn/Evil-eye.png', imageHint: 'evil eye amulet', value: 550, description: 'A protective evil eye amulet.' },
  { id: 'item-witch-hat-random', name: 'Witch Hat', rarity: 'Rare', image: 'https://i.ibb.co/KxtS9HyT/Witch-hat.png', imageHint: 'purple witch hat', value: 716, description: 'A magical witch hat.' },
  { id: 'item-clover-pin-random', name: 'Clover Pin (Random)', rarity: 'Rare', image: 'https://placehold.co/100x100/333/FFF?text=?', imageHint: 'clover pin', value: 650, description: 'A lucky clover pin.' },

  // Epic
  { id: 'item-spy-agaric', name: 'Spy Agaric', rarity: 'Epic', image: 'https://i.ibb.co/XZBv49Mw/Spy-agariq.png', imageHint: 'mushroom with hat', value: 1100, description: 'A mysterious spy mushroom.' },

  // Legendary
  { id: 'item-tama-gadget', name: 'Tama Gadget', rarity: 'Legendary', image: 'https://i.ibb.co/N629KC3k/tama-gadget.png', imageHint: 'tamagotchi device', value: 1200, description: 'A nostalgic tama gadget.' },
  { id: 'item-fresh-socks-random', name: 'Fresh socks (Random)', rarity: 'Legendary', image: 'https://placehold.co/100x100/333/FFF?text=?', imageHint: 'fresh socks', value: 250, description: 'A pair of fresh socks.' },
  { id: 'item-hex-pot-random', name: 'Hex pot (Random)', rarity: 'Legendary', image: 'https://placehold.co/100x100/333/FFF?text=?', imageHint: 'hex pot', value: 1150, description: 'A mysterious hex pot.' },
  { id: 'item-input-key-random', name: 'input key (Random)', rarity: 'Legendary', image: 'https://placehold.co/100x100/333/FFF?text=?', imageHint: 'input key', value: 1500, description: 'A mysterious input key.' },
  { id: 'item-sakura-flower-random', name: 'Sakura Flower (Random)', rarity: 'Legendary', image: 'https://placehold.co/100x100/333/FFF?text=?', imageHint: 'sakura flower', value: 1140, description: 'A beautiful sakura flower.' },
  { id: 'item-jack-in-the-box-minifigure', name: 'Jack-in-the-Box Minifigure', rarity: 'Epic', image: 'https://i.ibb.co/8gfrrt0R/download-removebg-preview-1.png', imageHint: 'lego jack in the box', value: 734, description: 'A minifigure jack-in-the-box.' },
  { id: 'item-easter-egg-eggburger', name: 'Easter Egg Eggburger', rarity: 'Epic', image: 'https://i.ibb.co/WvnMSb5J/000-1.png', imageHint: 'burger easter egg', value: 774, description: 'A surprising egg burger.' },
  { id: 'item-jelly-bunny-quiksilver', name: 'Jelly Bunny Quiksilver', rarity: 'Epic', image: 'https://i.ibb.co/m54YJrg8/shampain.png', imageHint: 'silver jelly bunny', value: 800, description: 'A quicksilver jelly bunny.' },
  { id: 'item-desk-calendar-dead-line', name: 'Desk Calendar Dead Line', rarity: 'Epic', image: 'https://i.ibb.co/chQrQb4J/desk.png', imageHint: 'deadline calendar', value: 868, description: 'A deadline-themed desk calendar.', animationUrl: 'https://player.vimeo.com/video/1128782666?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&loop=1' },
  { id: 'item-jack-in-the-box-spaceship', name: 'Jack-in-the-Box Spaceship', rarity: 'Epic', image: 'https://i.ibb.co/RGtr2rCb/diamond.png', imageHint: 'space jack in the box', value: 900, description: 'A spaceship jack-in-the-box.' },
  { id: 'item-candy-cane-grinch', name: 'Candy Cane Grinch', rarity: 'Epic', image: 'https://i.ibb.co/hxy5rG61/ring.png', imageHint: 'grinch candy cane', value: 998, description: 'A Grinch-themed candy cane.' },
  { id: 'item-ginger-cookie-white-gold', name: 'Ginger Cookie White Gold', rarity: 'Legendary', image: 'https://i.ibb.co/sXXQnrY/spy.png', imageHint: 'gingerbread man', value: 1122, description: 'A white gold ginger cookie.' },
  { id: 'item-candy-cane-hex-pot', name: 'Candy Cane Hex Pot', rarity: 'Legendary', image: 'https://i.ibb.co/bRrhpVKL/9ac8f934df67fea7-removebg-preview.png', imageHint: 'cauldron with candy', value: 1192, description: 'A hex pot full of candy canes.' },
  { id: 'item-spy-agaric-robocap', name: 'Spy Agaric RoboCap', rarity: 'Legendary', image: 'https://i.ibb.co/nMHVqgnM/witch.png', imageHint: 'robot mushroom', value: 1238, description: 'A robotic spy agaric.' },
  { id: 'item-sakura-flower-crimsonia', name: 'Sakura Flower Crimsonia', rarity: 'Legendary', image: 'https://i.ibb.co/chQrQb4J/desk.png', imageHint: 'red sakura flower', value: 1240, description: 'A crimson sakura flower.' },
  { id: 'item-lol-pop-mortal-sin', name: 'Lol Pop Mortal Sin', rarity: 'Legendary', image: 'https://i.ibb.co/8gfrrt0R/download-removebg-preview-1.png', imageHint: 'red black lollipop', value: 1344, description: 'A mortal sin lollipop.' },
  { id: 'item-jack-in-the-box-random', name: 'Jack-in-the-Box (Random)', rarity: 'Rare', image: 'https://i.ibb.co/yvsRNdc/evil.png', imageHint: 'jack in the box', value: 576, description: 'A surprising jack-in-the-box.' },
  { id: 'item-candy-cane-sticky-sweet', name: 'Candy Cane Sticky Sweet', rarity: 'Rare', image: 'https://i.ibb.co/bRrhpVKL/9ac8f934df67fea7-removebg-preview.png', imageHint: 'green sticky candy cane', value: 594, description: 'A sticky and sweet candy cane.' },
  { id: 'item-lol-pop-celestia', name: 'Lol Pop Celestia', rarity: 'Rare', image: 'https://i.ibb.co/Xf6HPpYc/tama.png', imageHint: 'purple lollipop', value: 730, description: 'A celestial lollipop.' },
  { id: 'item-candy-cane-old-school', name: 'Candy Cane Old School', rarity: 'Uncommon', image: 'https://i.ibb.co/sXXQnrY/spy.png', imageHint: 'black and white candy cane', value: 454, description: 'A classic black and white candy cane.' },
  
  // NFT
  { id: 'item-nft-helmet-1', name: 'Cyber Helmet', rarity: 'NFT', image: 'https://i.ibb.co/hYDLm1c/cyber-helmet.png', imageHint: 'cyber helmet', value: 10000, description: 'A rare cybernetic helmet. Part of the first collection.', collectionAddress: 'EQD4-1GaaA32cfxI1x5Y1__UsoLPK9p9s3L243d4kS4wryn0', animationUrl: 'https://cdn.pixabay.com/video/2024/05/29/213089_large.mp4' },
  { id: 'item-nft-sword-1', name: 'Plasma Katana', rarity: 'NFT', image: 'https://i.ibb.co/CbfcCZ2/plasma-katana.png', imageHint: 'plasma katana', value: 15000, description: 'A legendary plasma katana that hums with energy.', collectionAddress: 'EQD4-1GaaA32cfxI1x5Y1__UsoLPK9p9s3L243d4kS4wryn0' },
  { id: 'item-nft-bot-1', name: 'R-Unit 734', rarity: 'NFT', image: 'https://i.ibb.co/YXRt6T5/r-unit-734.png', imageHint: 'robot unit', value: 12000, description: 'A loyal robot companion, R-Unit 734.', collectionAddress: 'EQD4-1GaaA32cfxI1x5Y1__UsoLPK9p9s3L243d4kS4wryn0', animationUrl: 'https://cdn.pixabay.com/video/2024/02/13/200545-913410692_large.mp4' },
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
        { itemId: 'item-desk-calendar-random', probability: 0.25 },
        { itemId: 'item-candy-cane-random', probability: 0.15 },
        { itemId: 'item-ring', probability: 0.15 },
        { itemId: 'item-cup', probability: 0.1 },
        { itemId: 'item-diamond', probability: 0.1 },
        { itemId: 'item-evil-eye', probability: 0.1 },
        { itemId: 'item-witch-hat-random', probability: 0.07 },
        { itemId: 'item-spy-agaric', probability: 0.05 },
        { itemId: 'item-tama-gadget', probability: 0.02 },
        { itemId: 'item-nft-helmet-1', probability: 0.01 },
      ],
    },
     {
      id: 'case-labubu-10',
      name: 'LABUBU CASE',
      price: 459,
      image: 'https://i.ibb.co/20Fh8RKz/labubu.png',
      imageHint: 'green labubu case',
      items: [
        { itemId: 'item-diamond', probability: 0.25 },
        { itemId: 'item-cup', probability: 0.20 },
        { itemId: 'item-lol-pop-random', probability: 0.15 },
        { itemId: 'item-candy-cane-random', probability: 0.12 },
        { itemId: 'item-desk-calendar-random', probability: 0.10 },
        { itemId: 'item-fresh-socks-random', probability: 0.08 },
        { itemId: 'item-clover-pin-random', probability: 0.05 },
        { itemId: 'item-hex-pot-random', probability: 0.03 },
        { itemId: 'item-sakura-flower-random', probability: 0.015 },
        { itemId: 'item-input-key-random', probability: 0.005 },
      ],
    },
    {
      id: 'case-snoop-7',
      name: 'SNOOP DOGG CASE',
      price: 799,
      image: 'https://i.ibb.co/F4V0dGX3/Apex-Case.png',
      imageHint: 'purple snoop dogg case',
      items: [
        { itemId: 'item-candy-cane-grinch', probability: 0.3 },
        { itemId: 'item-ginger-cookie-white-gold', probability: 0.2 },
        { itemId: 'item-sakura-flower-random', probability: 0.15 },
        { itemId: 'item-candy-cane-hex-pot', probability: 0.1 },
        { itemId: 'item-tama-gadget', probability: 0.1 },
        { itemId: 'item-spy-agaric-robocap', probability: 0.08 },
        { itemId: 'item-sakura-flower-crimsonia', probability: 0.05 },
        { itemId: 'item-lol-pop-mortal-sin', probability: 0.015 },
        { itemId: 'item-nft-helmet-1', probability: 0.005 },
      ],
    },
     {
      id: 'case-legendary-1',
      name: 'LEGENDARY CASE',
      price: 4999,
      image: 'https://i.ibb.co/93nbm8ky/a6f998b1-e6a7-4e6a-9b04-29b0fa661313-removebg-preview.png',
      imageHint: 'golden legendary case',
      items: [
        { itemId: 'item-lol-pop-mortal-sin', probability: 0.4 },
        { itemId: 'item-spy-agaric-robocap', probability: 0.25 },
        { itemId: 'item-sakura-flower-crimsonia', probability: 0.15 },
        { itemId: 'item-nft-bot-1', probability: 0.1 },
        { itemId: 'item-nft-sword-1', probability: 0.08 },
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
