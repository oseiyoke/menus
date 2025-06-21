'use client';

import React, { useState } from 'react';
import { Download, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { menuApi } from '@/lib/api/menus';
import { useLocalMenus } from '@/hooks/useLocalMenus';
import { Menu } from '@/lib/types';

interface ImportMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportMenuModal({ isOpen, onClose }: ImportMenuModalProps) {
  const [menuCode, setMenuCode] = useState('');
  const [editKey, setEditKey] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { addMenu } = useLocalMenus();

  const handleImport = async () => {
    if (!menuCode.trim()) {
      setError('Please enter a menu code');
      return;
    }

    setIsImporting(true);
    setError('');

    try {
      // Fetch the menu by short_id
      const menu: Menu | null = await menuApi.getByShortId(menuCode.trim());
      
      if (!menu) {
        setError('Menu not found. Please check the menu code.');
        return;
      }

      // If user entered an edit key, verify it
      if (editKey.trim() && menu.edit_key !== editKey.trim()) {
        setError('Invalid edit key. Please check and try again.');
        return;
      }

      // Add to local storage
      addMenu({
        id: menu.id,
        shortId: menu.short_id,
        name: menu.name || 'Imported Menu',
        description: menu.description,
        period_weeks: menu.period_weeks,
        editKey: editKey.trim() && menu.edit_key === editKey.trim() ? menu.edit_key : undefined,
        createdAt: menu.created_at,
      });

      setSuccess(true);
      
      // Close modal and refresh after success
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setMenuCode('');
        setEditKey('');

        // Reload page so landing/dashboard reflect the new menu immediately
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 1200);

    } catch (err) {
      console.error('Failed to import menu:', err);
      setError('Failed to import menu. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      onClose();
      setMenuCode('');
      setEditKey('');
      setError('');
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Import Menu</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Import a menu to your device using its menu code and edit key.
          </p>
          
          {success ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Menu imported successfully!</span>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="menu-code" className="block text-sm font-medium text-gray-700">
                  Menu Code
                </label>
                <input
                  id="menu-code"
                  type="text"
                  placeholder="e.g., nigerian-flavors"
                  value={menuCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMenuCode(e.target.value)}
                  disabled={isImporting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-key" className="block text-sm font-medium text-gray-700">
                  Edit Key
                </label>
                <input
                  id="edit-key"
                  type="text"
                  placeholder="Enter the edit key"
                  value={editKey}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditKey(e.target.value)}
                  disabled={isImporting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleImport}
                  disabled={isImporting || !menuCode.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Import
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> You can find the menu code and edit key in the url of any menu "http://menus.35x.dev/menu/_menucode_/"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 