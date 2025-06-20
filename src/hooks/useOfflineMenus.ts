import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '@/lib/api/menus';
import { offlineStorage } from '@/lib/offline/OfflineStorage';
import { syncManager } from '@/lib/offline/SyncManager';
import type { Menu, MenuEntry, CreateMenuData, UpdateMenuData } from '@/lib/types';

export function useOfflineMenu(menuId?: string) {
  const queryClient = useQueryClient();
  const safeIsOnline = () => (typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isOffline, setIsOffline] = useState(!safeIsOnline());

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  // Menu query with offline fallback
  const menuQuery = useQuery({
    queryKey: ['menu', menuId],
    queryFn: async () => {
      if (!menuId) return null;

      try {
        // Try network first
        if (safeIsOnline()) {
          const menu = await menuApi.getById(menuId);
          if (menu) {
            // Cache the result
            await offlineStorage.saveMenu(menu);
            return menu;
          }
        }
        
        // Fallback to offline storage
        const cachedMenu = await offlineStorage.getMenu(menuId);
        return cachedMenu;
      } catch (error) {
        console.warn('Failed to fetch menu from network, trying cache:', error);
        const cachedMenu = await offlineStorage.getMenu(menuId);
        return cachedMenu;
      }
    },
    enabled: !!menuId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Menu entries query with offline fallback
  const menuEntriesQuery = useQuery({
    queryKey: ['menu-entries', menuId],
    queryFn: async () => {
      if (!menuId) return [];

      try {
        // Try network first
        if (safeIsOnline()) {
          const entries = await menuApi.getMenuEntries(menuId);
          // Cache the result
          await offlineStorage.saveMenuEntries(entries);
          return entries;
        }
        
        // Fallback to offline storage
        const cachedEntries = await offlineStorage.getMenuEntries(menuId);
        return cachedEntries;
      } catch (error) {
        console.warn('Failed to fetch menu entries from network, trying cache:', error);
        const cachedEntries = await offlineStorage.getMenuEntries(menuId);
        return cachedEntries;
      }
    },
    enabled: !!menuId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create menu mutation with offline support
  const createMenuMutation = useMutation({
    mutationFn: async (data: CreateMenuData) => {
      if (safeIsOnline()) {
        try {
          const newMenu = await menuApi.create(data);
          await offlineStorage.saveMenu(newMenu);
          return newMenu;
        } catch (error) {
          // Queue for sync when online
          await syncManager.queueCreateMenu(data);
          throw error;
        }
      } else {
        // Queue for sync when online
        await syncManager.queueCreateMenu(data);
        throw new Error('Menu will be created when back online');
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['menu', data.id], data);
    },
  });

  // Update menu mutation with offline support
  const updateMenuMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMenuData }) => {
      if (safeIsOnline()) {
        try {
          const updatedMenu = await menuApi.update(id, data);
          await offlineStorage.saveMenu(updatedMenu);
          return updatedMenu;
        } catch (error) {
          // Queue for sync when online
          await syncManager.queueUpdateMenu(id, data);
          throw error;
        }
      } else {
        // Update offline copy and queue for sync
        const cachedMenu = await offlineStorage.getMenu(id);
        if (cachedMenu) {
          const updatedMenu = { ...cachedMenu, ...data };
          await offlineStorage.saveMenu(updatedMenu);
          await syncManager.queueUpdateMenu(id, data);
          return updatedMenu;
        }
        throw new Error('Menu not found in cache');
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['menu', data.id], data);
    },
  });

  // Upsert menu entry mutation with offline support
  const upsertMenuEntryMutation = useMutation({
    mutationFn: async (entry: Omit<MenuEntry, 'id' | 'created_at'>) => {
      if (safeIsOnline()) {
        try {
          const savedEntry = await menuApi.upsertMenuEntry(entry);
          await offlineStorage.saveMenuEntries([savedEntry]);
          return savedEntry;
        } catch (error) {
          // Queue for sync when online
          await syncManager.queueUpsertEntry(entry);
          throw error;
        }
      } else {
        // Create temporary entry and queue for sync
        const tempEntry: MenuEntry = {
          ...entry,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        await offlineStorage.saveMenuEntries([tempEntry]);
        await syncManager.queueUpsertEntry(entry);
        return tempEntry;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-entries', menuId] });
    },
  });

  // Delete menu entry mutation with offline support
  const deleteMenuEntryMutation = useMutation({
    mutationFn: async ({ menuId, date, mealType }: { menuId: string; date: string; mealType: string }) => {
      if (safeIsOnline()) {
        try {
          await menuApi.deleteMenuEntry(menuId, date, mealType);
          // Also remove from cache
          const entries = await offlineStorage.getMenuEntries(menuId);
          const filteredEntries = entries.filter(
            entry => !(entry.date === date && entry.meal_type === mealType)
          );
          await offlineStorage.saveMenuEntries(filteredEntries);
        } catch (error) {
          // Queue for sync when online
          await syncManager.queueDeleteEntry(menuId, date, mealType);
          throw error;
        }
      } else {
        // Remove from cache and queue for sync
        const entries = await offlineStorage.getMenuEntries(menuId);
        const filteredEntries = entries.filter(
          entry => !(entry.date === date && entry.meal_type === mealType)
        );
        await offlineStorage.saveMenuEntries(filteredEntries);
        await syncManager.queueDeleteEntry(menuId, date, mealType);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-entries', menuId] });
    },
  });

  return {
    menu: menuQuery.data,
    menuEntries: menuEntriesQuery.data || [],
    isLoading: menuQuery.isLoading || menuEntriesQuery.isLoading,
    error: menuQuery.error || menuEntriesQuery.error,
    isOffline,
    createMenu: createMenuMutation.mutate,
    createMenuAsync: createMenuMutation.mutateAsync,
    updateMenu: updateMenuMutation.mutate,
    upsertMenuEntry: upsertMenuEntryMutation.mutate,
    deleteMenuEntry: deleteMenuEntryMutation.mutate,
    isCreating: createMenuMutation.isPending,
    isUpdating: updateMenuMutation.isPending,
  };
}

// Hook for getting menu by short ID with offline support
export function useOfflineMenuByShortId(shortId?: string) {
  const safeIsOnline = () => (typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isOffline, setIsOffline] = useState(!safeIsOnline());

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  return useQuery({
    queryKey: ['menu-by-short-id', shortId],
    queryFn: async () => {
      if (!shortId) return null;

      try {
        // Try network first
        if (safeIsOnline()) {
          const menu = await menuApi.getByShortId(shortId);
          if (menu) {
            // Cache the result
            await offlineStorage.saveMenu(menu);
            return menu;
          }
        }
        
        // Fallback to offline storage
        const cachedMenu = await offlineStorage.getMenuByShortId(shortId);
        return cachedMenu;
      } catch (error) {
        console.warn('Failed to fetch menu from network, trying cache:', error);
        const cachedMenu = await offlineStorage.getMenuByShortId(shortId);
        return cachedMenu;
      }
    },
    enabled: !!shortId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      isOffline,
    }
  });
}

// Hook for managing all user menus with offline support
export function useOfflineUserMenus() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['user-menus-offline'],
    queryFn: async () => {
      // Get all cached menus
      const cachedMenus = await offlineStorage.getAllMenus();
      return cachedMenus;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Hook for preset meals with offline support
export function useOfflinePresetMeals(searchTerm?: string) {
  return useQuery({
    queryKey: ['preset-meals-offline', searchTerm],
    queryFn: async () => {
      try {
        // Try to get from cache first (faster)
        if (searchTerm) {
          const cachedResults = await offlineStorage.searchPresetMeals(searchTerm);
          return cachedResults;
        } else {
          const cachedMeals = await offlineStorage.getPresetMeals();
          return cachedMeals;
        }
      } catch (error) {
        console.error('Failed to get preset meals from cache:', error);
        return [];
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
} 