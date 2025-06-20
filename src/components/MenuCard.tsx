import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, MoreVertical } from 'lucide-react';
import { LocalMenu } from '@/hooks/useLocalMenus';

interface MenuCardProps {
  menu: LocalMenu;
  onAccess: (menu: LocalMenu) => void;
}

export function MenuCard({ menu, onAccess }: MenuCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleCardClick = () => {
    onAccess(menu);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white border border-primary-100 rounded-xl p-5 hover:shadow-md hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-200 transition-colors">
            <Calendar className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-primary-600 transition-colors">
              {menu.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {menu.period_weeks} week{menu.period_weeks !== 1 ? 's' : ''} • {menu.period_weeks * 7} days
            </p>
            {menu.description && (
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {menu.description}
              </p>
            )}
          </div>
        </div>
        <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-surface-100 rounded-md transition-all">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Created {formatDate(menu.createdAt)}
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
          Active
        </div>
      </div>
    </div>
  );
} 