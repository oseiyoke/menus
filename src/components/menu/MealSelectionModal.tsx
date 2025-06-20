'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useMeals, useCreateMeal } from '@/hooks/useMeals';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyboardOffset } from '@/hooks/useKeyboardOffset';
import type { MealType, Meal } from '@/lib/types';

interface MealSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: MealType;
  onSelectMeal: (meal: Meal) => void;
}

export function MealSelectionModal({ 
  isOpen, 
  onClose, 
  mealType, 
  onSelectMeal 
}: MealSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 2000);
  const { data: meals = [], isLoading } = useMeals(debouncedSearchTerm);
  const createMealMutation = useCreateMeal();

  const keyboardOffset = useKeyboardOffset();

  // Reset search whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateMeal = async () => {
    if (!searchTerm.trim()) return;

    try {
      const newMeal = await createMealMutation.mutateAsync({
        name: searchTerm.trim(),
        description: '',
        food_items: [],
        tags: [],
        is_preset: false,
      });
      
      onSelectMeal(newMeal);
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to create meal:', error);
    }
  };

  const showCreateOption = searchTerm.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ paddingBottom: keyboardOffset }}>
      <div 
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      <div className="relative w-full max-w-full bg-white rounded-t-3xl flex flex-col overflow-hidden" style={{ maxHeight: `calc(60vh - ${keyboardOffset}px)` }}>
        {/* Handle */}
        <div className="flex justify-center p-3">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            Select {mealType}
          </h2>
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto overscroll-contain">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading meals...</div>
          ) : (
            <>
              {/* Existing meals (when searchTerm typed) */}
              {searchTerm.trim().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Start typing to search meals
                </div>
              ) : (
                <>
                  {meals.length > 0 ? (
                    <div className="space-y-3 mb-3">
                      {meals.map((meal) => (
                        <button
                          key={meal.id}
                          onClick={() => {
                            onSelectMeal(meal);
                            setSearchTerm('');
                          }}
                          className="w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                        >
                          <h3 className="font-medium text-gray-900 mb-1 truncate">{meal.name}</h3>
                          {meal.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{meal.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 mb-3">No meals found</div>
                  )}
                </>
              )}
            </>
          )}
          {/* Create option always shown when user typed something */}
          {showCreateOption && (
                    <button
                      onClick={handleCreateMeal}
                      disabled={createMealMutation.isPending}
                      className="w-full p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors shrink-0">
                          <Plus className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-blue-900 truncate">
                            {createMealMutation.isPending ? 'Creating...' : `Create "${searchTerm}"`}
                          </h3>
                          <p className="text-sm text-blue-600">Add this as a new meal</p>
                        </div>
                      </div>
                    </button>
                  )}
        </div>
      </div>
    </div>
  );
} 