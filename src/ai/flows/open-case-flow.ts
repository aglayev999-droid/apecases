'use server';
import { runTransaction, doc, getDoc, increment, collection, serverTimestamp } from 'firebase-admin/firestore';
import { firestore } from '@/firebase/server'; // Use server-side admin firestore
import type { User, Case, Item } from '@/lib/types';


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
            const caseData = caseDoc.data() as Case;
            
            const casePrice = caseData.price || 0;

            // Check balance
            if (userData.balance.stars < casePrice) {
                throw new Error('Not enough stars.');
            }

            // Select prize on server
            const prizeId = await selectPrize(caseData);
            const prizeRef = firestore.doc(`items/${prizeId}`);
            const prizeDoc = await transaction.get(prizeRef); // get prize within the transaction
            
            if (!prizeDoc.exists) {
                 throw new Error(`Prize item with ID ${prizeId} not found in the database.`);
            }

            const prizeData = { ...prizeDoc.data(), id: prizeDoc.id } as Item;

            // Perform updates
            transaction.update(userRef, {
                'balance.stars': increment(-casePrice),
                weeklySpending: increment(casePrice)
            });

            if (prizeData.id.startsWith('item-stars-')) {
                // If the prize is stars, update balance directly
                transaction.update(userRef, { 'balance.stars': increment(prizeData.value) });
            } else {
                // Otherwise, add to inventory
                const inventoryRef = userRef.collection('inventory').doc();
                // We only store a reference or key data, not the full item object in inventory
                 const inventoryItem = {
                    itemId: prizeData.id,
                    name: prizeData.name,
                    rarity: prizeData.rarity,
                    image: prizeData.image,
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
        
        return { prize: prizeData, error: null };

    } catch (error: any) {
        console.error("Case opening transaction failed: ", error);
        return { prize: null, error: error.message || 'An unexpected error occurred while opening the case.' };
    }
}
