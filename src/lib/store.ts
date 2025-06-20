import { create } from 'zustand';
import type { Menu, MenuEntry, Meal, MealType } from './types';

interface MenuStore {
  // Current menu state
  currentMenu: Menu | null;
  menuEntries: MenuEntry[];
  currentWeek: number;
  currentDay: number;
  selectedMealSlot: { dayIndex: number; mealType: MealType } | null;
  // Edit mode state
  editMode: boolean;

  // Actions
  setMenu: (menu: Menu) => void;
  setMenuEntries: (entries: MenuEntry[]) => void;
  updateMeal: (dayIndex: number, mealType: MealType, meal: Meal | null) => void;
  switchWeek: (week: number) => void;
  setCurrentDay: (day: number) => void;
  setSelectedMealSlot: (slot: { dayIndex: number; mealType: MealType } | null) => void;
  toggleEditMode: () => void;
  clearMenu: () => void;
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  currentMenu: null,
  menuEntries: [],
  currentWeek: 0,
  currentDay: 0,
  selectedMealSlot: null,
  editMode: false,

  setMenu: (menu) => set({ currentMenu: menu }),

  setMenuEntries: (entries) => set({ menuEntries: entries }),

  updateMeal: (dayIndex, mealType, meal) => {
    const { currentMenu, menuEntries } = get();
    if (!currentMenu) return;

    // Calculate the actual date for this day
    const startDate = new Date(currentMenu.start_date!);
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + dayIndex);
    const dateStr = targetDate.toISOString().split('T')[0];

    // Update or create menu entry
    const existingIndex = menuEntries.findIndex(
      entry => entry.date === dateStr && entry.meal_type === mealType
    );

    let updatedEntries;
    if (existingIndex >= 0) {
      if (meal) {
        // Update existing entry
        updatedEntries = [...menuEntries];
        updatedEntries[existingIndex] = {
          ...updatedEntries[existingIndex],
          meal_id: meal.id,
          meal: meal,
        };
      } else {
        // Remove entry
        updatedEntries = menuEntries.filter((_, i) => i !== existingIndex);
      }
    } else if (meal) {
      // Create new entry
      const newEntry: MenuEntry = {
        id: `temp-${Date.now()}`, // Temporary ID
        menu_id: currentMenu.id,
        meal_id: meal.id,
        date: dateStr,
        meal_type: mealType,
        created_at: new Date().toISOString(),
        meal: meal,
      };
      updatedEntries = [...menuEntries, newEntry];
    } else {
      updatedEntries = menuEntries;
    }

    set({ menuEntries: updatedEntries });
  },

  switchWeek: (week) => set({ currentWeek: week }),

  setCurrentDay: (day) => set({ currentDay: day }),

  setSelectedMealSlot: (slot) => set({ selectedMealSlot: slot }),

  toggleEditMode: () => set((state) => ({ editMode: !state.editMode })),

  clearMenu: () => set({
    currentMenu: null,
    menuEntries: [],
    currentWeek: 0,
    currentDay: 0,
    selectedMealSlot: null,
    editMode: false,
  }),
})); 