-- Master seed file
-- Run all seed data

-- Load meal data
\i supabase/seed/meals.sql;

-- seed.sql
-- Basic seed data for development only

-- Ingredients
INSERT INTO menuapp_ingredients (id, name, category) VALUES
  (gen_random_uuid(), 'Chicken Breast', 'protein'),
  (gen_random_uuid(), 'Brown Rice', 'grain'),
  (gen_random_uuid(), 'Broccoli', 'vegetable'),
  (gen_random_uuid(), 'Olive Oil', 'fat'),
  (gen_random_uuid(), 'Spaghetti', 'grain'),
  (gen_random_uuid(), 'Parmesan Cheese', 'dairy'),
  (gen_random_uuid(), 'Eggs', 'protein'),
  (gen_random_uuid(), 'Bacon', 'protein'),
  (gen_random_uuid(), 'Greek Yogurt', 'dairy'),
  (gen_random_uuid(), 'Mixed Berries', 'fruit');

-- Food Items
INSERT INTO menuapp_food_items (id, name, description, category, is_preset) VALUES
  (gen_random_uuid(), 'Grilled Chicken', 'Seasoned grilled chicken breast', 'main', true),
  (gen_random_uuid(), 'Brown Rice', 'Steamed brown rice', 'side', true),
  (gen_random_uuid(), 'Steamed Broccoli', 'Lightly steamed broccoli florets', 'side', true),
  (gen_random_uuid(), 'Pasta Carbonara', 'Spaghetti tossed with creamy egg sauce and bacon', 'main', true),
  (gen_random_uuid(), 'Greek Yogurt Bowl', 'Yogurt topped with berries & honey', 'breakfast', true);

-- Food Item Ingredients (linking)
-- Grilled Chicken (first inserted food item) example linking, using CTE to retrieve ids
WITH gi AS (
  SELECT id FROM menuapp_food_items WHERE name = 'Grilled Chicken' LIMIT 1
),
ci AS (
  SELECT id AS ingredient_id FROM menuapp_ingredients WHERE name = 'Chicken Breast'
)
INSERT INTO menuapp_food_item_ingredients (food_item_id, ingredient_id, quantity)
SELECT gi.id, ci.ingredient_id, '200g'
FROM gi, ci;

WITH fi AS (
  SELECT id FROM menuapp_food_items WHERE name = 'Pasta Carbonara' LIMIT 1
),
pc AS (
  SELECT id FROM menuapp_ingredients WHERE name IN ('Spaghetti','Eggs','Bacon','Parmesan Cheese')
)
INSERT INTO menuapp_food_item_ingredients (food_item_id, ingredient_id, quantity)
SELECT fi.id, pc.id, NULL FROM fi, pc; 