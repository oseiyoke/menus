import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMenuStore } from '@/lib/store';
import { addDays, getDayOfWeekFromIndex } from '@/lib/utils';
import { useMenu as useMenuHook } from '@/hooks/useMenu';
import { MealSelectionModal } from './MealSelectionModal';
import { MealSlot } from './MealSlot';
import { DayHeader } from './DayHeader';
import { DayNavigation } from './DayNavigation';
import type { MealType, Meal, Menu } from '@/lib/types';

interface DayEditViewProps {
  menu: Menu;
  dayIndex: number;
  backHref: string;
  onNavigateDay?: (newDayIndex: number) => void;
}

export function DayEditView({ 
  menu, 
  dayIndex, 
  backHref, 
  onNavigateDay 
}: DayEditViewProps) {
  const router = useRouter();
  const { updateMeal, setCurrentDay, menuEntries } = useMenuStore();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');

  // Calculate current date and meals
  const startDate = new Date(menu.start_date!);
  const currentDate = addDays(startDate, dayIndex);
  const dayName = getDayOfWeekFromIndex(dayIndex);
  const dateStr = currentDate.toISOString().split('T')[0];

  // Get meals for current day
  const dayEntries = menuEntries.filter(entry => entry.date === dateStr);
  const meals = {
    breakfast: dayEntries.find(e => e.meal_type === 'breakfast')?.meal,
    lunch: dayEntries.find(e => e.meal_type === 'lunch')?.meal,
    dinner: dayEntries.find(e => e.meal_type === 'dinner')?.meal,
  };

  // Hook for performing upsert on the server
  const { upsertMenuEntry } = useMenuHook(menu.id);

  const handleMealSlotClick = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setModalOpen(true);
  };

  const handleSelectMeal = (meal: Meal) => {
    updateMeal(dayIndex, selectedMealType, meal);

    // Persist to backend
    upsertMenuEntry({
      menu_id: menu.id,
      meal_id: meal.id,
      date: dateStr,
      meal_type: selectedMealType,
      notes: undefined,
    });

    setModalOpen(false);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDayIndex = direction === 'prev' ? dayIndex - 1 : dayIndex + 1;
    if (newDayIndex >= 0 && newDayIndex < menu.total_days) {
      setCurrentDay(newDayIndex);
      if (onNavigateDay) {
        onNavigateDay(newDayIndex);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col w-full overflow-hidden">
      <DayHeader 
        dayName={dayName}
        backHref={backHref}
      />

      {/* Main content container with max width */}
      <div className="flex-1 flex flex-col">
        <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
          {/* Meals Container (flex column so each slot is clickable) */}
          <div className="flex flex-col flex-1 mx-4 my-5 bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((mealType) => (
              <MealSlot
                key={mealType}
                mealType={mealType}
                meal={meals[mealType]}
                onClick={() => handleMealSlotClick(mealType)}
              />
            ))}
          </div>
        </div>
      </div>

      <DayNavigation
        currentDay={dayIndex}
        totalDays={menu.total_days}
        onNavigate={handleNavigate}
      />

      <MealSelectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mealType={selectedMealType}
        onSelectMeal={handleSelectMeal}
      />
    </div>
  );
} 