
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

export function InventoryCard({ item }: InventoryCardProps) {
  const { showAlert } = useAlertDialog();
  const { removeInventoryItem, updateBalance } = useUser();
  const wallet = useTonWallet();
  const firestore = useFirestore();

  const handleSell = () => {
    updateBalance(item.value);
    removeInventoryItem(item.id);
    showAlert({
      title: 'Item Sold!',
      description: `You sold ${item.name} for ${item.value} stars.`,
    });
  };

  const handleWithdraw = async () => {
    if (!wallet) {
      showAlert({
        title: 'Wallet Not Connected',
        description: 'Please connect your TON wallet to withdraw an item.',
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
    if (!item.collectionAddress) {
       showAlert({
        title: 'Withdrawal Error',
        description: `This item (${item.name}) does not have a collection address configured and cannot be withdrawn.`,
      });
      return;
    }

    try {
      const queueRef = collection(firestore, 'withdrawal_queue');
      await addDoc(queueRef, {
        user_wallet_address: wallet.account.address,
        nft_id: item.id,
        nft_contract_address: item.collectionAddress,
        status: 'pending',
        timestamp: serverTimestamp(),
      });

      removeInventoryItem(item.id);

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

  const hasAnimation = !!item.animationUrl;
  const isIframe = hasAnimation && (item.animationUrl?.includes('vimeo') || item.animationUrl?.includes('youtube'));

  return (
    <Card className={cn(
        "flex flex-col group overflow-hidden border-2 bg-card"
    )}>
      <CardHeader className="p-2 relative aspect-square">
        {hasAnimation ? (
          isIframe ? (
            <iframe
              src={item.animationUrl}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              className="w-full h-full rounded-md"
              title={item.name}
            />
          ) : (
             <div className="w-full h-full">
               <video 
                  src={item.animationUrl}
                  className="w-full h-full object-cover rounded-md"
                  autoPlay
                  loop
                  muted
                  playsInline
                  title={item.name}
                />
             </div>
          )
        ) : (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-contain p-2 group-hover:scale-105 transition-transform"
            data-ai-hint={item.imageHint}
          />
        )}
      </CardHeader>
      <CardContent className="p-2 pt-0 text-left flex-grow">
        <p className="text-sm font-semibold truncate">{item.name}</p>
        <p className={cn("text-xs font-bold")}>{item.rarity}</p>
      </CardContent>
      <CardFooter className="p-2 flex flex-col gap-2">
         <div className="w-full grid grid-cols-2 gap-2">
            <Button variant="destructive" size="sm" onClick={handleSell}>
                Sell for {item.value}
                <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={16} height={16} className="w-4 h-4 ml-1 object-contain" />
            </Button>
            <Button variant="default" size="sm" onClick={handleWithdraw}>
                Withdraw
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
