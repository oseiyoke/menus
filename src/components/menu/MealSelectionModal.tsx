'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search } from 'lucide-react';
import { useMeals, useCreateMeal } from '@/hooks/useMeals';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyboardAwareModal } from '@/hooks/useKeyboardAwareModal';
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
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const { data: meals = [], isLoading } = useMeals(debouncedSearchTerm);
  const createMealMutation = useCreateMeal();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { modalStyle, backdropStyle, isKeyboardVisible } = useKeyboardAwareModal(isOpen);

  // Reset search and focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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
  const hasExistingMeals = meals.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black transition-opacity duration-200"
        style={backdropStyle}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-200 ease-out"
        style={modalStyle}
      >
        <div className="bg-white rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col safe-area-bottom">
          {/* Handle */}
          <div className="flex justify-center py-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Header with integrated search */}
          <div className="px-4 pb-3 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 capitalize mb-3">
              Select {mealType}
            </h2>
            
            {/* Search Input Container */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search or create new meal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div 
            className={`flex-1 overflow-y-auto overscroll-contain px-4 pb-4 ${isKeyboardVisible ? 'min-h-[200px]' : 'min-h-[300px]'}`}
            data-scrollable="true"
          >
            {/* Create option - Always visible when there's text */}
            {showCreateOption && (
              <div className="sticky top-0 bg-white py-2 mb-2 -mx-4 px-4 border-b border-gray-100 z-10 shadow-sm">
                <button
                  onClick={handleCreateMeal}
                  disabled={createMealMutation.isPending}
                  className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 active:bg-blue-200 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors flex-shrink-0">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-blue-900 truncate">
                        {createMealMutation.isPending ? 'Creating...' : `Create "${searchTerm}"`}
                      </h3>
                      <p className="text-sm text-blue-700">Add as new meal</p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Results Section */}
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                    Searching meals...
                  </div>
                </div>
              ) : (
                <>
                  {searchTerm.trim().length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Start typing to search meals</p>
                    </div>
                  ) : (
                    <>
                      {hasExistingMeals && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1 py-2">
                            Existing Meals
                          </p>
                          {meals.map((meal) => (
                            <button
                              key={meal.id}
                              onClick={() => {
                                onSelectMeal(meal);
                                setSearchTerm('');
                              }}
                              className="w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors text-left"
                            >
                              <h3 className="font-medium text-gray-900 truncate">{meal.name}</h3>
                              {meal.description && (
                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{meal.description}</p>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {!hasExistingMeals && searchTerm.trim().length > 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <p className="text-sm">No existing meals found</p>
                          <p className="text-xs mt-1">Use the create option above</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 