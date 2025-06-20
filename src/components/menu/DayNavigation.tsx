import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayNavigationProps {
  currentDay: number;
  totalDays: number;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function DayNavigation({ currentDay, totalDays, onNavigate }: DayNavigationProps) {
  const canNavigatePrev = currentDay > 0;
  const canNavigateNext = currentDay < totalDays - 1;

  return (
    <div className="flex items-center justify-between p-4 bg-white border-t w-full">
      <button
        onClick={() => onNavigate('prev')}
        disabled={!canNavigatePrev}
        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors shrink-0 ${
          canNavigatePrev
            ? 'text-gray-700 hover:bg-gray-100'
            : 'text-gray-400 cursor-not-allowed'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="text-sm text-gray-500 text-center px-2">
        Day {currentDay + 1} of {totalDays}
      </div>

      <button
        onClick={() => onNavigate('next')}
        disabled={!canNavigateNext}
        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors shrink-0 ${
          canNavigateNext
            ? 'text-gray-700 hover:bg-gray-100'  
            : 'text-gray-400 cursor-not-allowed'
        }`}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
} 