import type { Item, Case, User, LeaderboardEntry } from './types';

const DEFAULT_AVATAR = 'https://i.ibb.co/M5yHjvyp/23b1daa04911dc4a29803397ce300416.jpg';

// ALL_ITEMS will now be fetched from Firestore, but we can keep it here as a fallback or for reference
export const ALL_ITEMS: Item[] = [
  { id: 'item-gift', name: 'Gift', rarity: 'Common', image: 'https://i.ibb.co/6yV2TfF/Gift-2.png', imageHint: 'red gift box', value: 25, description: 'A small, mysterious gift.' },
  { id: 'item-champagne', name: 'Champagne', rarity: 'Common', image: 'https://i.ibb.co/pnvXf8H/Champagne.png', imageHint: 'champagne bottle', value: 50, description: 'A bottle of celebratory champagne.' },
  { id: 'item-cup', name: 'Cup', rarity: 'Uncommon', image: 'https://i.ibb.co/V9y3dtr/Cup.png', imageHint: 'golden trophy cup', value: 100, description: 'A shiny golden cup.' },
  { id: 'item-diamond', name: 'Diamond', rarity: 'Uncommon', image: 'https://i.ibb.co/18rTz4g/Diamond.png', imageHint: 'blue diamond gem', value: 100, description: 'A sparkling diamond.' },
  { id: 'item-ring', name: 'Ring', rarity: 'Uncommon', image: 'https://i.ibb.co/gDF34V8/Ring.png', imageHint: 'silver diamond ring', value: 100, description: 'A beautiful silver ring.' },
  { id: 'item-desk-calendar-random', name: 'Desk Calendar (Random)', rarity: 'Rare', image: 'https://i.ibb.co/4Z5n50S/Desk-Calendar-Random.png', imageHint: 'desk calendar birthday', value: 318, description: 'A desk calendar with a random date.' },
  { id: 'item-lol-pop-random', name: 'Lol Pop (Random)', rarity: 'Rare', image: 'https://i.ibb.co/YyY2Sbr/Lol-Pop-Random.png', imageHint: 'swirl lollipop', value: 360, description: 'A sweet and colorful lollipop.' },
  { id: 'item-desk-calendar-eco', name: 'Desk Calendar Eco Friendly', rarity: 'Rare', image: 'https://i.ibb.co/tYHh3wW/Desk-Calendar-Eco-Friendly.png', imageHint: 'desk calendar b-day', value: 418, description: 'An eco-friendly desk calendar.' },
  { id: 'item-candy-cane-old-school', name: 'Candy Cane Old School', rarity: 'Rare', image: 'https://i.ibb.co/8mrL6sM/Candy-Cane-Old-School.png', imageHint: 'classic candy cane', value: 470, description: 'A classic old-school candy cane.' },
  { id: 'item-tama-gadget', name: 'Tama Gadget (Random)', rarity: 'Epic', image: 'https://i.ibb.co/ZJp5qM4/Tama-Gadget-Random.png', imageHint: 'tamagotchi virtual pet', value: 480, description: 'A nostalgic virtual pet gadget.' },
  { id: 'item-candy-cane-sticky', name: 'Candy Cane Sticky Sweet', rarity: 'Epic', image: 'https://i.ibb.co/n6zRrmd/Candy-Cane-Sticky-Sweet.png', imageHint: 'spiderweb candy cane', value: 600, description: 'A sticky and sweet candy cane treat.' },
  { id: 'item-lol-pop-glowstick', name: 'Lol Pop Glowstick', rarity: 'Epic', image: 'https://i.ibb.co/rwsdJ20/Lol-Pop-Glowstick.png', imageHint: 'glowing stick lights', value: 678, description: 'A lollipop that glows in the dark.' },
  { id: 'item-desk-calendar-checklist', name: 'Desk Calendar Checklist', rarity: 'Epic', image: 'https://i.ibb.co/Q8n9TJy/Desk-Calendar-Checklist.png', imageHint: 'desk calendar todo', value: 698, description: 'A desk calendar with a to-do list.' },
  { id: 'item-witch-hat', name: 'Witch Hat (Random)', rarity: 'Legendary', image: 'https://i.ibb.co/K2rHZpM/Witch-Hat-Random.png', imageHint: 'purple witch hat', value: 700, description: 'A magical witch hat.' },
  { id: 'item-spy-agaric', name: 'Spy Agaric (Random)', rarity: 'Legendary', image: 'https://i.ibb.co/183xYfS/Spy-Agaric-Random.png', imageHint: 'green mushroom', value: 800, description: 'A mysterious and watchful mushroom.' },
  { id: 'item-evil-eye', name: 'Evil Eye (Random)', rarity: 'Legendary', image: 'https://i.ibb.co/y4Lz3Qk/Evil-Eye-Random.png', imageHint: 'eyeball art', value: 846, description: 'A powerful and protective evil eye charm.' },
  { id: 'item-jack-in-box-rubiks', name: "Jack-in-the-Box Rubik's Cube", rarity: 'NFT', image: 'https://i.ibb.co/xGLS1kP/Jack-in-the-Box-Rubik-s-Cube.png', imageHint: "rubik's cube box", value: 990, description: "A surprising and colorful cube." },
  { id: 'item-candy-cane-hex-pot', name: 'Candy Cane Hex Pot', rarity: 'NFT', image: 'https://i.ibb.co/jGnjx7g/Candy-Cane-Hex-Pot.png', imageHint: 'cauldron potion', value: 1192, description: 'A magical hex pot with a candy cane twist.' },
];

export const MOCK_CASES: Case[] = [
    {
      id: 'case-free-2',
      name: 'FREE BOX',
      price: 0,
      image: 'https://i.ibb.co/jZZBNxLD/free-box.png',
      imageHint: 'red apex case',
      items: [
        { itemId: 'item-gift', probability: 0.9 },
        { itemId: 'item-cup', probability: 0.1 },
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
        { itemId: 'item-gift', probability: 0.35 },
        { itemId: 'item-champagne', probability: 0.25 },
        { itemId: 'item-cup', probability: 0.15 },
        { itemId: 'item-diamond', probability: 0.10 },
        { itemId: 'item-ring', probability: 0.05 },
        { itemId: 'item-desk-calendar-random', probability: 0.04 },
        { itemId: 'item-lol-pop-random', probability: 0.02 },
        { itemId: 'item-desk-calendar-eco', probability: 0.015 },
        { itemId: 'item-candy-cane-old-school', probability: 0.01 },
        { itemId: 'item-tama-gadget', probability: 0.005 },
        { itemId: 'item-candy-cane-sticky', probability: 0.003 },
        { itemId: 'item-lol-pop-glowstick', probability: 0.002 },
        { itemId: 'item-desk-calendar-checklist', probability: 0.0015 },
        { itemId: 'item-witch-hat', probability: 0.001 },
        { itemId: 'item-spy-agaric', probability: 0.0008 },
        { itemId: 'item-evil-eye', probability: 0.0006 },
        { itemId: 'item-jack-in-box-rubiks', probability: 0.0005 },
        { itemId: 'item-candy-cane-hex-pot', probability: 0.0004 },
      ],
    },
     {
      id: 'case-labubu-10',
      name: 'LABUBU CASE',
      price: 240,
      image: 'https://i.ibb.co/20Fh8RKz/labubu.png',
      imageHint: 'green labubu case',
      items: [
        { itemId: 'item-spy-agaric', probability: 0.4 },
        { itemId: 'item-evil-eye', probability: 0.28 },
        { itemId: 'item-nft-10348', probability: 0.02 },
        { itemId: 'item-witch-hat', probability: 0.2 },
        { itemId: 'item-lol-pop-glowstick', probability: 0.1 },
      ],
    },
    {
      id: 'case-snoop-7',
      name: 'SNOOP DOGG CASE',
      price: 180,
      image: 'https://i.ibb.co/F4V0dGX3/Apex-Case.png',
      imageHint: 'purple snoop dogg case',
      items: [
        { itemId: 'item-candy-cane-hex-pot', probability: 0.3 },
        { itemId: 'item-jack-in-box-rubiks', probability: 0.25 },
        { itemId: 'item-evil-eye', probability: 0.2 },
        { itemId: 'item-spy-agaric', probability: 0.15 },
        { itemId: 'item-nft-10348', probability: 0.1 },
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

    