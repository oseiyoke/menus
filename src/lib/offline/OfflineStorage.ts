import type { Menu, MenuEntry, Meal } from '../types';

export interface OfflineMenu extends Menu {
  entries?: MenuEntry[];
  lastSynced?: string;
}

export interface SyncQueueItem {
  id: string;
  type: 'CREATE_MENU' | 'UPDATE_MENU' | 'DELETE_MENU' | 'UPSERT_ENTRY' | 'DELETE_ENTRY';
  data: any;
  timestamp: string;
  retryCount: number;
}

export interface AppMetadata {
  version: string;
  lastSyncTime?: string;
  userId?: string;
}

class OfflineStorageManager {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'MenuPlannerDB';
  private readonly dbVersion = 1;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Menus store
        if (!db.objectStoreNames.contains('menus')) {
          const menuStore = db.createObjectStore('menus', { keyPath: 'id' });
          menuStore.createIndex('short_id', 'short_id', { unique: true });
          menuStore.createIndex('created_at', 'created_at');
        }

        // Menu entries store
        if (!db.objectStoreNames.contains('menu_entries')) {
          const entriesStore = db.createObjectStore('menu_entries', { keyPath: 'id' });
          entriesStore.createIndex('menu_id', 'menu_id');
          entriesStore.createIndex('date', 'date');
        }

        // Preset meals store
        if (!db.objectStoreNames.contains('preset_meals')) {
          const mealsStore = db.createObjectStore('preset_meals', { keyPath: 'id' });
          mealsStore.createIndex('name', 'name');
          mealsStore.createIndex('tags', 'tags', { multiEntry: true });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp');
          syncStore.createIndex('type', 'type');
        }

        // App metadata store
        if (!db.objectStoreNames.contains('app_metadata')) {
          db.createObjectStore('app_metadata', { keyPath: 'key' });
        }
      };
    });
  }

  private async ensureDb(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // Menu operations
  async saveMenu(menu: OfflineMenu): Promise<void> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['menus'], 'readwrite');
    const store = transaction.objectStore('menus');
    
    await new Promise((resolve, reject) => {
      const request = store.put({
        ...menu,
        lastSynced: new Date().toISOString()
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getMenu(id: string): Promise<OfflineMenu | null> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['menus'], 'readonly');
    const store = transaction.objectStore('menus');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getMenuByShortId(shortId: string): Promise<OfflineMenu | null> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['menus'], 'readonly');
    const store = transaction.objectStore('menus');
    const index = store.index('short_id');
    
    return new Promise((resolve, reject) => {
      const request = index.get(shortId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllMenus(): Promise<OfflineMenu[]> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['menus'], 'readonly');
    const store = transaction.objectStore('menus');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMenu(id: string): Promise<void> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['menus', 'menu_entries'], 'readwrite');
    
    // Delete menu
    const menuStore = transaction.objectStore('menus');
    menuStore.delete(id);
    
    // Delete associated entries
    const entriesStore = transaction.objectStore('menu_entries');
    const index = entriesStore.index('menu_id');
    const request = index.openCursor(IDBKeyRange.only(id));
    
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Menu entries operations
  async saveMenuEntries(entries: MenuEntry[]): Promise<void> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['menu_entries'], 'readwrite');
    const store = transaction.objectStore('menu_entries');
    
    for (const entry of entries) {
      store.put(entry);
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getMenuEntries(menuId: string): Promise<MenuEntry[]> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['menu_entries'], 'readonly');
    const store = transaction.objectStore('menu_entries');
    const index = store.index('menu_id');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(menuId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Preset meals operations
  async savePresetMeals(meals: Meal[]): Promise<void> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['preset_meals'], 'readwrite');
    const store = transaction.objectStore('preset_meals');
    
    for (const meal of meals) {
      store.put(meal);
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getPresetMeals(): Promise<Meal[]> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['preset_meals'], 'readonly');
    const store = transaction.objectStore('preset_meals');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async searchPresetMeals(query: string): Promise<Meal[]> {
    const meals = await this.getPresetMeals();
    const lowerQuery = query.toLowerCase();
    
    return meals.filter(meal => 
      meal.name.toLowerCase().includes(lowerQuery) ||
      (meal.description?.toLowerCase().includes(lowerQuery)) ||
      (meal.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }

  // Sync queue operations
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    
    const syncItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(syncItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['sync_queue'], 'readonly');
    const store = transaction.objectStore('sync_queue');
    const index = store.index('timestamp');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateSyncItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          const updatedItem = { ...item, ...updates };
          const putRequest = store.put(updatedItem);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Sync item not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // App metadata operations
  async setMetadata(key: string, value: any): Promise<void> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['app_metadata'], 'readwrite');
    const store = transaction.objectStore('app_metadata');
    
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value, updatedAt: new Date().toISOString() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMetadata(key: string): Promise<any> {
    const db = await this.ensureDb();
    const transaction = db.transaction(['app_metadata'], 'readonly');
    const store = transaction.objectStore('app_metadata');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all data (for debugging/reset)
  async clearAll(): Promise<void> {
    const db = await this.ensureDb();
    const storeNames = ['menus', 'menu_entries', 'preset_meals', 'sync_queue', 'app_metadata'];
    const transaction = db.transaction(storeNames, 'readwrite');
    
    for (const storeName of storeNames) {
      transaction.objectStore(storeName).clear();
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorageManager(); 