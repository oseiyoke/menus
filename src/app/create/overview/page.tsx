'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Share2, X } from 'lucide-react';
import { useMenuStore } from '@/lib/store';
import { getDayName, addDays, getGenericDateRange, getDayOfWeekFromIndex } from '@/lib/utils';
import type { MealType } from '@/lib/types';

export default function MenuOverviewPage() {
  const router = useRouter();
  const {
    currentMenu,
    menuEntries,
    currentWeek,
    editMode,
    switchWeek,
    toggleEditMode,
    setCurrentDay,
  } = useMenuStore();

  const [menuName, setMenuName] = useState('');

  useEffect(() => {
    if (currentMenu) {
      setMenuName(currentMenu.name || '');
    }
  }, [currentMenu]);

  if (!currentMenu) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No menu found</p>
          <Link href="/create" className="text-blue-600 hover:underline">
            Create a new menu
          </Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(currentMenu.start_date!);
  const genericDateRange = getGenericDateRange(currentMenu.period_weeks);

  // Generate week tabs
  const weekTabs = Array.from({ length: currentMenu.period_weeks }, (_, i) => ({
    week: i,
    label: `Week ${i + 1}`,
  }));

  // Generate days for current week
  const currentWeekDays = Array.from({ length: 7 }, (_, i) => {
    const dayIndex = currentWeek * 7 + i;
    if (dayIndex >= currentMenu.total_days) return null;

    const date = addDays(startDate, dayIndex);
    const dateStr = date.toISOString().split('T')[0];

    // Get meals for this day
    const dayEntries = menuEntries.filter(entry => entry.date === dateStr);
    const meals = {
      breakfast: dayEntries.find(e => e.meal_type === 'breakfast')?.meal || null,
      lunch: dayEntries.find(e => e.meal_type === 'lunch')?.meal || null,
      dinner: dayEntries.find(e => e.meal_type === 'dinner')?.meal || null,
    };

    return {
      dayIndex,
      date,
      dayName: getDayOfWeekFromIndex(dayIndex),
      meals,
    };
  }).filter(Boolean);

  const handleDayClick = (dayIndex: number) => {
    if (editMode) return;
    setCurrentDay(dayIndex);
    router.push(`/create/day/${dayIndex}`);
  };

  const handleDeleteDay = (dayIndex: number) => {
    // Implementation for deleting all meals for a day
    console.log('Delete day:', dayIndex);
  };

  const handleShare = () => {
    router.push('/create/share');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/create"
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <input
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                disabled={!editMode}
                className="text-xl font-semibold text-gray-900 bg-transparent border-none outline-none flex-1"
                placeholder="Menu Name"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleEditMode}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  editMode
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 truncate">{genericDateRange}</p>
        </div>

        {/* Week Tabs */}
        {weekTabs.length > 1 && (
          <div className="px-5 pb-4">
            <div className="flex gap-2 overflow-x-auto">
              {weekTabs.map((tab) => (
                <button
                  key={tab.week}
                  onClick={() => switchWeek(tab.week)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    currentWeek === tab.week
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
      <div className="flex-1 p-4">
        <div className="space-y-3">
          {currentWeekDays.filter((day): day is NonNullable<typeof day> => day !== null).map((day) => (
            <div
              key={day.dayIndex}
              onClick={() => handleDayClick(day.dayIndex)}
              className={`bg-white rounded-xl p-4 shadow-sm transition-all relative ${
                editMode 
                  ? 'cursor-default' 
                  : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {editMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDay(day.dayIndex);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-50 text-red-600 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{day.dayName}</h3>
                </div>
              </div>

              <div className="flex gap-2">
                {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((mealType) => (
                  <div
                    key={mealType}
                    className={`flex-1 h-10 rounded-lg flex items-center justify-center text-xs font-medium overflow-hidden ${
                      day.meals[mealType]
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {day.meals[mealType]
                      ? day.meals[mealType]!.name.substring(0, 12) + '...'
                      : mealType.charAt(0).toUpperCase()
                    }
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button (Edit Mode) */}
      {editMode && (
        <div className="p-4">
          <button
            onClick={toggleEditMode}
            className="w-full px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
} 