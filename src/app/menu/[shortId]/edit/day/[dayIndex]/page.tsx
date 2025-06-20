'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useMenuStore } from '@/lib/store';
import { useMenu, useMenuByShortId } from '@/hooks/useMenu';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NotFound } from '@/components/ui/NotFound';
import { Unauthorized } from '@/components/ui/Unauthorized';
import { DayEditView } from '@/components/menu/DayEditView';

export default function DayEditPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const shortId = params.shortId as string;
  const dayIndex = parseInt(params.dayIndex as string);
  const editKey = searchParams.get('key');
  
  const { data: menu, isLoading, error } = useMenuByShortId(shortId);
  const { currentMenu, setMenu } = useMenuStore();

  // Check if edit key is provided and valid
  const isAuthorized = editKey && menu?.edit_key === editKey;

  useEffect(() => {
    if (menu) {
      setMenu(menu);
    }
  }, [menu, setMenu]);

  useMenu(menu?.id); // triggers store population

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
        message="You don't have permission to edit this menu. Please check your edit link."
        actionText="View Menu"
        actionHref={`/menu/${shortId}`}
      />
    );
  }

  if (!currentMenu) {
    return <LoadingSpinner message="Loading menu..." />;
  }

  const handleNavigateDay = (newDayIndex: number) => {
    router.push(`/menu/${shortId}/edit/day/${newDayIndex}?key=${editKey}`);
  };

  return (
    <DayEditView
      menu={currentMenu}
      dayIndex={dayIndex}
      backHref={`/menu/${shortId}/edit?key=${editKey}`}
      onNavigateDay={handleNavigateDay}
    />
  );
} 