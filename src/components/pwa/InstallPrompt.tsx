'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWA } from './PWAProvider';
import { usePathname } from 'next/navigation';

export function InstallPrompt() {
  const { canInstall, isInstalled, install } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show on home page since we have a persistent prompt there
    if (pathname === '/') {
      return;
    }

    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    // Show prompt after a delay if conditions are met
    const timer = setTimeout(() => {
      if (canInstall && !isInstalled && !dismissed) {
        setShowPrompt(true);
      }
    }, 5000); // Show after 5 seconds

    return () => clearTimeout(timer);
  }, [canInstall, isInstalled, pathname]);

  const handleInstall = async () => {
    try {
      await install();
      setShowPrompt(false);
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Set a temporary dismiss that expires after 24 hours
    const expiry = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('pwa-install-remind-later', expiry.toString());
  };

  if (!showPrompt || isDismissed || isInstalled || pathname === '/') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Install Menu Planner</h3>
              <p className="text-sm text-gray-500">Add to your home screen</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Works offline</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Faster loading</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Easy access from home screen</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
          <button
            onClick={handleRemindLater}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

// Alternative compact version for different contexts
export function CompactInstallPrompt() {
  const { canInstall, isInstalled, install } = usePWA();

  if (!canInstall || isInstalled) {
    return null;
  }

  return (
    <button
      onClick={install}
      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
    >
      <Download className="w-4 h-4" />
      Install App
    </button>
  );
} 