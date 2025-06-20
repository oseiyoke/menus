'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useMenuStore } from '@/lib/store';
import { menuApi } from '@/lib/api/menus';
import { copyToClipboard } from '@/lib/utils';

export default function ShareMenuPage() {
  const router = useRouter();
  const { currentMenu } = useMenuStore();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!currentMenu) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No menu found</p>
          <Link href="/create" className="text-blue-600 hover:underline">
            Create a new menu
          </Link>
        </div>
      </div>
    );
  }

  const shareLinks = menuApi.generateShareLinks(currentMenu);

  const handleCopyLink = async (link: string, linkType: string) => {
    try {
      await copyToClipboard(link);
      setCopiedLink(linkType);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 p-5 border-b border-gray-100">
        <Link 
          href="/create"
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Share Menu</h1>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>

        {/* Title and Subtitle */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
          Menu Saved!
        </h2>
        <p className="text-gray-600 mb-8 text-center max-w-sm">
          Your menu has been saved. Share it with anyone using the links below.
        </p>

        {/* Links */}
        <div className="w-full max-w-md space-y-6">
          {/* View-only Link */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              View-only link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLinks.view_link}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm font-mono"
              />
              <button
                onClick={() => handleCopyLink(shareLinks.view_link, 'view')}
                className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                {copiedLink === 'view' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-sm font-medium">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Edit Link */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Edit link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLinks.edit_link}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm font-mono"
              />
              <button
                onClick={() => handleCopyLink(shareLinks.edit_link, 'edit')}
                className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                {copiedLink === 'edit' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-sm font-medium">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Create Another Menu Button */}
        <div className="mt-12 w-full max-w-md">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Create Another Menu
          </Link>
        </div>
      </div>
    </div>
  );
} 