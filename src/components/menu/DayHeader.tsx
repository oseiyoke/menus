import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface DayHeaderProps {
  dayName: string;
  backHref: string;
}

export function DayHeader({ dayName, backHref }: DayHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm border-b border-primary-100 w-full">
      <Link 
        href={backHref}
        className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center hover:bg-surface-200 transition-colors shrink-0"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
      
      <div className="text-center flex-1 min-w-0 px-2">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">{dayName}</h1>
      </div>
      
      <div className="w-10 shrink-0" /> {/* Spacer */}
    </header>
  );
} 