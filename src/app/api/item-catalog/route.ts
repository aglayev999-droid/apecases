import { getItemCatalog } from '@/ai/flows/item-catalog';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const catalog = await getItemCatalog();
    return NextResponse.json(catalog);
  } catch (error) {
    console.error('Error fetching item catalog:', error);
    return NextResponse.json({ error: 'Failed to fetch item catalog' }, { status: 500 });
  }
}
