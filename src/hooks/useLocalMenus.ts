import { useState, useEffect, useCallback } from 'react';

export interface LocalMenu {
  id: string;
  shortId: string;
  name: string;
  description?: string;
  period_weeks: 1 | 2 | 3 | 4;
  createdAt: string;
  lastAccessed: string;
  editKey?: string;
}

const LOCAL_STORAGE_KEY = 'user-menus';

export function useLocalMenus() {
  const [menus, setMenus] = useState<LocalMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load menus from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsedMenus = JSON.parse(stored) as LocalMenu[];
        // Sort by last accessed, most recent first
        parsedMenus.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());
        setMenus(parsedMenus);
      }
    } catch (error) {
      console.error('Failed to load menus from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save menus to localStorage whenever menus change
  const saveToStorage = useCallback((updatedMenus: LocalMenu[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedMenus));
    } catch (error) {
      console.error('Failed to save menus to localStorage:', error);
    }
  }, []);

  // Add a new menu
  const addMenu = useCallback((menu: Omit<LocalMenu, 'lastAccessed' | 'createdAt'> & { createdAt?: string }) => {
    const newMenu: LocalMenu = {
      ...menu,
      lastAccessed: new Date().toISOString(),
      createdAt: menu.createdAt || new Date().toISOString(),
    };
    
    setMenus(prev => {
      // Remove existing menu with same ID if it exists
      const filtered = prev.filter(m => m.id !== menu.id);
      const updated = [newMenu, ...filtered];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Update last accessed time for a menu
  const updateLastAccessed = useCallback((menuId: string) => {
    setMenus(prev => {
      const updated = prev.map(menu => 
        menu.id === menuId 
          ? { ...menu, lastAccessed: new Date().toISOString() }
          : menu
      ).sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());
      
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Remove a menu
  const removeMenu = useCallback((menuId: string) => {
    setMenus(prev => {
      const updated = prev.filter(m => m.id !== menuId);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Clear all menus
  const clearMenus = useCallback(() => {
    setMenus([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear menus from localStorage:', error);
    }
  }, []);

  // Get recent menus (last 10)
  const recentMenus = menus.slice(0, 10);

  // Check if user has any menus
  const hasMenus = menus.length > 0;

  return {
    menus,
    recentMenus,
    hasMenus,
    isLoading,
    addMenu,
    updateLastAccessed,
    removeMenu,
    clearMenus,
  };
} 