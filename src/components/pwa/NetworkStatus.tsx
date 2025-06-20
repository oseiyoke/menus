'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff, AlertCircle } from 'lucide-react';
import { usePWA } from './PWAProvider';
import { syncManager } from '@/lib/offline/SyncManager';

export function NetworkStatus() {
  const { isOnline } = usePWA();
  const [syncStatus, setSyncStatus] = useState({
    queueLength: 0,
    lastSyncTime: null as string | null,
    isSyncing: false
  });
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const updateSyncStatus = async () => {
      try {
        const status = await syncManager.getSyncStatus();
        setSyncStatus({
          queueLength: status.queueLength,
          lastSyncTime: status.lastSyncTime || null,
          isSyncing: status.isSyncing
        });
      } catch (error) {
        console.error('Failed to get sync status:', error);
      }
    };

    updateSyncStatus();
    
    // Update sync status every 10 seconds
    const interval = setInterval(updateSyncStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleForceSync = async () => {
    if (!isOnline) return;

    try {
      await syncManager.forcSync();
             const status = await syncManager.getSyncStatus();
       setSyncStatus({
         queueLength: status.queueLength,
         lastSyncTime: status.lastSyncTime || null,
         isSyncing: status.isSyncing
       });
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  };

  const formatLastSync = (lastSyncTime: string | null) => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const syncTime = new Date(lastSyncTime);
    const diffMs = now.getTime() - syncTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (syncStatus.queueLength > 0) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (syncStatus.isSyncing) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (syncStatus.queueLength > 0) return <CloudOff className="w-4 h-4" />;
    return <Cloud className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncStatus.isSyncing) return 'Syncing...';
    if (syncStatus.queueLength > 0) return `${syncStatus.queueLength} pending`;
    return 'All synced';
  };

  return (
    <>
      {/* Compact Status Indicator */}
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setShowDetail(true)}
      >
        <div className={`${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        <span className={`text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Detailed Status Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`${getStatusColor()}`}>
                  {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isOnline ? 'Online' : 'Offline'}
                  </h3>
                  <p className="text-sm text-gray-500">Connection status</p>
                </div>
              </div>
            </div>

            {/* Status Details */}
            <div className="p-6 space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Network</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium">
                    {isOnline ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* Sync Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sync Status</span>
                <div className="flex items-center gap-2">
                  {syncStatus.isSyncing ? (
                    <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                  ) : syncStatus.queueLength > 0 ? (
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Cloud className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-sm font-medium">
                    {syncStatus.isSyncing ? 'Syncing' : 
                     syncStatus.queueLength > 0 ? 'Pending' : 'Up to date'}
                  </span>
                </div>
              </div>

              {/* Pending Changes */}
              {syncStatus.queueLength > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Changes</span>
                  <span className="text-sm font-medium text-orange-600">
                    {syncStatus.queueLength} item{syncStatus.queueLength !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Last Sync */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Sync</span>
                <span className="text-sm font-medium">
                  {formatLastSync(syncStatus.lastSyncTime)}
                </span>
              </div>

              {/* Offline Mode Info */}
              {!isOnline && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">Working offline</p>
                      <p className="text-sm text-orange-700 mt-1">
                        Your changes are saved locally and will sync when you're back online.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-100 space-y-3">
              {isOnline && syncStatus.queueLength > 0 && (
                <button
                  onClick={handleForceSync}
                  disabled={syncStatus.isSyncing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                  {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
              )}
              
              <button
                onClick={() => setShowDetail(false)}
                className="w-full px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Minimal status indicator for nav bars
export function NetworkStatusIndicator() {
  const { isOnline } = usePWA();
  const [syncStatus, setSyncStatus] = useState({ queueLength: 0, isSyncing: false });

  useEffect(() => {
    const updateSyncStatus = async () => {
      try {
        const status = await syncManager.getSyncStatus();
        setSyncStatus({ queueLength: status.queueLength, isSyncing: status.isSyncing });
      } catch (error) {
        console.error('Failed to get sync status:', error);
      }
    };

    updateSyncStatus();
    const interval = setInterval(updateSyncStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline && syncStatus.queueLength === 0 && !syncStatus.isSyncing) {
    return null; // Don't show anything when everything is fine
  }

  return (
    <div className="flex items-center gap-1">
      {!isOnline ? (
        <WifiOff className="w-4 h-4 text-red-500" />
      ) : syncStatus.isSyncing ? (
        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      ) : syncStatus.queueLength > 0 ? (
        <CloudOff className="w-4 h-4 text-orange-500" />
      ) : null}
    </div>
  );
} 