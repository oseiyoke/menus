import { offlineStorage, type SyncQueueItem } from './OfflineStorage';
import { menuApi } from '../api/menus';
import { mealsApi } from '../api/meals';
import type { Menu, MenuEntry, CreateMenuData, UpdateMenuData } from '../types';

class SyncManagerClass {
  private syncInProgress = false;
  private retryDelay = 1000; // Start with 1 second
  private maxRetries = 3;

  async init(): Promise<void> {
    await offlineStorage.init();
    
    // Start background sync if online
    if (navigator.onLine) {
      this.startBackgroundSync();
    }

    // Listen for online events
    window.addEventListener('online', () => {
      console.log('[Sync] Back online, starting sync...');
      this.startBackgroundSync();
    });

    // Listen for offline events
    window.addEventListener('offline', () => {
      console.log('[Sync] Gone offline, pausing sync...');
      this.syncInProgress = false;
    });
  }

  async startBackgroundSync(): Promise<void> {
    if (this.syncInProgress) return;
    
    this.syncInProgress = true;
    
    try {
      await this.syncPresetMeals();
      await this.processSyncQueue();
    } catch (error) {
      console.error('[Sync] Background sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncPresetMeals(): Promise<void> {
    try {
      console.log('[Sync] Syncing preset meals...');
      const onlineMeals = await mealsApi.getPresets();
      await offlineStorage.savePresetMeals(onlineMeals);
      console.log('[Sync] Preset meals synced successfully');
    } catch (error) {
      console.error('[Sync] Failed to sync preset meals:', error);
    }
  }

  private async processSyncQueue(): Promise<void> {
    const queue = await offlineStorage.getSyncQueue();
    
    if (queue.length === 0) {
      console.log('[Sync] No items in sync queue');
      return;
    }

    console.log(`[Sync] Processing ${queue.length} items in sync queue`);

    for (const item of queue) {
      if (!navigator.onLine) {
        console.log('[Sync] Gone offline, stopping sync');
        break;
      }

      try {
        await this.processSyncItem(item);
        await offlineStorage.removeFromSyncQueue(item.id);
        console.log(`[Sync] Successfully synced item: ${item.type}`);
      } catch (error) {
        console.error(`[Sync] Failed to sync item ${item.id}:`, error);
        
        // Increment retry count
        const newRetryCount = item.retryCount + 1;
        
        if (newRetryCount >= this.maxRetries) {
          console.log(`[Sync] Max retries reached for item ${item.id}, removing from queue`);
          await offlineStorage.removeFromSyncQueue(item.id);
        } else {
          await offlineStorage.updateSyncItem(item.id, { retryCount: newRetryCount });
          console.log(`[Sync] Will retry item ${item.id} (attempt ${newRetryCount})`);
        }
      }
    }
  }

  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case 'CREATE_MENU':
        await this.syncCreateMenu(item.data);
        break;
      case 'UPDATE_MENU':
        await this.syncUpdateMenu(item.data);
        break;
      case 'DELETE_MENU':
        await this.syncDeleteMenu(item.data);
        break;
      case 'UPSERT_ENTRY':
        await this.syncUpsertEntry(item.data);
        break;
      case 'DELETE_ENTRY':
        await this.syncDeleteEntry(item.data);
        break;
      default:
        throw new Error(`Unknown sync item type: ${item.type}`);
    }
  }

  private async syncCreateMenu(data: CreateMenuData): Promise<void> {
    const newMenu = await menuApi.create(data);
    await offlineStorage.saveMenu(newMenu);
  }

  private async syncUpdateMenu(data: { id: string; updates: UpdateMenuData }): Promise<void> {
    const updatedMenu = await menuApi.update(data.id, data.updates);
    await offlineStorage.saveMenu(updatedMenu);
  }

  private async syncDeleteMenu(data: { id: string }): Promise<void> {
    await menuApi.delete(data.id);
    await offlineStorage.deleteMenu(data.id);
  }

  private async syncUpsertEntry(data: Omit<MenuEntry, 'id' | 'created_at'>): Promise<void> {
    const entry = await menuApi.upsertMenuEntry(data);
    await offlineStorage.saveMenuEntries([entry]);
  }

  private async syncDeleteEntry(data: { menuId: string; date: string; mealType: string }): Promise<void> {
    await menuApi.deleteMenuEntry(data.menuId, data.date, data.mealType);
  }

  // Public methods for queueing operations
  async queueCreateMenu(data: CreateMenuData): Promise<void> {
    await offlineStorage.addToSyncQueue({
      type: 'CREATE_MENU',
      data
    });
  }

  async queueUpdateMenu(id: string, updates: UpdateMenuData): Promise<void> {
    await offlineStorage.addToSyncQueue({
      type: 'UPDATE_MENU',
      data: { id, updates }
    });
  }

  async queueDeleteMenu(id: string): Promise<void> {
    await offlineStorage.addToSyncQueue({
      type: 'DELETE_MENU',
      data: { id }
    });
  }

  async queueUpsertEntry(entry: Omit<MenuEntry, 'id' | 'created_at'>): Promise<void> {
    await offlineStorage.addToSyncQueue({
      type: 'UPSERT_ENTRY',
      data: entry
    });
  }

  async queueDeleteEntry(menuId: string, date: string, mealType: string): Promise<void> {
    await offlineStorage.addToSyncQueue({
      type: 'DELETE_ENTRY',
      data: { menuId, date, mealType }
    });
  }

  // Force sync - useful for manual sync triggers
  async forcSync(): Promise<void> {
    if (!navigator.onLine) {
      throw new Error('Cannot sync while offline');
    }

    await this.startBackgroundSync();
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    queueLength: number;
    lastSyncTime?: string;
    isOnline: boolean;
    isSyncing: boolean;
  }> {
    const queue = await offlineStorage.getSyncQueue();
    const lastSyncTime = await offlineStorage.getMetadata('lastSyncTime');

    return {
      queueLength: queue.length,
      lastSyncTime,
      isOnline: navigator.onLine,
      isSyncing: this.syncInProgress
    };
  }

  // Download and cache user's menus for offline access
  async downloadUserMenus(userFingerprint: string): Promise<void> {
    try {
      console.log('[Sync] Downloading user menus for offline access...');
      
      // This would require a new API endpoint to get user's menus
      // For now, we'll sync the menus that are already in localStorage
      const localMenusJson = localStorage.getItem('user-menus');
      if (!localMenusJson) return;

      const localMenus = JSON.parse(localMenusJson);
      
      for (const localMenu of localMenus) {
        try {
          // Download full menu data
          const menu = await menuApi.getById(localMenu.id);
          if (menu) {
            const entries = await menuApi.getMenuEntries(menu.id);
            await offlineStorage.saveMenu({ ...menu, entries });
            await offlineStorage.saveMenuEntries(entries);
          }
        } catch (error) {
          console.warn(`[Sync] Failed to download menu ${localMenu.id}:`, error);
        }
      }

      await offlineStorage.setMetadata('lastSyncTime', new Date().toISOString());
      console.log('[Sync] User menus downloaded successfully');
    } catch (error) {
      console.error('[Sync] Failed to download user menus:', error);
      throw error;
    }
  }
}

export const syncManager = new SyncManagerClass(); 