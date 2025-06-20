import React from 'react';
import { Wifi, WifiOff, Download, HardDrive, Smartphone } from 'lucide-react';
import { detectPWACapabilities, getStorageInfo } from '@/lib/pwa/utils';

interface PWAStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function PWAStatus({ showDetails = false, className = '' }: PWAStatusProps) {
  const [pwaCapabilities, setPwaCapabilities] = React.useState(detectPWACapabilities());
  const [storageInfo, setStorageInfo] = React.useState<{
    used: number;
    available: number;
    percentage: number;
    menuCount: number;
    mealCount: number;
  } | null>(null);

  React.useEffect(() => {
    getStorageInfo().then(setStorageInfo);
    // Update PWA capabilities periodically
    const interval = setInterval(() => {
      setPwaCapabilities(detectPWACapabilities());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (!showDetails) {
    // Compact status indicator
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          {pwaCapabilities.isOnline ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-orange-600" />
          )}
          <span className="text-xs text-gray-600">
            {pwaCapabilities.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {pwaCapabilities.isInstalled && (
          <div className="flex items-center gap-1">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600">Installed</span>
          </div>
        )}
      </div>
    );
  }

  // Detailed status view
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <h3 className="font-medium text-gray-900 mb-3">App Status</h3>
      
      <div className="space-y-3">
        {/* Network Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {pwaCapabilities.isOnline ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-orange-600" />
            )}
            <span className="text-sm text-gray-700">Network</span>
          </div>
          <span className={`text-sm font-medium ${pwaCapabilities.isOnline ? 'text-green-600' : 'text-orange-600'}`}>
            {pwaCapabilities.isOnline ? 'Connected' : 'Offline'}
          </span>
        </div>

        {/* Installation Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700">App Installation</span>
          </div>
          <span className={`text-sm font-medium ${pwaCapabilities.isInstalled ? 'text-green-600' : 'text-gray-500'}`}>
            {pwaCapabilities.isInstalled ? 'Installed' : 'Not Installed'}
          </span>
        </div>

        {/* Service Worker Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Offline Support</span>
          </div>
          <span className={`text-sm font-medium ${pwaCapabilities.hasServiceWorker ? 'text-green-600' : 'text-gray-500'}`}>
            {pwaCapabilities.hasServiceWorker ? 'Active' : 'Not Available'}
          </span>
        </div>

        {/* Storage Info */}
        {storageInfo && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Storage</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900">
                {formatBytes(storageInfo.used)} used
              </span>
              <div className="text-xs text-gray-500">
                {storageInfo.menuCount} menus, {storageInfo.mealCount} meals
              </div>
            </div>
          </div>
        )}

        {/* Offline Capabilities */}
        {!pwaCapabilities.isOnline && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="text-sm font-medium text-orange-800 mb-1">
              Offline Mode Active
            </h4>
            <p className="text-xs text-orange-700">
              You can still create and edit menus. Changes will sync when you're back online.
            </p>
          </div>
        )}

        {/* PWA Benefits */}
        {!pwaCapabilities.isInstalled && pwaCapabilities.canInstall && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Install for Better Experience
            </h4>
            <p className="text-xs text-blue-700">
              Install the app for faster loading, offline access, and home screen convenience.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 