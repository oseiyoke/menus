import { syncManager } from '@/lib/offline/SyncManager';
import { offlineStorage } from '@/lib/offline/OfflineStorage';

export interface PWACapabilities {
  canInstall: boolean;
  isInstalled: boolean;
  hasServiceWorker: boolean;
  isOnline: boolean;
  supportsNotifications: boolean;
  supportsBackgroundSync: boolean;
}

export interface DeviceInfo {
  platform: 'iOS' | 'Android' | 'Desktop' | 'Unknown';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Other';
  isMobile: boolean;
  supportsInstall: boolean;
}

/**
 * Detect PWA capabilities of the current environment
 */
export function detectPWACapabilities(): PWACapabilities {
  if (typeof window === 'undefined') {
    return {
      canInstall: false,
      isInstalled: false,
      hasServiceWorker: false,
      isOnline: false,
      supportsNotifications: false,
      supportsBackgroundSync: false,
    };
  }

  return {
    canInstall: 'BeforeInstallPromptEvent' in window,
    isInstalled: window.matchMedia('(display-mode: standalone)').matches ||
                 ('standalone' in navigator && (navigator as any).standalone),
    hasServiceWorker: 'serviceWorker' in navigator,
    isOnline: navigator.onLine,
    supportsNotifications: 'Notification' in window,
    supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
  };
}

/**
 * Detect device and browser information
 */
export function detectDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      platform: 'Unknown',
      browser: 'Other',
      isMobile: false,
      supportsInstall: false,
    };
  }

  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  // Detect platform
  let detectedPlatform: DeviceInfo['platform'] = 'Unknown';
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    detectedPlatform = 'iOS';
  } else if (/Android/.test(userAgent)) {
    detectedPlatform = 'Android';
  } else if (/Win|Mac|Linux/.test(platform)) {
    detectedPlatform = 'Desktop';
  }

  // Detect browser
  let detectedBrowser: DeviceInfo['browser'] = 'Other';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    detectedBrowser = 'Chrome';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    detectedBrowser = 'Safari';
  } else if (userAgent.includes('Firefox')) {
    detectedBrowser = 'Firefox';
  } else if (userAgent.includes('Edg')) {
    detectedBrowser = 'Edge';
  }

  const isMobile = detectedPlatform === 'iOS' || detectedPlatform === 'Android';
  
  // Determine install support
  const supportsInstall = (
    (detectedPlatform === 'Android' && detectedBrowser === 'Chrome') ||
    (detectedPlatform === 'Desktop' && (detectedBrowser === 'Chrome' || detectedBrowser === 'Edge')) ||
    (detectedPlatform === 'iOS' && detectedBrowser === 'Safari') ||
    detectedBrowser === 'Firefox'
  );

  return {
    platform: detectedPlatform,
    browser: detectedBrowser,
    isMobile,
    supportsInstall,
  };
}

/**
 * Check if the app should show install prompts
 */
export function shouldShowInstallPrompt(): boolean {
  if (typeof window === 'undefined') return false;

  const capabilities = detectPWACapabilities();
  const deviceInfo = detectDeviceInfo();
  
  // Don't show if already installed
  if (capabilities.isInstalled) return false;
  
  // Don't show if device doesn't support installation
  if (!deviceInfo.supportsInstall) return false;
  
  // Check if user has dismissed the prompt
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (dismissed) return false;
  
  // Check if in remind-later period
  const remindLater = localStorage.getItem('pwa-install-remind-later');
  if (remindLater && Date.now() < parseInt(remindLater)) return false;

  return true;
}

/**
 * Get installation instructions for the current device/browser
 */
export function getInstallationInstructions(): {
  title: string;
  steps: string[];
  canAutoInstall: boolean;
} {
  const deviceInfo = detectDeviceInfo();
  const { platform, browser } = deviceInfo;

  if (platform === 'iOS' && browser === 'Safari') {
    return {
      title: 'Install on iOS Safari',
      steps: [
        'Tap the Share button (square with arrow)',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to confirm'
      ],
      canAutoInstall: false
    };
  }

  if (platform === 'Android' && browser === 'Chrome') {
    return {
      title: 'Install on Android Chrome',
      steps: [
        'Look for the "Install" button in the address bar',
        'Or tap the menu (⋮) and select "Install app"',
        'Confirm the installation'
      ],
      canAutoInstall: true
    };
  }

  if (platform === 'Desktop' && (browser === 'Chrome' || browser === 'Edge')) {
    return {
      title: `Install on ${browser}`,
      steps: [
        'Look for the install icon in the address bar',
        'Click "Install" button',
        'Confirm the installation'
      ],
      canAutoInstall: true
    };
  }

  return {
    title: 'Install the App',
    steps: [
      'Look for "Install app" or "Add to Home Screen" in your browser menu',
      'Follow the prompts to install',
      'For best experience, use Chrome, Safari, or Firefox'
    ],
    canAutoInstall: false
  };
}

/**
 * Format time difference for sync status
 */
export function formatTimeDifference(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  
  return time.toLocaleDateString();
}

/**
 * Get PWA storage usage information
 */
export async function getStorageInfo(): Promise<{
  used: number;
  available: number;
  percentage: number;
  menuCount: number;
  mealCount: number;
}> {
  try {
    // Get storage estimate
    let used = 0;
    let available = 100 * 1024 * 1024; // Default 100MB estimate
    
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      used = estimate.usage || 0;
      available = estimate.quota || available;
    }

    // Get menu and meal counts
    const menus = await offlineStorage.getAllMenus();
    const meals = await offlineStorage.getPresetMeals();

    return {
      used,
      available,
      percentage: Math.round((used / available) * 100),
      menuCount: menus.length,
      mealCount: meals.length,
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return {
      used: 0,
      available: 0,
      percentage: 0,
      menuCount: 0,
      mealCount: 0,
    };
  }
}

/**
 * Clear all PWA data (for reset/debugging)
 */
export async function clearPWAData(): Promise<void> {
  try {
    // Clear offline storage
    await offlineStorage.clearAll();
    
    // Clear localStorage
    localStorage.removeItem('user-menus');
    localStorage.removeItem('pwa-install-dismissed');
    localStorage.removeItem('pwa-install-remind-later');
    localStorage.removeItem('menu_user_fp');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    console.log('✅ All PWA data cleared');
  } catch (error) {
    console.error('❌ Failed to clear PWA data:', error);
    throw error;
  }
}

/**
 * Download user menus for offline access
 */
export async function downloadMenusForOffline(): Promise<void> {
  if (!navigator.onLine) {
    throw new Error('Cannot download menus while offline');
  }

  try {
    const userFingerprint = localStorage.getItem('menu_user_fp') || 'anonymous';
    await syncManager.downloadUserMenus(userFingerprint);
  } catch (error) {
    console.error('Failed to download menus for offline:', error);
    throw error;
  }
}

/**
 * Request notification permission if not already granted
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Show a test notification (for testing PWA notifications)
 */
export async function showTestNotification(): Promise<void> {
  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  new Notification('Menu Planner', {
    body: 'PWA notifications are working! 🎉',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'test-notification',
  });
}

/**
 * Check if the app is running in standalone mode
 */
export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as any).standalone) ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Get PWA health status
 */
export async function getPWAHealthStatus(): Promise<{
  isHealthy: boolean;
  issues: string[];
  suggestions: string[];
}> {
  const issues: string[] = [];
  const suggestions: string[] = [];

  try {
    const capabilities = detectPWACapabilities();
    const deviceInfo = detectDeviceInfo();
    const syncStatus = await syncManager.getSyncStatus();

    // Check service worker
    if (!capabilities.hasServiceWorker) {
      issues.push('Service Worker not supported');
    }

    // Check if offline
    if (!capabilities.isOnline) {
      issues.push('Currently offline');
      suggestions.push('Connect to internet to sync latest data');
    }

    // Check sync queue
    if (syncStatus.queueLength > 5) {
      issues.push(`${syncStatus.queueLength} items pending sync`);
      suggestions.push('Connect to internet to sync pending changes');
    }

    // Check installation status
    if (!capabilities.isInstalled && deviceInfo.supportsInstall) {
      suggestions.push('Install the app for better offline experience');
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      suggestions
    };
  } catch (error) {
    return {
      isHealthy: false,
      issues: ['Failed to check PWA health'],
      suggestions: ['Try refreshing the app']
    };
  }
} 