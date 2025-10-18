'use client';

import { useUser } from '@/contexts/UserContext';
import { InventoryCard } from '@/components/InventoryCard';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { InventoryItem } from '@/lib/types';

export default function InventoryPage() {
  const { user, removeInventoryItems, updateBalance } = useUser();
  const { toast } = useToast();

  const handleSellAll = () => {
    if (!user) return;
    const nonNftItems = user.inventory.filter(item => item.rarity !== 'NFT');
    if (nonNftItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nothing to Sell',
        description: 'You do not have any non-NFT items to sell.',
      });
      return;
    }
    
    const totalValue = nonNftItems.reduce((sum, item) => sum + item.value, 0);
    const itemIdsToSell = nonNftItems.map(item => item.inventoryId);
    
    updateBalance(totalValue, 0);
    removeInventoryItems(itemIdsToSell);

    toast({
      title: 'All Items Sold!',
      description: `You received ${totalValue} stars.`,
    });
  };

  if (!user || user.inventory.length === 0) {
    return <EmptyInventory />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tighter">Inventory</h1>
        <Button variant="destructive" size="sm" onClick={handleSellAll}>Sell All</Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {user.inventory.map((item: InventoryItem) => (
          <InventoryCard key={item.inventoryId} item={item} />
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
        <div className="mt-8 space-y-4 w-full max-w-sm">
            <button className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>
                Cases
            </button>
        </div>
    </div>
);
