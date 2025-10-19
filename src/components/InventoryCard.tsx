'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { InventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useAlertDialog } from '@/contexts/AlertDialogContext';
import { useUser } from '@/contexts/UserContext';
import { useTonWallet } from '@tonconnect/ui-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface InventoryCardProps {
  item: InventoryItem;
}

const RARITY_PROPERTIES = {
  Common: { border: 'border-gray-600/50', text: 'text-gray-400' },
  Uncommon: { border: 'border-green-600/50', text: 'text-green-400' },
  Rare: { border: 'border-blue-600/50', text: 'text-blue-400' },
  Epic: { border: 'border-purple-600/50', text: 'text-purple-400' },
  Legendary: { border: 'border-orange-600/50', text: 'text-orange-400' },
  NFT: { border: 'border-purple-500/60', text: 'text-purple-400' },
};

export function InventoryCard({ item }: InventoryCardProps) {
  const { showAlert } = useAlertDialog();
  const { removeInventoryItem, updateBalance } = useUser();
  const wallet = useTonWallet();
  const firestore = useFirestore();

  const handleSell = () => {
    updateBalance(item.value, 0);
    removeInventoryItem(item.inventoryId);
    showAlert({
      title: 'Item Sold!',
      description: `You sold ${item.name} for ${item.value} stars.`,
    });
  };

  const handleWithdraw = async () => {
    if (!wallet) {
      showAlert({
        title: 'Wallet Not Connected',
        description: 'Please connect your TON wallet to withdraw an NFT.',
      });
      return;
    }
    if (!firestore) {
        showAlert({
          title: 'Error',
          description: 'Could not connect to the database. Please try again later.',
        });
        return;
    }

    try {
      const queueRef = collection(firestore, 'withdrawal_queue');
      await addDoc(queueRef, {
        user_wallet_address: wallet.account.address,
        nft_id: item.id, // Assuming item.id is the Token ID
        nft_contract_address: 'YOUR_NFT_CONTRACT_ADDRESS_HERE', // IMPORTANT: Replace with actual contract address
        status: 'pending',
        timestamp: serverTimestamp(),
      });

      // Optimistically remove from inventory, or wait for backend confirmation
      // For now, we remove it immediately.
      removeInventoryItem(item.inventoryId);

      showAlert({
        title: 'Withdrawal Request Sent',
        description: `${item.name} is being processed. It will be sent to your wallet shortly.`,
      });
    } catch (error) {
      console.error("Error sending withdrawal request:", error);
      showAlert({
        title: 'Withdrawal Failed',
        description: 'There was a problem sending your request. Please try again.',
      });
    }
  };

  const isNft = item.rarity === 'NFT';

  return (
    <Card className={cn(
        "flex flex-col group overflow-hidden border-2 bg-card", 
        RARITY_PROPERTIES[item.rarity].border
    )}>
      <CardHeader className="p-2 relative aspect-square">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="object-contain p-2 group-hover:scale-105 transition-transform"
          data-ai-hint={item.imageHint}
        />
      </CardHeader>
      <CardContent className="p-2 pt-0 text-left flex-grow">
        <p className="text-sm font-semibold truncate">{item.name}</p>
        {isNft ? (
            <p className="text-xs text-muted-foreground truncate">ID: {item.inventoryId}</p>
        ) : (
            <p className={cn("text-xs font-bold", RARITY_PROPERTIES[item.rarity].text)}>{item.rarity}</p>
        )}
      </CardContent>
      <CardFooter className="p-2 flex flex-col gap-2">
        {isNft ? (
            <div className="w-full grid grid-cols-2 gap-2">
                <Button variant="destructive" size="sm" onClick={handleSell}>
                    Sell
                </Button>
                <Button variant="default" size="sm" onClick={handleWithdraw}>
                    Withdraw
                </Button>
            </div>
        ) : (
          <Button variant="secondary" size="sm" className="w-full" onClick={handleSell}>
            Sell for {item.value} 
            <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={16} height={16} className="w-4 h-4 ml-1 object-contain" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
