'use client';

import FilterBar from '@/components/FilterBar';
import CompanionList from '@/components/CompanionList';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function FindCompanionContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    game: searchParams.get('game') || '',
    rank: searchParams.get('rank') || '',
    priceRange: searchParams.get('priceRange') || '',
    search: searchParams.get('q') || '',
    sort: searchParams.get('sort') || ''
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent text-white py-14 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold tracking-tight">找陪玩</h1>
          <p className="mt-3 max-w-2xl text-white/90">按游戏、段位和价格快速筛选，找到最适合你的开黑伙伴。</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <FilterBar onFilterChange={setFilters} initialGame={filters.game} />
        <CompanionList filters={filters} />
      </div>
    </div>
  );
}

export default function FindCompanion() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div></div>}>
      <FindCompanionContent />
    </Suspense>
  );
}
