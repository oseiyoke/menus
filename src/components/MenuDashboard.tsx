import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { MenuCard } from './MenuCard';
import { LocalMenu, useLocalMenus } from '@/hooks/useLocalMenus';

interface MenuDashboardProps {
  menus: LocalMenu[];
}

export function MenuDashboard({ menus }: MenuDashboardProps) {
  const router = useRouter();
  const { updateLastAccessed } = useLocalMenus();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');

  const handleMenuAccess = (menu: LocalMenu) => {
    updateLastAccessed(menu.id);
    if (menu.editKey) {
      router.push(`/menu/${menu.shortId}/edit?key=${menu.editKey}`);
    } else {
      router.push(`/menu/${menu.shortId}`);
    }
  };

  const filteredMenus = menus.filter(menu => {
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (menu.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesFilter = selectedFilter === 'all' || menu.period_weeks.toString() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getFilterLabel = (weeks: '1' | '2' | '3' | '4') => {
    return `${weeks} Week${weeks !== '1' ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-primary-100 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Menus</h1>
              <p className="text-gray-600 mt-1">
                {menus.length} menu{menus.length !== 1 ? 's' : ''} created
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Menu Grid */}
        {filteredMenus.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenus.map((menu) => (
                <MenuCard
                  key={menu.id}
                  menu={menu}
                  onAccess={handleMenuAccess}
                />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-400 text-white font-medium rounded-lg hover:bg-primary-500 transition-colors shadow-sm min-w-[170px]"
              >
                <Plus className="w-4 h-4" />
                New Menu
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary-200 text-primary-600 font-medium rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors shadow-sm min-w-[170px]"
              >
                <span className="text-accent-400">⭐</span>
                Discover Menus
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || selectedFilter !== 'all' ? 'No menus found' : 'No menus yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first menu to get started with meal planning'
              }
            </p>
            {(!searchQuery && selectedFilter === 'all') && (
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-400 text-white font-medium rounded-lg hover:bg-primary-500 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Your First Menu
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 