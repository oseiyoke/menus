-- Sample meal data for testing
INSERT INTO menuapp_meals (name, description, food_items, tags, is_preset) VALUES
('Grilled Chicken Salad', 'Fresh greens with grilled chicken breast, tomatoes, and vinaigrette', '{}', '{"healthy", "protein", "salad"}', true),
('Vegetable Stir Fry', 'Colorful vegetables stir-fried with soy sauce and garlic', '{}', '{"vegetarian", "asian", "vegetables"}', true),
('Pasta Carbonara', 'Classic Italian pasta with bacon, eggs, and parmesan cheese', '{}', '{"italian", "pasta", "comfort"}', true),
('Overnight Oats', 'Healthy breakfast with oats, milk, fruits, and nuts', '{}', '{"breakfast", "healthy", "fiber"}', true),
('Fish Tacos', 'Grilled fish with fresh salsa, cabbage, and lime crema', '{}', '{"mexican", "fish", "fresh"}', true),
('Greek Yogurt Bowl', 'Creamy yogurt with granola, berries, and honey', '{}', '{"breakfast", "healthy", "protein"}', true),
('Turkey Sandwich', 'Whole wheat bread with sliced turkey, lettuce, and tomato', '{}', '{"lunch", "protein", "simple"}', true),
('Scrambled Eggs', 'Fluffy scrambled eggs with herbs and butter', '{}', '{"breakfast", "protein", "quick"}', true),
('Quinoa Buddha Bowl', 'Nutritious grain bowl with roasted vegetables and tahini', '{}', '{"healthy", "vegetarian", "bowl"}', true),
('Chicken Caesar Wrap', 'Classic Caesar salad wrapped in a tortilla', '{}', '{"lunch", "wrap", "chicken"}', true),
('Smoothie Bowl', 'Blended fruits topped with granola, nuts, and seeds', '{}', '{"breakfast", "healthy", "fruit"}', true),
('Beef Tacos', 'Seasoned ground beef with toppings in corn tortillas', '{}', '{"mexican", "beef", "comfort"}', true),
('Avocado Toast', 'Sourdough toast topped with mashed avocado and seasonings', '{}', '{"breakfast", "healthy", "simple"}', true),
('Chicken Noodle Soup', 'Comforting soup with chicken, vegetables, and noodles', '{}', '{"soup", "comfort", "chicken"}', true),
('Mediterranean Bowl', 'Quinoa bowl with hummus, olives, cucumber, and feta', '{}', '{"mediterranean", "healthy", "vegetarian"}', true),
('Pancakes', 'Fluffy pancakes with maple syrup and butter', '{}', '{"breakfast", "sweet", "comfort"}', true),
('Salmon with Rice', 'Grilled salmon served with steamed rice and vegetables', '{}', '{"healthy", "fish", "protein"}', true),
('Chicken Curry', 'Mild curry with chicken, coconut milk, and spices', '{}', '{"indian", "curry", "chicken"}', true),
('Veggie Burger', 'Plant-based burger with lettuce, tomato, and sweet potato fries', '{}', '{"vegetarian", "burger", "healthy"}', true),
('Egg Benedict', 'Poached eggs on English muffins with hollandaise sauce', '{}', '{"breakfast", "brunch", "eggs"}', true);

-- Sample ingredients
INSERT INTO menuapp_ingredients (name, category) VALUES
('Chicken Breast', 'Protein'),
('Mixed Greens', 'Vegetables'),
('Tomatoes', 'Vegetables'),
('Bell Peppers', 'Vegetables'),
('Onions', 'Vegetables'),
('Garlic', 'Aromatics'),
('Olive Oil', 'Oils'),
('Eggs', 'Protein'),
('Pasta', 'Grains'),
('Rice', 'Grains'),
('Quinoa', 'Grains'),
('Salmon', 'Protein'),
('Ground Beef', 'Protein'),
('Turkey', 'Protein'),
('Avocado', 'Fats'),
('Greek Yogurt', 'Dairy'),
('Milk', 'Dairy'),
('Bread', 'Grains'),
('Oats', 'Grains'),
('Berries', 'Fruits');

-- Sample food items (combinations of ingredients)
INSERT INTO menuapp_food_items (name, description, category, is_preset) VALUES
('Grilled Chicken Breast', 'Seasoned and grilled chicken breast', 'Protein', true),
('Mixed Green Salad', 'Fresh salad greens with basic vinaigrette', 'Vegetables', true),
('Steamed Rice', 'Plain steamed white or brown rice', 'Grains', true),
('Scrambled Eggs', 'Basic scrambled eggs with butter', 'Protein', true),
('Avocado Mash', 'Mashed avocado with lime and salt', 'Fats', true),
('Greek Yogurt', 'Plain Greek yogurt', 'Dairy', true),
('Overnight Oats Base', 'Oats soaked in milk overnight', 'Grains', true),
('Grilled Salmon', 'Seasoned and grilled salmon fillet', 'Protein', true),
('Quinoa Base', 'Cooked quinoa seasoned with herbs', 'Grains', true),
('Turkey Slices', 'Sliced deli turkey', 'Protein', true); 