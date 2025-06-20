import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealsApi } from '@/lib/api/meals';
import type { Meal } from '@/lib/types';

export function useMeals(searchTerm?: string) {
  return useQuery({
    queryKey: ['meals', searchTerm],
    queryFn: () => mealsApi.getAll(searchTerm),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePresetMeals() {
  return useQuery({
    queryKey: ['preset-meals'],
    queryFn: mealsApi.getPresets,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useMeal(mealId?: string) {
  return useQuery({
    queryKey: ['meal', mealId],
    queryFn: () => mealsApi.getById(mealId!),
    enabled: !!mealId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mealsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['preset-meals'] });
    },
  });
}

export function useUpdateMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Meal> }) =>
      mealsApi.update(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['meal', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['preset-meals'] });
    },
  });
}

export function useDeleteMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mealsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['preset-meals'] });
    },
  });
} 