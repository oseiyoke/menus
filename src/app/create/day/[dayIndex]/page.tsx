'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link'; // used for fallback case only
import { useMenuStore } from '@/lib/store';
import { DayEditView } from '@/components/menu/DayEditView';

export default function DayViewPage() {
  const router = useRouter();
  const params = useParams();
  const dayIndex = parseInt(params.dayIndex as string);
  
  const { currentMenu } = useMenuStore();

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

  const handleNavigateDay = (newDayIndex: number) => {
    router.push(`/create/day/${newDayIndex}`);
  };

  return (
    <DayEditView
      menu={currentMenu}
      dayIndex={dayIndex}
      backHref="/create"
      onNavigateDay={handleNavigateDay}
    />
  );
} 