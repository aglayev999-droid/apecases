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
import { useTranslation } from '@/contexts/LanguageContext';


const LiveDropItem = ({ item }: { item: Item }) => (
    <Card className={cn("p-1 border-0 bg-card/80 flex-shrink-0 w-[72px] h-[72px] rounded-xl")}>
        <div className="aspect-square relative w-full h-full">
          <Image src={item.image} alt={item.name} fill sizes="10vw" className="object-contain p-1" data-ai-hint={item.imageHint}/>
        </div>
    </Card>
);

const LiveDrops = () => {
    const [allItems, setAllItems] = useState<Item[]>(MOCK_ITEMS);
    const [liveDrops, setLiveDrops] = useState<Item[]>([]);
    const [liveCounter, setLiveCounter] = useState(0);
    const firestore = useFirestore();
    const { t } = useTranslation();

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
        const generateRandomCount = () => Math.floor(Math.random() * (100 - 20 + 1)) + 20;
        setLiveCounter(generateRandomCount());

        const countInterval = setInterval(() => {
            setLiveCounter(generateRandomCount());
        }, 3000); // Update every 3 seconds

        return () => clearInterval(countInterval);
    }, []);

    useEffect(() => {
        if (filteredItems.length === 0) return;

        const generateDrops = (count: number) => Array.from({ length: count }, () => filteredItems[Math.floor(Math.random() * filteredItems.length)]);
        
        setLiveDrops(generateDrops(30));

        const interval = setInterval(() => {
            setLiveDrops(prevDrops => {
                const newItem = filteredItems[Math.floor(Math.random() * filteredItems.length)];
                const newDrops = [...prevDrops, newItem];
                return newDrops.slice(-50);
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [filteredItems]);

    if (filteredItems.length === 0) {
        return null;
    }
    
    const displayItems = [...liveDrops, ...liveDrops];

    return (
        <div className="mb-6 flex items-center gap-4">
            <div className="flex flex-col items-center justify-center bg-card/80 text-green-400 rounded-full px-2 py-3 h-[72px] w-12">
                <div className="w-2 h-2 rounded-full bg-green-400/80 shadow-[0_0_8px_rgba(52,211,153,0.7)] mb-1"></div>
                <span 
                    className="font-bold text-sm tracking-tighter" 
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                    {liveCounter}
                </span>
            </div>

            <div className="relative w-full overflow-hidden mask-gradient">
                <div className="flex gap-3 animate-scroll">
                    {displayItems.map((item, index) => (
                       <LiveDropItem key={`${item.id}-${index}`} item={item} />
                    ))}
                </div>
                 <style jsx>{`
                    .mask-gradient {
                        -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
                        mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
                    }
                    @keyframes scroll {
                        from { transform: translateX(0); }
                        to { transform: translateX(-50%); }
                    }
                    .animate-scroll {
                        display: flex;
                        width: max-content;
                        animation: scroll 60s linear infinite;
                    }
                `}</style>
            </div>
        </div>
    );
};


export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [isLoading, setIsLoading] = useState(true);

  // Since we removed Firebase from this page to fix build, we'll just use mock data.
  useEffect(() => {
    // Simulate a loading state
    const timer = setTimeout(() => {
        setCases(MOCK_CASES);
        setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCaseSelect = (caseData: Case) => {
    router.push(`/case/${caseData.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
           <Skeleton className="h-20 w-full mb-3" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{t('mainPage.casesTitle')}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
  
  return (
    <div className="space-y-8">
       <LiveDrops />
       <h1 className="text-2xl md:text-3xl font-bold mb-4">{t('mainPage.casesTitle')}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {cases.map((caseData) => (
          <CaseCard key={caseData.id} caseData={caseData} onOpen={() => handleCaseSelect(caseData)} />
        ))}
      </div>
    </div>
  );
}
