'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { CaseCard } from '@/components/CaseCard';
import { MOCK_CASES } from '@/lib/data';
import type { Case } from '@/lib/types';

export default function Home() {
  const router = useRouter();

  const handleCaseSelect = (caseData: Case) => {
    router.push(`/case/${caseData.id}`);
  };

  return (
    <div className="space-y-8">
       <h1 className="text-2xl font-bold mb-4">Cases</h1>
      <div className="grid grid-cols-2 gap-4">
        {MOCK_CASES.map((caseData) => (
          <CaseCard key={caseData.id} caseData={caseData} onOpen={() => handleCaseSelect(caseData)} />
        ))}
      </div>
    </div>
  );
}
