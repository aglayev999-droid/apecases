'use server';
import { z } from 'genkit';
import { runTransaction, doc, getDoc, writeBatch, increment, serverTimestamp, collection } from 'firebase/firestore';
import { firestore } from '@/firebase/server'; // Use server-side firestore
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
    // Fallback
    return caseData.items[0].itemId;
}

export async function openCase(input: { caseId: string; userId: string }): Promise<Item | null> {
    const { caseId, userId } = input;

    if (!firestore) {
        throw new Error("Firestore is not initialized on the server.");
    }

    try {
        const prize = await runTransaction(firestore, async (transaction) => {
            const userRef = doc(firestore, 'users', userId);
            const caseRef = doc(firestore, 'cases', caseId);

            const userDoc = await transaction.get(userRef);
            const caseDoc = await transaction.get(caseRef);

            if (!userDoc.exists()) {
                throw new Error('User not found.');
            }
            if (!caseDoc.exists()) {
                throw new Error('Case not found.');
            }

            const userData = userDoc.data() as User;
            const caseData = caseDoc.data() as Case;

            // Check balance
            if (userData.balance.stars < caseData.price) {
                throw new Error('Not enough stars.');
            }

            // Select prize on server
            const prizeId = await selectPrize(caseData);
            const prizeRef = doc(firestore, 'items', prizeId);
            const prizeDoc = await transaction.get(prizeRef);
            
            if (!prizeDoc.exists()) {
                 throw new Error(`Prize item with ID ${prizeId} not found.`);
            }

            const prizeData = { ...prizeDoc.data(), id: prizeDoc.id } as Item;

            // Perform updates
            transaction.update(userRef, {
                'balance.stars': increment(-caseData.price),
                weeklySpending: increment(caseData.price)
            });

            if (prizeData.id.startsWith('item-stars-')) {
                // If the prize is stars, update balance directly
                transaction.update(userRef, { 'balance.stars': increment(prizeData.value) });
            } else {
                // Otherwise, add to inventory
                const inventoryRef = doc(collection(userRef, 'inventory'));
                transaction.set(inventoryRef, {
                    ...prizeData, // Spread all properties of the prize
                    status: 'won',
                    wonAt: serverTimestamp()
                });
            }

            return prizeData;
        });
        
        return prize;

    } catch (error: any) {
        console.error("Transaction failed: ", error);
        throw new Error(error.message || 'An unexpected error occurred during the transaction.');
    }
}