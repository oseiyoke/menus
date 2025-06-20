# Menu Planner

A comprehensive meal planning application built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Period Selection**: Create menus for 1-4 weeks
- **Visual Planning**: Overview of your entire menu with week tabs
- **Day Management**: Detailed view for each day with breakfast, lunch, and dinner slots
- **Meal Library**: Browse and search through preset meals
- **Real-time Updates**: Changes sync immediately with Supabase
- **Sharing**: Generate shareable links for view-only or edit access
- **Mobile-first Design**: Optimized for mobile devices with touch interactions

## Flow

1. **Landing Page** → Tap "Create Menu"
2. **Period Selection** → Choose 1-4 weeks
3. **Menu Overview** → See all days with meal indicators
4. **Day View** → Click on a day to edit meals
5. **Meal Selection** → Browse/search meals and add to slots
6. **Share** → Generate and share menu links

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Icons**: Lucide React

## Database Schema

- **menuapp_menus**: Store menu metadata including period (1-4 weeks)
- **menuapp_meals**: Preset meals that users can select
- **menuapp_menu_entries**: Junction table linking menus to meals by date and meal type
- **menuapp_food_items**: Individual food components
- **menuapp_ingredients**: Base ingredients for food items

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project
   - Run the migration: `supabase/migrations/001_core.sql`
   - Run the seed data: `supabase/seed/meals.sql`

3. **Environment Variables**:
   Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── page.tsx        # Landing page
│   ├── create/         # Menu creation flow
│   │   ├── page.tsx    # Period selection
│   │   ├── overview/   # Menu overview
│   │   ├── day/        # Day view
│   │   └── share/      # Share page
├── components/         # Reusable components
│   └── ui/            # Base UI components
├── hooks/             # Custom React hooks
├── lib/               # Utilities and configurations
│   ├── api/           # API functions
│   ├── types.ts       # TypeScript types
│   ├── utils.ts       # Utility functions
│   └── store.ts       # Zustand store
```

## Key Features Implementation

### Period Support
- Database includes `period_weeks` (1-4) and `total_days` (calculated)
- UI dynamically generates days based on selected period
- Week tabs appear only for multi-week menus

### State Management
- Zustand store for client-side state
- React Query for server state and caching
- Optimistic updates for better UX

### Mobile-First Design
- Bottom sheet modals for meal selection
- Touch-friendly interface
- Responsive layout for all screen sizes

### Sharing System
- Unique short IDs for public access
- Edit keys for protected editing
- Separate view-only and edit links

## Development Notes

- Uses `'use client'` for interactive components
- TypeScript strict mode enabled
- Path aliases configured (`@/` → `src/`)
- Tailwind CSS with custom design system
- Component-based architecture with clear separation of concerns 