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
    Common: { border: 'border-gray-600/50' },
    Uncommon: { border: 'border-green-600/50' },
    Rare: { border: 'border-blue-600/50' },
    Epic: { border: 'border-purple-600/50' },
    Legendary: { border: 'border-orange-600/50' },
    NFT: { border: 'border-purple-500/50' },
};

const LiveDropItem = ({ item }: { item: Item }) => (
    <Card className={cn("p-1 border-2 bg-card/50 flex-shrink-0 w-[72px] h-[72px] rounded-xl", item.rarity ? RARITY_PROPERTIES[item.rarity].border : '')}>
        <div className="aspect-square relative w-full h-full">
          <Image src={item.image} alt={item.name} fill sizes="10vw" className="object-contain" data-ai-hint={item.imageHint}/>
        </div>
    </Card>
);

const LiveDrops = () => {
    const [allItems, setAllItems] = useState<Item[]>(MOCK_ITEMS);
    const [liveDrops, setLiveDrops] = useState<Item[]>([]);
    const firestore = useFirestore();

    const filteredItems = useMemo(() => {
        return allItems.filter(item => 
            !item.id.startsWith('item-stars-') &&
            (item.rarity === 'Uncommon' || item.rarity === 'Rare' || item.rarity === 'Epic' || item.rarity === 'Legendary')
        );
    }, [allItems]);

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
        if (filteredItems.length === 0) return;

        const generateDrops = (count: number) => Array.from({ length: count }, () => filteredItems[Math.floor(Math.random() * filteredItems.length)]);
        
        // Start with enough items to fill the view and have a buffer
        setLiveDrops(generateDrops(30));

        const interval = setInterval(() => {
            setLiveDrops(prevDrops => {
                const newItem = filteredItems[Math.floor(Math.random() * filteredItems.length)];
                const newDrops = [...prevDrops, newItem];
                 // Keep a reasonable number of items to prevent performance issues
                return newDrops.slice(-50);
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [filteredItems]);

    if (filteredItems.length === 0) {
        return null;
    }
    
    // Duplicate the list for a seamless loop effect
    const displayItems = [...liveDrops, ...liveDrops];

    return (
        <div className="mb-6 flex items-center gap-3">
             <div className="flex flex-col items-center justify-center gap-1.5 self-stretch">
                <span className="text-sm font-bold text-green-400 -rotate-90 whitespace-nowrap tracking-wider">LIVE</span>
                <div className="w-1 h-full bg-green-400/50 rounded-full" />
            </div>

            <div className="relative w-full overflow-hidden mask-gradient">
                <div className="flex gap-3 animate-scroll">
                    {displayItems.map((item, index) => (
                       <LiveDropItem key={`${item.id}-${index}`} item={item} />
                    ))}
                </div>
                 <style jsx>{`
                    .mask-gradient {
                        -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
                        mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
                    }
                    @keyframes scroll {
                        from { transform: translateX(0); }
                        to { transform: translateX(-50%); }
                    }
                    .animate-scroll {
                        display: flex;
                        width: max-content;
                        animation: scroll 40s linear infinite;
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
