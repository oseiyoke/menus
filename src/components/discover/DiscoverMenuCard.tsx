'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Eye, User } from 'lucide-react';
import { StarButton } from '@/components/ui/StarButton';
import { useToggleMenuStar } from '@/hooks/useDiscover';
import type { Menu } from '@/lib/types';

interface DiscoverMenuCardProps {
  menu: Menu;
}

export function DiscoverMenuCard({ menu }: DiscoverMenuCardProps) {
  const toggleStarMutation = useToggleMenuStar();

  const handleToggleStar = () => {
    toggleStarMutation.mutate(menu.id);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <Link href={`/menu/${menu.short_id}`} className="block">
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                {menu.name}
              </h3>
              {menu.description && (
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {menu.description}
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          {menu.discovery_tags && menu.discovery_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {menu.discovery_tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                >
                  {tag}
                </span>
              ))}
              {menu.discovery_tags.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{menu.discovery_tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{menu.period_weeks} week{menu.period_weeks !== 1 ? 's' : ''}</span>
              </div>
              
              {menu.view_count && menu.view_count > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{menu.view_count}</span>
                </div>
              )}

              {menu.created_by && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="truncate max-w-20">{menu.created_by}</span>
                </div>
              )}
            </div>

            <StarButton
              isStarred={menu.is_starred || false}
              starCount={menu.star_count || 0}
              onToggle={handleToggleStar}
              disabled={toggleStarMutation.isPending}
              size="sm"
            />
          </div>
        </div>
      </Link>
    </div>
  );
} 