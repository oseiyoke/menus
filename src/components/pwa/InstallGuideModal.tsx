'use client';

import React, { useState, useEffect } from 'react';
import { X, Smartphone, Monitor, Tablet, Chrome, Globe, MoreHorizontal } from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeviceInfo {
  platform: 'iOS' | 'Android' | 'Desktop' | 'Unknown';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Other';
  isMobile: boolean;
}

export function InstallGuideModal({ isOpen, onClose }: InstallGuideModalProps) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: 'Unknown',
    browser: 'Other',
    isMobile: false
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

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

    setDeviceInfo({
      platform: detectedPlatform,
      browser: detectedBrowser,
      isMobile
    });
  }, []);

  if (!isOpen) return null;

  const renderInstallInstructions = () => {
    const { platform, browser } = deviceInfo;

    // iOS Safari
    if (platform === 'iOS' && browser === 'Safari') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                         <Globe className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">Safari on iOS</h4>
              <p className="text-sm text-blue-700">Follow these steps to install the app</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Tap the Share button</p>
                <p className="text-sm text-gray-600">Look for the share icon at the bottom of Safari</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Select "Add to Home Screen"</p>
                <p className="text-sm text-gray-600">Scroll down in the share menu to find this option</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Tap "Add"</p>
                <p className="text-sm text-gray-600">Confirm the installation by tapping Add</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Android Chrome
    if (platform === 'Android' && browser === 'Chrome') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
            <Chrome className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">Chrome on Android</h4>
              <p className="text-sm text-green-700">Install directly from the browser</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Look for the "Install" button</p>
                <p className="text-sm text-gray-600">It should appear in the address bar or as a banner</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Tap "Install"</p>
                <p className="text-sm text-gray-600">Or tap the menu (⋮) and select "Install app"</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Confirm installation</p>
                <p className="text-sm text-gray-600">The app will be added to your home screen</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Desktop Chrome/Edge
    if (platform === 'Desktop' && (browser === 'Chrome' || browser === 'Edge')) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
            <Monitor className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">{browser} on Desktop</h4>
              <p className="text-sm text-blue-700">Install from the address bar</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Look for the install icon</p>
                <p className="text-sm text-gray-600">Check the right side of the address bar for an install button</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Click "Install"</p>
                <p className="text-sm text-gray-600">Or use the menu → "Install Menu Planner"</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Confirm installation</p>
                <p className="text-sm text-gray-600">The app will open in its own window</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Firefox (any platform)
    if (browser === 'Firefox') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                         <Globe className="w-6 h-6 text-orange-600" />
            <div>
              <h4 className="font-medium text-orange-900">Firefox</h4>
              <p className="text-sm text-orange-700">Add to home screen or bookmarks</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Open the menu</p>
                <p className="text-sm text-gray-600">Tap the menu button (☰) in Firefox</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Select "Install"</p>
                <p className="text-sm text-gray-600">Look for "Install" or "Add to Home Screen" option</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Confirm</p>
                <p className="text-sm text-gray-600">The app shortcut will be created</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fallback for other browsers
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <MoreHorizontal className="w-6 h-6 text-gray-600" />
          <div>
            <h4 className="font-medium text-gray-900">Other Browser</h4>
            <p className="text-sm text-gray-700">General installation instructions</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="font-medium">Look for install options</p>
              <p className="text-sm text-gray-600">Check your browser menu for "Install app" or "Add to Home Screen"</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <p className="font-medium">Add a bookmark</p>
              <p className="text-sm text-gray-600">Alternatively, bookmark this page for quick access</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <p className="font-medium">Use a supported browser</p>
              <p className="text-sm text-gray-600">For the best experience, try Chrome, Safari, or Firefox</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getPlatformIcon = () => {
    switch (deviceInfo.platform) {
      case 'iOS':
        return <Smartphone className="w-5 h-5" />;
      case 'Android':
        return <Smartphone className="w-5 h-5" />;
      case 'Desktop':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Tablet className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {getPlatformIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Install Menu Planner</h2>
              <p className="text-sm text-gray-500">
                {deviceInfo.platform} • {deviceInfo.browser}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Benefits Banner */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-green-900 mb-2">Why install the app?</h3>
            <ul className="space-y-1 text-sm text-green-800">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                <span>Works offline - access your menus anywhere</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                <span>Faster loading and better performance</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                <span>Native app experience</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                <span>Easy access from your home screen</span>
              </li>
            </ul>
          </div>

          {/* Installation Instructions */}
          {renderInstallInstructions()}

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">
              <strong>Need help?</strong> If you don't see an install option, try refreshing the page 
              or check if your browser supports Progressive Web Apps (PWAs).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
} 