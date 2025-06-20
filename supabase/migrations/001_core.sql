-- 001_core.sql
-- Core schema for Menu Planner

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ingredients (reusable base components)
CREATE TABLE IF NOT EXISTS menuapp_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food items (reusable combinations of ingredients)
CREATE TABLE IF NOT EXISTS menuapp_food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_preset BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food item ingredients (many-to-many)
CREATE TABLE IF NOT EXISTS menuapp_food_item_ingredients (
  food_item_id UUID REFERENCES menuapp_food_items(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES menuapp_ingredients(id) ON DELETE CASCADE,
  quantity TEXT,
  PRIMARY KEY (food_item_id, ingredient_id)
);

-- Meals (reusable combinations of food items)
CREATE TABLE IF NOT EXISTS menuapp_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  food_items UUID[], -- array of food_item IDs
  tags TEXT[],
  is_preset BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menus (user-created meal plans)
CREATE TABLE IF NOT EXISTS menuapp_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT UNIQUE NOT NULL,
  edit_key TEXT NOT NULL,
  name TEXT,
  description TEXT,
  created_by TEXT,
  start_date DATE,
  end_date DATE,
  period_weeks INTEGER DEFAULT 1 CHECK (period_weeks >= 1 AND period_weeks <= 4),
  total_days INTEGER GENERATED ALWAYS AS (period_weeks * 7) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu entries (what meal goes where)
CREATE TABLE IF NOT EXISTS menuapp_menu_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES menuapp_menus(id) ON DELETE CASCADE,
  meal_id UUID REFERENCES menuapp_meals(id),
  date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_menuapp_ingredients_category ON menuapp_ingredients(category);
CREATE INDEX IF NOT EXISTS idx_menuapp_food_items_category ON menuapp_food_items(category);
CREATE INDEX IF NOT EXISTS idx_menuapp_meals_tags ON menuapp_meals USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_menuapp_menus_short_id ON menuapp_menus(short_id);