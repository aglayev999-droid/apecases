'use server';
/**
 * @fileOverview A flow to retrieve the item catalog.
 *
 * - getItemCatalog - A function that returns the entire item catalog.
 * - ItemCatalog - The output type for the getItemCatalog function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ALL_ITEMS } from '@/lib/data';
import type { Item } from '@/lib/types';

// Define the schema for a single item in the catalog
const ItemSchema = z.object({
  itemId: z.string().describe('The unique ID of the item.'),
  itemName: z.string().describe('The name of the item.'),
  starValue: z.number().describe('The current Star (yulduz) price of the item.'),
  rarity: z.string().describe('The rarity level of the item (e.g., Common, Legendary).'),
  iconUrl: z.string().nullable().describe('URL for a small icon to be shown in roulette.'),
  imageUrl: z-string().describe('URL for the main image (for Inventory, "Congratulations" screen).'),
  backgroundUrl: z.string().nullable().describe('URL for the item\'s background image.'),
  model3dUrl: z.string().nullable().describe('URL for an animated 3D model file (e.g., GLB/GLTF).'),
});

// Define the schema for the entire catalog
const ItemCatalogSchema = z.array(ItemSchema);
export type ItemCatalog = z.infer<typeof ItemCatalogSchema>;

/**
 * Genkit flow to retrieve the item catalog.
 * This flow reads from the static data file.
 */
const getItemCatalogFlow = ai.defineFlow(
  {
    name: 'getItemCatalogFlow',
    inputSchema: z.void(),
    outputSchema: ItemCatalogSchema,
  },
  async () => {
    // Map the data from ALL_ITEMS to the defined schema
    return ALL_ITEMS.map((item: Item) => ({
      itemId: item.id,
      itemName: item.name,
      starValue: item.value,
      rarity: item.rarity,
      iconUrl: item.image, // Using main image as icon for now
      imageUrl: item.image,
      backgroundUrl: null, // Not available in current data
      model3dUrl: item.animationUrl || null, // Use animationUrl if it exists
    }));
  }
);

/**
 * Wrapper function to be called from the API route.
 * @returns A promise that resolves to the item catalog.
 */
export async function getItemCatalog(): Promise<ItemCatalog> {
  return getItemCatalogFlow();
}
