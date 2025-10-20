'use server';
import { firestore } from '@/firebase/server'; // Use server-side admin firestore
import type { User, Case, Item } from '@/lib/types';
import { increment, serverTimestamp } from 'firebase-admin/firestore';
import { ALL_ITEMS } from '@/lib/data';


async function selectPrize(caseData: Case): Promise<string> {
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const { itemId, probability } of caseData.items) {
        cumulativeProbability += probability;
        if (rand < cumulativeProbability) {
            return itemId;
        }
    }
    // Fallback in case of rounding errors
    return caseData.items[caseData.items.length - 1].itemId;
}

export async function openCase(input: { caseId: string; userId: string }): Promise<{ prize: Item | null; error: string | null }> {
    const { caseId, userId } = input;

    if (!firestore) {
        console.error("FATAL: Firestore Admin SDK is not initialized on the server.");
        return { prize: null, error: "Server database connection is not available. Please contact support." };
    }

    try {
        const prizeData = await firestore.runTransaction(async (transaction) => {
            const userRef = firestore.doc(`users/${userId}`);
            const caseRef = firestore.doc(`cases/${caseId}`);

            const userDoc = await transaction.get(userRef);
            const caseDoc = await transaction.get(caseRef);

            if (!userDoc.exists) {
                throw new Error('User not found.');
            }
            if (!caseDoc.exists) {
                throw new Error('Case not found.');
            }

            const userData = userDoc.data() as User;
            const caseData = { ...caseDoc.data(), id: caseDoc.id } as Case;
            
            const casePrice = caseData.price || 0;

            // Check balance
            if (userData.balance.stars < casePrice) {
                throw new Error('Not enough stars.');
            }

            // Select prize on server
            const prizeId = await selectPrize(caseData);
            const prizeRef = firestore.doc(`items/${prizeId}`);
            const prizeDoc = await transaction.get(prizeRef);
            
            let prizeData: Item | null = null;
            if (prizeDoc.exists) {
                prizeData = { ...prizeDoc.data(), id: prizeDoc.id } as Item;
            } else {
                // Fallback to mock data if item not in DB
                const mockItem = ALL_ITEMS.find(item => item.id === prizeId);
                if (mockItem) {
                    prizeData = mockItem;
                } else {
                    throw new Error(`Prize item with ID ${prizeId} not found in the database or mock data.`);
                }
            }
            
            const updates: { [key: string]: any } = {
                'balance.stars': increment(-casePrice),
                'weeklySpending': increment(casePrice)
            };

            if (prizeData.id.startsWith('item-stars-')) {
                updates['balance.stars'] = increment(prizeData.value - casePrice);
            }

            transaction.update(userRef, updates);

            if (!prizeData.id.startsWith('item-stars-')) {
                const inventoryRef = userRef.collection('inventory').doc();
                 const inventoryItem = {
                    itemId: prizeData.id,
                    name: prizeData.name,
                    rarity: prizeData.rarity,
                    image: prizeData.image,
                    imageHint: prizeData.imageHint,
                    value: prizeData.value,
                    description: prizeData.description || '',
                    animationUrl: prizeData.animationUrl || '',
                    collectionAddress: prizeData.collectionAddress || '',
                    status: 'won',
                    wonAt: serverTimestamp()
                };
                transaction.set(inventoryRef, inventoryItem);
            }

            return prizeData;
        });
        
        if (!prizeData) {
            return { prize: null, error: 'Could not determine prize after transaction.' };
        }

        return { prize: prizeData, error: null };

    } catch (error: any) {
        console.error("Case opening transaction failed: ", error);
        return { prize: null, error: error.message || 'An unexpected error occurred while opening the case.' };
    }
}
