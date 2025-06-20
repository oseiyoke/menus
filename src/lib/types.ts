export interface Ingredient {
  id: string;
  name: string;
  category?: string;
  created_at: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  is_preset: boolean;
  created_at: string;
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  food_items: string[];
  tags: string[];
  is_preset: boolean;
  created_at: string;
}

export interface Menu {
  id: string;
  short_id: string;
  edit_key: string;
  name?: string;
  description?: string;
  created_by?: string;
  start_date?: string;
  end_date?: string;
  period_weeks: 1 | 2 | 3 | 4;
  total_days: number;
  created_at: string;
  updated_at: string;
  is_discoverable?: boolean;
  discovery_tags?: string[];
  view_count?: number;
  star_count?: number;
  is_starred?: boolean; // For current user
}

export interface MenuEntry {
  id: string;
  menu_id: string;
  meal_id?: string;
  date: string;
  meal_type: MealType;
  notes?: string;
  created_at: string;
  meal?: Meal;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface CreateMenuData {
  name: string;
  description?: string;
  period_weeks: 1 | 2 | 3 | 4;
  start_date: Date;
  created_by?: string;
}

export interface UpdateMenuData {
  name?: string;
  description?: string;
  is_discoverable?: boolean;
  discovery_tags?: string[];
}

export interface ShareLinks {
  view_link: string;
  edit_link: string;
}

export interface DayData {
  date: Date;
  dayName: string;
  meals: {
    breakfast: Meal | null;
    lunch: Meal | null;
    dinner: Meal | null;
  };
}

export interface PeriodOption {
  weeks: 1 | 2 | 3 | 4;
  label: string;
  description: string;
}

export interface DiscoverMenusFilters {
  tags?: string[];
  search?: string;
  period_weeks?: (1 | 2 | 3 | 4)[];
  sortBy?: 'newest' | 'popular' | 'most_starred' | 'name';
}

export interface DiscoverMenusResponse {
  menus: Menu[];
  total: number;
  hasMore: boolean;
}

export interface MenuStar {
  id: string;
  menu_id: string;
  user_fingerprint: string;
  created_at: string;
} 