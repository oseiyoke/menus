import React, { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '@/lib/api/menus';
import { useMenuStore } from '@/lib/store';
import { useOfflineMenu } from '@/hooks/useOfflineMenus';
import type { CreateMenuData, UpdateMenuData } from '@/lib/types';

export function useMenu(menuId?: string) {
  const queryClient = useQueryClient();
  const { setMenu, setMenuEntries } = useMenuStore();
  const { menu: offlineMenu, isLoading: isOfflineLoading } = useOfflineMenu(menuId);

  const menuQuery = useQuery({
    queryKey: ['menu', menuId],
    queryFn: () => menuApi.getById(menuId!),
    enabled: !!menuId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Use offline data as fallback
    placeholderData: offlineMenu,
  });

  const menuEntriesQuery = useQuery({
    queryKey: ['menu-entries', menuId],
    queryFn: () => menuApi.getMenuEntries(menuId!),
    enabled: !!menuId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createMenuMutation = useMutation({
    mutationFn: menuApi.create,
    onSuccess: (data) => {
      setMenu(data);
      queryClient.setQueryData(['menu', data.id], data);
    },
  });

  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuData }) =>
      menuApi.update(id, data),
    onSuccess: (data) => {
      setMenu(data);
      queryClient.setQueryData(['menu', data.id], data);
    },
  });

  const upsertMenuEntryMutation = useMutation({
    mutationFn: menuApi.upsertMenuEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-entries', menuId] });
    },
  });

  const deleteMenuEntryMutation = useMutation({
    mutationFn: ({ menuId, date, mealType }: { menuId: string; date: string; mealType: string }) =>
      menuApi.deleteMenuEntry(menuId, date, mealType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-entries', menuId] });
    },
  });

  // Update store when data loads
  React.useEffect(() => {
    if (menuQuery.data) {
      setMenu(menuQuery.data);
    }
  }, [menuQuery.data, setMenu]);

  React.useEffect(() => {
    if (menuEntriesQuery.data) {
      setMenuEntries(menuEntriesQuery.data);
    }
  }, [menuEntriesQuery.data, setMenuEntries]);

  return {
    menu: menuQuery.data || offlineMenu,
    menuEntries: menuEntriesQuery.data || [],
    isLoading: menuQuery.isLoading || menuEntriesQuery.isLoading || isOfflineLoading,
    error: menuQuery.error || menuEntriesQuery.error,
    isOffline: !menuQuery.data && !!offlineMenu,
    createMenu: createMenuMutation.mutate,
    createMenuAsync: createMenuMutation.mutateAsync,
    updateMenu: updateMenuMutation.mutate,
    upsertMenuEntry: upsertMenuEntryMutation.mutate,
    deleteMenuEntry: deleteMenuEntryMutation.mutate,
    isCreating: createMenuMutation.isPending,
    isUpdating: updateMenuMutation.isPending,
  };
}

// Hook for menu by short ID (for public access)
export function useMenuByShortId(shortId?: string) {
  return useQuery({
    queryKey: ['menu-by-short-id', shortId],
    queryFn: () => menuApi.getByShortId(shortId!),
    enabled: !!shortId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for tracking menu views
export function useMenuView() {
  const incrementViewMutation = useMutation({
    mutationFn: (menuId: string) => menuApi.incrementViewCount(menuId),
  });

  const trackView = useCallback((menuId: string) => {
    // Track view with simple debounce to avoid spam
    const hasTracked = sessionStorage.getItem(`menu_view_${menuId}`);
    if (!hasTracked) {
      incrementViewMutation.mutate(menuId);
      sessionStorage.setItem(`menu_view_${menuId}`, 'true');
    }
  }, [incrementViewMutation]);

  return { trackView };
} 