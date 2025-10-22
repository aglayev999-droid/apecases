import { ALL_ITEMS } from '@/lib/data';
import type { Item } from '@/lib/types';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Directly map from the static data source
    const catalog = ALL_ITEMS.map((item: Item) => ({
      itemId: item.id,
      itemName: item.name,
      starValue: item.value,
      rarity: item.rarity,
      iconUrl: item.image, // Using main image as icon for now
      imageUrl: item.image,
      backgroundUrl: null,
      model3dUrl: item.animationUrl || null,
    }));
    return NextResponse.json(catalog);
  } catch (error) {
    console.error('Error fetching item catalog:', error);
    return NextResponse.json({ error: 'Failed to fetch item catalog' }, { status: 500 });
  }
}
