'use server';

/**
 * @fileOverview AI-powered item description generator for new in-game items.
 *
 * - generateItemDescription - A function that generates engaging descriptions for new in-game items.
 * - GenerateItemDescriptionInput - The input type for the generateItemDescription function.
 * - GenerateItemDescriptionOutput - The return type for the generateItemDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateItemDescriptionInputSchema = z.object({
  itemName: z.string().describe('The name of the in-game item.'),
  itemType: z.string().describe('The type of the item (e.g., weapon, armor, cosmetic).'),
  itemRarity: z.string().describe('The rarity of the item (e.g., common, uncommon, rare, epic, legendary).'),
  itemTheme: z.string().describe('The overall theme of the game (e.g., cyberpunk, fantasy, medieval).'),
});

export type GenerateItemDescriptionInput = z.infer<typeof GenerateItemDescriptionInputSchema>;

const GenerateItemDescriptionOutputSchema = z.object({
  description: z.string().describe('A captivating and thematic description of the in-game item.'),
});

export type GenerateItemDescriptionOutput = z.infer<typeof GenerateItemDescriptionOutputSchema>;

export async function generateItemDescription(input: GenerateItemDescriptionInput): Promise<GenerateItemDescriptionOutput> {
  return generateItemDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateItemDescriptionPrompt',
  input: {schema: GenerateItemDescriptionInputSchema},
  output: {schema: GenerateItemDescriptionOutputSchema},
  prompt: `You are a creative writer specializing in generating engaging descriptions for in-game items. Your descriptions should be thematic, captivating, and appropriate for the game's overall theme.

  Item Name: {{{itemName}}}
  Item Type: {{{itemType}}}
  Item Rarity: {{{itemRarity}}}
  Game Theme: {{{itemTheme}}}

  Generate a short description for the item. The description should be no more than 100 words.`,
});

const generateItemDescriptionFlow = ai.defineFlow(
  {
    name: 'generateItemDescriptionFlow',
    inputSchema: GenerateItemDescriptionInputSchema,
    outputSchema: GenerateItemDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
