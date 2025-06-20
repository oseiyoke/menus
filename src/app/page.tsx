'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HelpCircle, X } from 'lucide-react';
import { useLocalMenus } from '@/hooks/useLocalMenus';
import { MenuDashboard } from '@/components/MenuDashboard';
import { usePWA } from '@/components/pwa/PWAProvider';
import { CompactInstallPrompt } from '@/components/pwa/InstallPrompt';
import { InstallGuideModal } from '@/components/pwa/InstallGuideModal';
import { PWAStatus } from '@/components/PWAStatus';

function LandingPage() {
  const { isInstalled, canInstall } = usePWA();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showPersistentPrompt, setShowPersistentPrompt] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the persistent prompt
    const dismissed = localStorage.getItem('pwa-persistent-prompt-dismissed');
    if (!dismissed && !isInstalled) {
      setShowPersistentPrompt(true);
    }
  }, [isInstalled]);

  const handleDismissPersistentPrompt = () => {
    setShowPersistentPrompt(false);
    localStorage.setItem('pwa-persistent-prompt-dismissed', 'true');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-primary-50 to-accent-50 relative">
      <div className="text-center max-w-md w-full">
        {/* App Logo using favicon design */}
        <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg border-2 border-green-200">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#86EFAC" stroke="#22C55E" strokeWidth="2"/>
            <circle cx="16" cy="16" r="8" fill="#FFFFFF" stroke="#22C55E" strokeWidth="1"/>
            <path d="M11 8 L11 12 M9 8 L9 12 M13 8 L13 12 M11 12 L11 16" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M21 8 L21 16 M19 10 L21 8" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        
        {/* Title and Description */}
        <h1 className="text-3xl font-bold mb-3 text-gray-900">Menu Planner</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Plan your meals for the week with ease. Create, organize, and share your menu in minutes.
        </p>

        
        {/* Action Buttons - Fixed centering with proper width */}
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
          <Link 
            href="/create"
            className="flex w-full items-center justify-center px-8 py-3 bg-primary-400 text-white font-semibold rounded-xl hover:bg-primary-500 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
          >
            Create Menu
          </Link>
          
          <Link 
            href="/discover"
            className="flex w-full items-center justify-center px-8 py-3 border-2 border-primary-200 text-primary-600 font-medium rounded-xl hover:border-primary-300 hover:bg-primary-50 transform hover:-translate-y-0.5 transition-all duration-200 gap-2"
          >
            <span className="text-accent-400">⭐</span>
            Discover Menus
          </Link>
        </div>
      </div>

      {/* Persistent PWA Install Prompt at Bottom - Always show if not installed and not dismissed */}
      {!isInstalled && showPersistentPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-sm">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Install Menu Planner</h3>
                  <p className="text-sm text-gray-500">Add to your home screen</p>
                </div>
              </div>
              <button
                onClick={handleDismissPersistentPrompt}
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
              {canInstall ? (
                <CompactInstallPrompt />
              ) : (
                <button
                  onClick={() => setShowInstallGuide(true)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  How to Install
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Install Guide Modal */}
      <InstallGuideModal 
        isOpen={showInstallGuide} 
        onClose={() => setShowInstallGuide(false)} 
      />
    </main>
  );
}

export default function HomePage() {
  const { recentMenus, hasMenus, isLoading } = useLocalMenus();
  const { isInstalled } = usePWA();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showPersistentPrompt, setShowPersistentPrompt] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the persistent prompt
    const dismissed = localStorage.getItem('pwa-persistent-prompt-dismissed');
    if (!dismissed && !isInstalled && hasMenus) {
      setShowPersistentPrompt(true);
    }
  }, [isInstalled, hasMenus]);

  const handleDismissPersistentPrompt = () => {
    setShowPersistentPrompt(false);
    localStorage.setItem('pwa-persistent-prompt-dismissed', 'true');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your menus...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {hasMenus ? <MenuDashboard menus={recentMenus} /> : <LandingPage />}
      
      {/* Persistent PWA install prompt - show on dashboard if not installed and not dismissed */}
      {!isInstalled && hasMenus && showPersistentPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-sm">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Install Menu Planner</h3>
                  <p className="text-sm text-gray-500">Add to your home screen</p>
                </div>
              </div>
              <button
                onClick={handleDismissPersistentPrompt}
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
              <CompactInstallPrompt />
              <button
                onClick={() => setShowInstallGuide(true)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                How to Install
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install Guide Modal */}
      <InstallGuideModal 
        isOpen={showInstallGuide} 
        onClose={() => setShowInstallGuide(false)} 
      />
    </>
  );
} 