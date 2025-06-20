import { useState, useEffect } from 'react';
import { usePWA } from '@/components/pwa/PWAProvider';
import { syncManager } from '@/lib/offline/SyncManager';

export interface NetworkStatus {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  isUpdateAvailable: boolean;
  syncStatus: {
    queueLength: number;
    lastSyncTime?: string;
    isSyncing: boolean;
  };
  install: () => Promise<void>;
  forceSync: () => Promise<void>;
  applyUpdate: () => void;
}

export function useNetworkStatus(): NetworkStatus {
  const { isOnline, isInstalled, canInstall, isUpdateAvailable, install, applyUpdate } = usePWA();
  const [syncStatus, setSyncStatus] = useState({
    queueLength: 0,
    lastSyncTime: undefined as string | undefined,
    isSyncing: false
  });

  // Update sync status periodically
  useEffect(() => {
    const updateSyncStatus = async () => {
      try {
        const status = await syncManager.getSyncStatus();
        setSyncStatus({
          queueLength: status.queueLength,
          lastSyncTime: status.lastSyncTime || undefined,
          isSyncing: status.isSyncing
        });
      } catch (error) {
        console.error('Failed to get sync status:', error);
      }
    };

    updateSyncStatus();
    
    // Update every 30 seconds
    const interval = setInterval(updateSyncStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  // Force sync function
  const forceSync = async () => {
    if (!isOnline) {
      throw new Error('Cannot sync while offline');
    }

    try {
      await syncManager.forcSync();
      // Update sync status after sync
      const status = await syncManager.getSyncStatus();
      setSyncStatus({
        queueLength: status.queueLength,
        lastSyncTime: status.lastSyncTime || undefined,
        isSyncing: status.isSyncing
      });
    } catch (error) {
      console.error('Force sync failed:', error);
      throw error;
    }
  };

  return {
    isOnline,
    isInstalled,
    canInstall,
    isUpdateAvailable,
    syncStatus,
    install,
    forceSync,
    applyUpdate
  };
}

// Simpler hook for just checking if the app is in offline mode
export function useOfflineMode() {
  const { isOnline } = usePWA();
  const [hasOfflineData, setHasOfflineData] = useState(false);

  useEffect(() => {
    // Check if there's any offline data available
    const checkOfflineData = async () => {
      try {
        const syncStatus = await syncManager.getSyncStatus();
        setHasOfflineData(syncStatus.queueLength > 0);
      } catch (error) {
        setHasOfflineData(false);
      }
    };

    checkOfflineData();
  }, []);

  return {
    isOffline: !isOnline,
    hasOfflineData,
    canWorkOffline: true // App is designed to work offline
  };
}

// Hook for getting installation status
export function useInstallationStatus() {
  const { isInstalled, canInstall, install } = usePWA();

  return {
    isInstalled,
    canInstall,
    needsInstallation: !isInstalled && canInstall,
    install
  };
} 