import React from 'react';

interface MealSlotProps {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  meal?: {
    id: string;
    name: string;
    description?: string;
  };
  onClick?: () => void;
  className?: string;
}

export function MealSlot({ mealType, meal, onClick, className = '' }: MealSlotProps) {
  const getMealTypeColors = () => {
    switch (mealType) {
      case 'breakfast':
        return meal 
          ? 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100'
          : 'bg-orange-25 border-orange-100 text-orange-400 hover:bg-orange-50';
      case 'lunch':
        return meal
          ? 'bg-primary-50 border-primary-200 text-primary-800 hover:bg-primary-100'
          : 'bg-primary-25 border-primary-100 text-primary-400 hover:bg-primary-50';
      case 'dinner':
        return meal
          ? 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100'
          : 'bg-purple-25 border-purple-100 text-purple-400 hover:bg-purple-50';
      default:
        return 'bg-surface-100 border-gray-200 text-gray-400 hover:bg-surface-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex-1 min-h-[3rem] rounded-lg border-2 flex items-center justify-center 
        text-xs font-medium cursor-pointer transition-all
        ${getMealTypeColors()}
        ${className}
      `}
    >
      <div className="text-center px-2">
        <div className="font-medium">
          {meal ? meal.name : mealType.charAt(0).toUpperCase() + mealType.slice(1)}
        </div>
      </div>
    </div>
  );
} 