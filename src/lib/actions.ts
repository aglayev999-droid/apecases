'use server';

import { generateItemDescription, type GenerateItemDescriptionInput } from '@/ai/flows/generate-item-descriptions';
import { z } from 'zod';

const schema = z.object({
  itemName: z.string().min(1, 'Item name is required.'),
  itemType: z.string().min(1, 'Item type is required.'),
  itemRarity: z.string().min(1, 'Item rarity is required.'),
  itemTheme: z.string().min(1, 'Game theme is required.'),
});

type State = {
  description: string;
  error: string | null;
}

export async function generateItemDescriptionAction(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = schema.safeParse({
    itemName: formData.get('itemName'),
    itemType: formData.get('itemType'),
    itemRarity: formData.get('itemRarity'),
    itemTheme: formData.get('itemTheme'),
  });

  if (!validatedFields.success) {
    return {
      description: '',
      error: validatedFields.error.flatten().fieldErrors.itemName?.[0] || 'Invalid input.',
    };
  }

  try {
    const result = await generateItemDescription(validatedFields.data as GenerateItemDescriptionInput);
    if (!result.description) {
      return {
        description: '',
        error: 'AI failed to generate a description. Please try again.',
      };
    }
    return {
      description: result.description,
      error: null,
    };
  } catch (e) {
    console.error(e);
    return {
      description: '',
      error: 'An unexpected error occurred. Please try again later.',
    };
  }
}
