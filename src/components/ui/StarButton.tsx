'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarButtonProps {
  isStarred: boolean;
  starCount: number;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function StarButton({ 
  isStarred, 
  starCount, 
  onToggle, 
  disabled = false,
  size = 'md',
  showCount = true 
}: StarButtonProps) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full transition-all duration-200 group',
        'hover:scale-105 active:scale-95',
        sizeClasses[size],
        isStarred 
          ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
          : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-amber-500',
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
      )}
    >
      <Star 
        className={cn(
          iconSizes[size],
          'transition-all duration-200',
          isStarred ? 'fill-current' : 'group-hover:scale-110'
        )} 
      />
      {showCount && (
        <span className={cn(
          'font-medium transition-colors',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {starCount}
        </span>
      )}
    </button>
  );
} 