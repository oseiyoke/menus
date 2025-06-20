'use client';

import React, { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react';
import { useMenuByShortId } from '@/hooks/useMenu';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NotFound } from '@/components/ui/NotFound';
import { Unauthorized } from '@/components/ui/Unauthorized';

export default function ShareMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const shortId = params.shortId as string;
  const editKey = searchParams.get('key');
  
  const { data: menu, isLoading, error } = useMenuByShortId(shortId);
  const [copiedLinks, setCopiedLinks] = useState<{view: boolean, edit: boolean}>({
    view: false,
    edit: false
  });

  // Check if edit key is provided and valid
  const isAuthorized = editKey && menu?.edit_key === editKey;

  const copyToClipboard = async (text: string, type: 'view' | 'edit') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLinks(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopiedLinks(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getViewLink = () => {
    if (!menu) return '';
    return `${window.location.origin}/menu/${menu.short_id}`;
  };

  const getEditLink = () => {
    if (!menu) return '';
    return `${window.location.origin}/menu/${menu.short_id}/edit?key=${menu.edit_key}`;
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading menu..." />;
  }

  if (error || !menu) {
    return (
      <NotFound
        title="Menu Not Found"
        message="The menu you're looking for doesn't exist or has been deleted."
        actionText="Go Home"
        actionHref="/"
      />
    );
  }

  if (!isAuthorized) {
    return (
      <Unauthorized
        title="Access Denied"
        message="You don't have permission to share this menu. Please check your edit link."
        actionText="View Menu"
        actionHref={`/menu/${shortId}`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-full overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-4 p-5 border-b border-gray-100">
        <Link 
          href={`/menu/${shortId}/edit?key=${editKey}`}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Share Menu</h1>
          <p className="text-sm text-gray-500 mt-1 truncate">{menu.name}</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Share Links */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Share Your Menu</h2>
            
            {/* View Link */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">View Only Link</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Read Only
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Share this link with others so they can view your menu
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-mono truncate">
                  {getViewLink()}
                </div>
                <button
                  onClick={() => copyToClipboard(getViewLink(), 'view')}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors"
                >
                  {copiedLinks.view ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Edit Link */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">Edit Link</h3>
                <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                  Full Access
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Keep this private - anyone with this link can edit your menu
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-mono truncate">
                  {getEditLink()}
                </div>
                <button
                  onClick={() => copyToClipboard(getEditLink(), 'edit')}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors"
                >
                  {copiedLinks.edit ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Link */}
          <div className="pt-4 border-t border-gray-100">
            <Link
              href={`/menu/${shortId}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 