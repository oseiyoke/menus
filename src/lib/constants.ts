// Menu discovery tags used across the application
export const MENU_TAGS = [
  'healthy',
  'quick', 
  'vegetarian',
  'family',
  'budget',
  'comfort',
  'seasonal',
  'easy'
] as const;

export type MenuTag = typeof MENU_TAGS[number]; 