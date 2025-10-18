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
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter">Choose Your Case</h1>
        <p className="text-muted-foreground mt-2">Select a case to reveal your prize.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
