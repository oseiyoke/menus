'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';
import type { DiscoverMenusFilters } from '@/lib/types';
import { MENU_TAGS } from '@/lib/constants';

interface DiscoverFiltersProps {
  filters: DiscoverMenusFilters;
  onFiltersChange: (filters: DiscoverMenusFilters) => void;
}

const PERIOD_OPTIONS = [
  { value: 1, label: '1 week' },
  { value: 2, label: '2 weeks' },
  { value: 3, label: '3 weeks' },
  { value: 4, label: '4 weeks' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'most_starred', label: 'Most Starred' },
  { value: 'popular', label: 'Most Viewed' },
  { value: 'name', label: 'Name' },
];

export function DiscoverFilters({ filters, onFiltersChange }: DiscoverFiltersProps) {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search.trim() || undefined });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onFiltersChange({ ...filters, tags: newTags.length > 0 ? newTags : undefined });
  };

  const handlePeriodToggle = (period: 1 | 2 | 3 | 4) => {
    const currentPeriods = filters.period_weeks || [];
    const newPeriods = currentPeriods.includes(period)
      ? currentPeriods.filter(p => p !== period)
      : [...currentPeriods, period];
    
    onFiltersChange({ ...filters, period_weeks: newPeriods.length > 0 ? newPeriods : undefined });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy: sortBy as any });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search menus..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Tags */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Tags
        </h4>
        <div className="flex flex-wrap gap-2">
          {MENU_TAGS.map((tag) => {
            const isSelected = filters.tags?.includes(tag) || false;
            return (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 text-sm">
        {/* Period */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Duration</label>
          <div className="flex flex-wrap gap-1">
            {PERIOD_OPTIONS.map((option) => {
              const isSelected = filters.period_weeks?.includes(option.value as any) || false;
              return (
                <button
                  key={option.value}
                  onClick={() => handlePeriodToggle(option.value as any)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    isSelected
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
} 