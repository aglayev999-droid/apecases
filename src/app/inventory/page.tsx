'use client';

import { useUser } from '@/contexts/UserContext';
import { InventoryCard } from '@/components/InventoryCard';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useAlertDialog } from '@/contexts/AlertDialogContext';
import type { InventoryItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2 } from 'lucide-react';
import React from 'react';
import Link from 'next/link';

export default function InventoryPage() {
  const { inventory, removeInventoryItems, updateBalance, isUserLoading } = useUser();
  const { showAlert } = useAlertDialog();

  const nonNftItems = React.useMemo(() => {
    if (!inventory) return [];
    return inventory.filter(item => item.rarity !== 'NFT');
  }, [inventory]);

  const totalSellValue = React.useMemo(() => {
    return nonNftItems.reduce((sum, item) => sum + item.value, 0);
  }, [nonNftItems]);


  const handleSellAll = () => {
    if (nonNftItems.length === 0) {
      showAlert({
        title: 'Nothing to Sell',
        description: 'You do not have any non-NFT items to sell.',
      });
      return;
    }
    
    const itemIdsToSell = nonNftItems.map(item => item.id);
    
    updateBalance(totalSellValue);
    removeInventoryItems(itemIdsToSell);

    showAlert({
      title: 'All Items Sold!',
      description: `You received ${totalSellValue} stars.`,
    });
  };
  
  if (isUserLoading) {
      return (
         <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">Inventory</h1>
                <Skeleton className="h-9 w-40" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <Skeleton className="aspect-square w-full rounded-xl" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                ))}
            </div>
        </div>
      )
  }

  if (!inventory || inventory.length === 0) {
    return <EmptyInventory />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">Inventory</h1>
        <Button variant="destructive" size="sm" onClick={handleSellAll} disabled={nonNftItems.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            Sell All for {totalSellValue}
             <Image src="https://i.ibb.co/WN2md4DV/stars.png" alt="stars" width={16} height={16} className="w-4 h-4 ml-1 object-contain" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {inventory.map((item: InventoryItem) => (
          <InventoryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

const EmptyInventory = () => (
    <div className="flex flex-col items-center justify-center text-center py-16">
        <div className="relative w-40 h-40">
            <Image src="/redeye.png" alt="No Items" width={160} height={160} />
        </div>
        <h2 className="text-2xl font-bold mt-6">No gifts yet!</h2>
        <p className="text-muted-foreground mt-2">
            Open cases to win gifts.
        </p>
        <div className="mt-8 space-y-4 w-full max-w-xs">
           <Link href="/" passHref>
                <Button className="w-full" size="lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box mr-2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>
                    Go to Cases
                </Button>
           </Link>
        </div>
    </div>
);
