'use client'

import React, { useState } from 'react';
import { CaseCard } from '@/components/CaseCard';
import { CaseOpeningModal } from '@/components/CaseOpeningModal';
import { MOCK_CASES } from '@/lib/data';
import type { Case } from '@/lib/types';

export default function Home() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCaseSelect = (caseData: Case) => {
    setSelectedCase(caseData);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
       <h1 className="text-2xl font-bold mb-4">Cases</h1>
      <div className="grid grid-cols-2 gap-4">
        {MOCK_CASES.map((caseData) => (
          <CaseCard key={caseData.id} caseData={caseData} onOpen={() => handleCaseSelect(caseData)} />
        ))}
      </div>
      <CaseOpeningModal
        caseData={selectedCase}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
