'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Copy, Calendar, ArrowRight } from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import { useLocalMenus } from '@/hooks/useLocalMenus';

export default function MenuSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const menuId = params.menuId as string;
  const { menu, isLoading } = useMenu(menuId);
  const { addMenu } = useLocalMenus();
  const [copiedLinks, setCopiedLinks] = useState<{view: boolean, edit: boolean}>({
    view: false,
    edit: false
  });

  // Add menu to local storage when it loads
  useEffect(() => {
    if (menu) {
      addMenu({
        id: menu.id,
        shortId: menu.short_id,
        name: menu.name || 'Untitled Menu',
        description: menu.description,
        period_weeks: menu.period_weeks,
        createdAt: menu.created_at,
        editKey: menu.edit_key,
      });
    }
  }, [menu, addMenu]);

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
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your menu...</p>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Menu Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find your menu. It may have been deleted or doesn't exist.</p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-400 text-white font-semibold rounded-xl hover:bg-primary-500 transition-colors shadow-sm"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Success Header */}
      <div className="bg-gradient-to-br from-primary-50 to-accent-50 border-b border-primary-100 py-8">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-primary-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu Created Successfully!</h1>
          <p className="text-gray-600">
            Your {menu.period_weeks}-week menu "{menu.name}" is ready to use.
          </p>
        </div>
      </div>

      {/* Menu Details */}
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Menu Info Card */}
          <div className="bg-white border border-primary-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0 text-center">
                <h3 className="font-semibold text-gray-900 mb-1">{menu.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {menu.period_weeks} week{menu.period_weeks !== 1 ? 's' : ''} • {menu.period_weeks * 7} days
                </p>
                {menu.description && (
                  <p className="text-sm text-gray-600">{menu.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Share Links */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Share Your Menu</h2>
            
            {/* View Link */}
            <div className="bg-white border border-primary-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">View Only Link</h3>
                <span className="text-xs text-gray-500 bg-surface-100 px-2 py-1 rounded-full">
                  Read Only
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Share this link with others so they can view your menu
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-surface-50 border border-primary-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-mono truncate">
                  {getViewLink()}
                </div>
                <button
                  onClick={() => copyToClipboard(getViewLink(), 'view')}
                  className="px-3 py-2 bg-surface-100 hover:bg-surface-200 border border-primary-200 rounded-lg transition-colors"
                >
                  {copiedLinks.view ? (
                    <Check className="w-4 h-4 text-primary-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Edit Link */}
            <div className="bg-white border border-primary-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">Edit Link</h3>
                <span className="text-xs text-accent-800 bg-accent-100 px-2 py-1 rounded-full">
                  Full Access
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Keep this private - anyone with this link can edit your menu
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-surface-50 border border-primary-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-mono truncate">
                  {getEditLink()}
                </div>
                <button
                  onClick={() => copyToClipboard(getEditLink(), 'edit')}
                  className="px-3 py-2 bg-surface-100 hover:bg-surface-200 border border-primary-200 rounded-lg transition-colors"
                >
                  {copiedLinks.edit ? (
                    <Check className="w-4 h-4 text-primary-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 pt-0">
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={() => router.push(`/menu/${menu.short_id}/edit?key=${menu.edit_key}`)}
            className="w-full px-6 py-3 bg-primary-400 text-white font-semibold rounded-xl hover:bg-primary-500 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            Start Adding Meals
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <Link
            href="/"
            className="w-full px-6 py-3 border border-primary-200 text-gray-700 font-medium rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 