'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CaseCard } from '@/components/CaseCard';
import type { Case, Item } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { MOCK_CASES, ALL_ITEMS as MOCK_ITEMS } from '@/lib/data';
import { Gift } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';


const RARITY_PROPERTIES = {
    Common: { border: 'border-gray-500/50' },
    Uncommon: { border: 'border-green-500/50' },
    Rare: { border: 'border-blue-500/50' },
    Epic: { border: 'border-purple-500/50' },
    Legendary: { border: 'border-orange-500/50' },
    NFT: { border: 'border-purple-400/50' },
};

const LiveDropItem = ({ item }: { item: Item }) => (
    <Card className={cn("p-1.5 border-2 bg-card/50 flex-shrink-0 w-24", RARITY_PROPERTIES[item.rarity].border)}>
        <div className="aspect-square relative">
          <Image src={item.image} alt={item.name} fill sizes="10vw" className="object-contain" data-ai-hint={item.imageHint}/>
        </div>
        <p className="text-xs font-bold truncate mt-1 text-center">{item.name}</p>
    </Card>
);

const LiveDrops = () => {
    const [allItems, setAllItems] = useState<Item[]>(MOCK_ITEMS);
    const [liveDrops, setLiveDrops] = useState<Item[]>([]);
    const firestore = useFirestore();

    useEffect(() => {
        const fetchItems = async () => {
            if (firestore) {
                const itemsColRef = collection(firestore, 'items');
                const itemsSnapshot = await getDocs(itemsColRef);
                if (!itemsSnapshot.empty) {
                    const itemsList = itemsSnapshot.docs.map(d => ({ ...d.data(), id: d.id } as Item));
                    setAllItems(itemsList);
                }
            }
        };
        fetchItems();
    }, [firestore]);
    
    useEffect(() => {
        if (allItems.length === 0) return;

        const initialDrops = Array.from({ length: 10 }, () => allItems[Math.floor(Math.random() * allItems.length)]);
        setLiveDrops(initialDrops);

        const interval = setInterval(() => {
            setLiveDrops(prevDrops => {
                const newItem = allItems[Math.floor(Math.random() * allItems.length)];
                const newDrops = [newItem, ...prevDrops];
                if (newDrops.length > 15) {
                    newDrops.pop();
                }
                return newDrops;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [allItems]);

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
                <Gift className="text-yellow-400 h-6 w-6"/>
                <h2 className="text-lg font-bold text-yellow-400 uppercase tracking-wider">LIVE DROPS</h2>
            </div>
            <div className="relative">
                <div className="absolute left-0 top-0 h-full w-8 z-10 bg-gradient-to-r from-background to-transparent" />
                <div className="absolute right-0 top-0 h-full w-8 z-10 bg-gradient-to-l from-background to-transparent" />
                <div className="flex w-full overflow-hidden">
                    <div className="flex gap-4 animate-scroll">
                        {liveDrops.map((item, index) => (
                           <LiveDropItem key={`${item.id}-${index}`} item={item} />
                        ))}
                    </div>
                </div>
                 <style jsx>{`
                    @keyframes scroll {
                        from { transform: translateX(0); }
                        to { transform: translateX(-100%); }
                    }
                    .animate-scroll {
                        /* This is a placeholder; a proper seamless scroll is more complex */
                        /* For now, we'll rely on items being added/removed */
                    }
                `}</style>
            </div>
        </div>
    );
};


export default function Home() {
  const router = useRouter();
  const firestore = useFirestore();
  
  const casesCollectionRef = useMemoFirebase(() => 
    firestore ? collection(firestore, 'cases') : null
  , [firestore]);

  const { data: cases, isLoading } = useCollection<Case>(casesCollectionRef);

  const handleCaseSelect = (caseData: Case) => {
    router.push(`/case/${caseData.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
           <Skeleton className="h-8 w-48 mb-3" />
           <div className="flex gap-4">
            {[...Array(5)].map((_,i) => <Skeleton key={i} className="w-24 h-32" />)}
           </div>
        </div>
        <h1 className="text-2xl font-bold mb-4">APEX Cases</h1>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
             <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-8 w-full" />
             </div>
          ))}
        </div>
      </div>
    )
  }

  const displayCases = cases && cases.length > 0 ? cases : MOCK_CASES;

  return (
    <div className="space-y-8">
       <LiveDrops />
       <h1 className="text-2xl font-bold mb-4">APEX Cases</h1>
      <div className="grid grid-cols-2 gap-4">
        {displayCases.map((caseData) => (
          <CaseCard key={caseData.id} caseData={caseData} onOpen={() => handleCaseSelect(caseData)} />
        ))}
      </div>
    </div>
  );
}
