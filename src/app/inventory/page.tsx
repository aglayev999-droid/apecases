'use client';

import { useUser } from '@/contexts/UserContext';
import { InventoryCard } from '@/components/InventoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export default function InventoryPage() {
  const { user } = useUser();

  if (!user || user.inventory.length === 0) {
    return <EmptyInventory />;
  }

  const allItems = user.inventory;
  const wonItems = allItems.filter(item => item.status === 'won');
  const exchangedItems = allItems.filter(item => item.status === 'exchanged');
  const shippedItems = allItems.filter(item => item.status === 'shipped');

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-2xl font-bold tracking-tighter">Inventory</h1>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({allItems.length})</TabsTrigger>
          <TabsTrigger value="won">Available ({wonItems.length})</TabsTrigger>
          <TabsTrigger value="exchanged">Exchanged ({exchangedItems.length})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({shippedItems.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <InventoryGrid items={allItems} />
        </TabsContent>
        <TabsContent value="won">
          <InventoryGrid items={wonItems} />
        </TabsContent>
        <TabsContent value="exchanged">
          <InventoryGrid items={exchangedItems} />
        </TabsContent>
        <TabsContent value="shipped">
          <InventoryGrid items={shippedItems} />
        </TabsContent>
      </Tabs>
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
            Send a gift to <span className="text-primary">@nullprime</span>
        </p>
        <div className="mt-8 space-y-4 w-full max-w-sm">
            <button className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>
                Cases
            </button>
            <button className="w-full bg-card text-foreground py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile
            </button>
        </div>
    </div>
);

const InventoryGrid = ({ items }: { items: import('@/lib/types').InventoryItem[] }) => {
  if (items.length === 0) {
    return <div className="text-center text-muted-foreground py-16">No items in this category.</div>
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <InventoryCard key={item.inventoryId} item={item} />
      ))}
    </div>
  )
}

const InventorySkeleton = () => (
  <div className="space-y-8">
    <div className="text-center">
      <Skeleton className="h-10 w-64 mx-auto" />
      <Skeleton className="h-4 w-80 mx-auto mt-4" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="aspect-[3/4]">
          <CardContent className="p-2">
            <Skeleton className="w-full h-full aspect-square" />
            <Skeleton className="h-4 w-3/4 mt-2" />
            <Skeleton className="h-3 w-1/2 mt-1" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);
