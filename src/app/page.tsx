'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { CaseCard } from '@/components/CaseCard';
import type { Case } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { MOCK_CASES } from '@/lib/data';

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
       <h1 className="text-2xl font-bold mb-4">APEX Cases</h1>
      <div className="grid grid-cols-2 gap-4">
        {displayCases.map((caseData) => (
          <CaseCard key={caseData.id} caseData={caseData} onOpen={() => handleCaseSelect(caseData)} />
        ))}
      </div>
    </div>
  );
}
