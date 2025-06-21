'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Share2, X } from 'lucide-react';
import { getDayOfWeekFromIndex, getGenericDateRange } from '@/lib/utils';
import { useMenuStore } from '@/lib/store';

export interface MenuData {
  id: string;
  name?: string;
  description?: string;
  period_weeks: number;
  entries?: MenuEntry[];
  start_date?: string;
}

export interface MenuEntry {
  id: string;
  day_index: number;
  meal_type: MealType;
  meal: {
    id: string;
    name: string;
    description?: string;
  };
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';

interface MenuBaseProps {
  menu: MenuData;
  isReadOnly?: boolean;
  onEdit?: () => void;
  onShare?: () => void;
  onDayClick?: (dayIndex: number) => void;
  backHref?: string;
  showEditControls?: boolean;
  onDeleteDay?: (dayIndex: number) => void;
}

export function MenuBase({
  menu,
  isReadOnly = false,
  onEdit,
  onShare,
  onDayClick,
  backHref = '/',
  showEditControls = false,
  onDeleteDay,
}: MenuBaseProps) {
  const [currentWeek, setCurrentWeek] = useState(0);

  const { menuEntries: storeEntries } = useMenuStore();

  // Memoise entries separately to keep reference stable when irrelevent parts of the store update
  const memoisedEntries = useMemo(() => (menu.entries && menu.entries.length > 0) ? menu.entries : storeEntries, [menu.entries, storeEntries]);

  const { weekTabs, currentWeekDays } = useMemo(() => {
    const totalDays = menu.period_weeks * 7;
    const weeks = [];
    const entries = memoisedEntries;
    
    for (let w = 0; w < menu.period_weeks; w++) {
      weeks.push({
        week: w,
        label: menu.period_weeks === 1 ? 'This Week' : `Week ${w + 1}`,
      });
    }

    // Get days for current week
    const weekStartDay = currentWeek * 7;
    const weekDays = [];
    
    for (let d = 0; d < 7; d++) {
      const dayIndex = weekStartDay + d;
      if (dayIndex >= totalDays) {
        weekDays.push(null);
        continue;
      }

      const dayName = getDayOfWeekFromIndex(d);
      const dayEntries = entries.filter(entry => {
        // Handle entry objects that contain day_index directly (internal format)
        // or only a date field (backend format)
        if ('day_index' in entry && typeof (entry as any).day_index === 'number') {
          return (entry as any).day_index === dayIndex;
        }

        if ('date' in entry) {
          // Calculate the index based on the difference between entry.date and menu.start_date
          const start = menu.start_date ? new Date(menu.start_date as string) : new Date();
          const entryDate = new Date((entry as any).date as string);
          // Round difference to whole days
          const diffDays = Math.round((entryDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays === dayIndex;
        }

        return false;
      });
      
      const meals: Record<MealType, MenuEntry['meal'] | null> = {
        breakfast: dayEntries.find(e => e.meal_type === 'breakfast')?.meal || null,
        lunch: dayEntries.find(e => e.meal_type === 'lunch')?.meal || null,
        dinner: dayEntries.find(e => e.meal_type === 'dinner')?.meal || null,
      };

      weekDays.push({
        dayIndex,
        dayName,
        meals,
      });
    }

    return {
      weekTabs: weeks,
      currentWeekDays: weekDays,
    };
  }, [memoisedEntries, menu.period_weeks, currentWeek, menu.start_date]);

  const genericDateRange = getGenericDateRange(menu.period_weeks);

  const switchWeek = (week: number) => {
    setCurrentWeek(week);
  };

  const handleDayClick = (dayIndex: number) => {
    if (!isReadOnly && onDayClick) {
      onDayClick(dayIndex);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col max-w-full overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="p-5 max-w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Link 
                href={backHref}
                className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center hover:bg-surface-200 transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {menu.name || 'Untitled Menu'}
              </h1>
            </div>
            <div className="flex gap-2 shrink-0">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-200 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              {onShare && (
                <button
                  onClick={onShare}
                  className="w-10 h-10 bg-surface-100 rounded-lg flex items-center justify-center hover:bg-surface-200 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 truncate">{genericDateRange}</p>
        </div>

        {/* Week Tabs */}
        {weekTabs.length > 1 && (
          <div className="px-5 pb-4">
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {weekTabs.map((tab) => (
                <button
                  key={tab.week}
                  onClick={() => switchWeek(tab.week)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                    currentWeek === tab.week
                      ? 'bg-primary-400 text-white'
                      : 'bg-surface-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Days Grid */}
      <div className="flex-1 p-4 max-w-full overflow-y-auto overscroll-contain">
        <div className="w-full max-w-2xl mx-auto">
          <div className="space-y-3 max-w-full">
            {currentWeekDays.filter((day): day is NonNullable<typeof day> => day !== null).map((day) => (
              <div
                key={day.dayIndex}
                onClick={() => handleDayClick(day.dayIndex)}
                className={`bg-white rounded-xl p-4 shadow-sm border border-primary-100 transition-all relative max-w-full ${
                  isReadOnly
                    ? 'cursor-default' 
                    : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-primary-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3 relative">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{day.dayName}</h3>
                  </div>
                  {showEditControls && onDeleteDay && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDay(day.dayIndex);
                      }}
                      className="absolute top-0 right-0 w-6 h-6 bg-red-50 text-red-600 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2 max-w-full overflow-hidden">
                  {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((mealType) => (
                    <div
                      key={mealType}
                      className={`flex-1 min-h-[3rem] rounded-lg flex items-center justify-center text-xs font-medium border p-2 ${
                        day.meals[mealType]
                          ? getMealTypeColors(mealType).filled
                          : 'bg-surface-100 text-gray-400 border-gray-200'
                      }`}
                    >
                      <span className="text-center leading-tight">
                        {day.meals[mealType]
                          ? day.meals[mealType]!.name
                          : mealType.charAt(0).toUpperCase()
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getMealTypeColors(mealType: MealType) {
  switch (mealType) {
    case 'breakfast':
      return {
        filled: 'bg-orange-100 text-orange-800 border-orange-200',
        empty: 'bg-orange-50 text-orange-400 border-orange-100'
      };
    case 'lunch':
      return {
        filled: 'bg-primary-100 text-primary-800 border-primary-200',
        empty: 'bg-primary-50 text-primary-400 border-primary-100'
      };
    case 'dinner':
      return {
        filled: 'bg-purple-100 text-purple-800 border-purple-200',
        empty: 'bg-purple-50 text-purple-400 border-purple-100'
      };
    default:
      return {
        filled: 'bg-surface-100 text-gray-800 border-gray-200',
        empty: 'bg-surface-50 text-gray-400 border-gray-100'
      };
  }
} 