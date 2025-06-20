'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMenu, useMenuByShortId } from '@/hooks/useMenu';
import { useMenuStore } from '@/lib/store';
import { MenuView } from '@/components/menu/MenuView';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NotFound } from '@/components/ui/NotFound';

export default function ViewMenuPage() {
  const params = useParams();
  const router = useRouter();
  const shortId = params.shortId as string;
  
  const { data: menu, isLoading, error } = useMenuByShortId(shortId);

  // Fetch menu entries and populate the store once we have the menu ID
  // This hook internally sets the menu entries in the global store, which
  // MenuBase relies on to render the meals for each day.
  useMenu(menu?.id);

  // Also save the fetched menu itself to the global store so other components
  // (e.g., Day views) can access shared information like start_date.
  const { setMenu } = useMenuStore();

  useEffect(() => {
    if (menu) {
      setMenu(menu);
    }
  }, [menu, setMenu]);

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

  return (
    <MenuView 
      menu={menu}
      isReadOnly={true}
      onEdit={() => router.push(`/menu/${shortId}/edit`)}
    />
  );
} 