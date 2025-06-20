'use client';

import React, { useState } from 'react';
import { DiscoverMenusGrid } from '@/components/discover/DiscoverMenusGrid';
import { DiscoverFilters } from '@/components/discover/DiscoverFilters';
import { DiscoverHero } from '@/components/discover/DiscoverHero';
import type { DiscoverMenusFilters } from '@/lib/types';

export default function DiscoverPage() {
  const [filters, setFilters] = useState<DiscoverMenusFilters>({
    sortBy: 'newest'
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DiscoverHero />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <DiscoverFilters filters={filters} onFiltersChange={setFilters} />
        <DiscoverMenusGrid filters={filters} />
      </div>
    </div>
  );
} 