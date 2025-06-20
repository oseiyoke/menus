import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TagsInput } from '@/components/ui/TagsInput';
import type { Menu } from '@/lib/types';
import { MENU_TAGS } from '@/lib/constants';

interface MenuSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: Menu;
  onSave: (data: { name: string; description?: string; is_discoverable?: boolean; discovery_tags?: string[] }) => void;
  isSaving?: boolean;
}

export function MenuSettingsModal({ 
  isOpen, 
  onClose, 
  menu, 
  onSave, 
  isSaving = false 
}: MenuSettingsModalProps) {
  const [name, setName] = useState(menu.name || '');
  const [description, setDescription] = useState(menu.description || '');
  const [isDiscoverable, setIsDiscoverable] = useState(menu.is_discoverable || false);
  const [discoveryTags, setDiscoveryTags] = useState<string[]>(menu.discovery_tags || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      is_discoverable: isDiscoverable,
      discovery_tags: discoveryTags.length > 0 ? discoveryTags : undefined,
    });
  };

  const handleClose = () => {
    // Reset form to original values
    setName(menu.name || '');
    setDescription(menu.description || '');
    setIsDiscoverable(menu.is_discoverable || false);
    setDiscoveryTags(menu.discovery_tags || []);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Edit Menu</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Menu Name */}
            <div>
              <label htmlFor="menu-name" className="block text-sm font-medium text-gray-700 mb-2">
                Menu Name *
              </label>
              <input
                id="menu-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter menu name"
                required
                disabled={isSaving}
              />
            </div>

            {/* Menu Description */}
            <div>
              <label htmlFor="menu-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="menu-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter menu description (optional)"
                disabled={isSaving}
              />
            </div>

            {/* Discovery Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="font-medium text-gray-900">Discovery Settings</h4>
              
              <div className="flex items-start gap-3">
                <input
                  id="discoverable"
                  type="checkbox"
                  checked={isDiscoverable}
                  onChange={(e) => setIsDiscoverable(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isSaving}
                />
                <div className="flex-1">
                  <label htmlFor="discoverable" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Make discoverable
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Allow others to find and star your menu in the discover section
                  </p>
                </div>
              </div>

              {isDiscoverable && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (help others find your menu)
                  </label>
                  <TagsInput
                    tags={discoveryTags}
                    onTagsChange={setDiscoveryTags}
                    suggestions={[...MENU_TAGS]}
                    placeholder="Add tags like 'healthy', 'quick', 'vegetarian'..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving || !name.trim()}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 