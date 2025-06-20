'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DiscoverMenuCard } from './DiscoverMenuCard';
import { useDiscoverMenus } from '@/hooks/useDiscover';
import type { DiscoverMenusFilters } from '@/lib/types';

interface DiscoverMenusGridProps {
  filters: DiscoverMenusFilters;
}

export function DiscoverMenusGrid({ filters }: DiscoverMenusGridProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useDiscoverMenus(filters);

  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '100px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            <div className="p-5">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="flex gap-2 mb-3">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded-full w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">Failed to load menus</div>
        <p className="text-gray-600">Please try again later</p>
      </div>
    );
  }

  const allMenus = data?.pages.flatMap(page => page.menus) || [];

  if (allMenus.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl text-gray-300 mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No menus found</h3>
        <p className="text-gray-600">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allMenus.map((menu) => (
          <DiscoverMenuCard key={menu.id} menu={menu} />
        ))}
      </div>

      {/* Loading more indicator */}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-6">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              Loading more menus...
            </div>
          ) : (
            <div className="text-gray-500">Scroll to load more</div>
          )}
        </div>
      )}
    </div>
  );
} 