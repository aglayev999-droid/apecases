'use client';

import { useUser } from '@/contexts/UserContext';
import { InventoryCard } from '@/components/InventoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InventoryPage() {
  const { user } = useUser();

  if (!user) {
    return <InventorySkeleton />;
  }

  const allItems = user.inventory;
  const wonItems = allItems.filter(item => item.status === 'won');
  const exchangedItems = allItems.filter(item => item.status === 'exchanged');
  const shippedItems = allItems.filter(item => item.status === 'shipped');

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter">Your Inventory</h1>
        <p className="text-muted-foreground mt-2">Manage your collection of won items.</p>
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
