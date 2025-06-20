'use client';

import React from 'react';
import { RefreshCw, X, Download } from 'lucide-react';
import { usePWA } from './PWAProvider';

export function UpdateNotification() {
  const { isUpdateAvailable, applyUpdate, skipUpdate } = usePWA();

  if (!isUpdateAvailable) return null;

  const handleUpdate = () => {
    applyUpdate();
  };

  const handleSkip = () => {
    skipUpdate();
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-blue-600 text-white rounded-2xl shadow-xl p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold">Update Available</h3>
              <p className="text-sm text-blue-100">A new version of Menu Planner is ready</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits */}
        <div className="mb-4">
          <ul className="text-sm text-blue-100 space-y-1">
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 bg-blue-200 rounded-full" />
              <span>Bug fixes and improvements</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 bg-blue-200 rounded-full" />
              <span>Better performance</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 bg-blue-200 rounded-full" />
              <span>New features</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-xl font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Update Now
          </button>
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-blue-200 hover:text-white transition-colors text-sm"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact version for different contexts
export function CompactUpdateNotification() {
  const { isUpdateAvailable, applyUpdate } = usePWA();

  if (!isUpdateAvailable) return null;

  return (
    <button
      onClick={applyUpdate}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
    >
      <RefreshCw className="w-3 h-3" />
      Update Available
    </button>
  );
} 