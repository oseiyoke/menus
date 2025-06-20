'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMenu, useMenuByShortId } from '@/hooks/useMenu';
import { useMenuStore } from '@/lib/store';
import { MenuBase } from '@/components/menu/MenuBase';
import { MenuSettingsModal } from '@/components/menu/MenuSettingsModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NotFound } from '@/components/ui/NotFound';
import { Unauthorized } from '@/components/ui/Unauthorized';

export default function EditMenuPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shortId = params.shortId as string;
  const editKey = searchParams.get('key');
  
  const { data: menu, isLoading, error } = useMenuByShortId(shortId);
  const { updateMenu } = useMenu(menu?.id);
  const { setMenu } = useMenuStore();
  
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if edit key is provided and valid
  const isAuthorized = editKey && menu?.edit_key === editKey;

  useEffect(() => {
    if (menu) {
      setMenu(menu);
    }
  }, [menu, setMenu]);

  const handleSaveSettings = async (data: { name: string; description?: string; is_discoverable?: boolean; discovery_tags?: string[] }) => {
    if (!menu) return;
    
    setIsSaving(true);
    try {
      updateMenu({ id: menu.id, data });
      setIsSettingsModalOpen(false);
    } catch (error) {
      console.error('Failed to update menu:', error);
    } finally {
      setIsSaving(false);
    }
  };

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

  return (
    <>
      <MenuBase 
        menu={menu}
        isReadOnly={false}
        onEdit={() => setIsSettingsModalOpen(true)}
        onDayClick={(dayIndex: number) => router.push(`/menu/${shortId}/edit/day/${dayIndex}?key=${editKey}`)}
        onShare={() => router.push(`/menu/${shortId}/share?key=${editKey}`)}
        backHref="/"
      />
      
      <MenuSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        menu={menu}
        onSave={handleSaveSettings}
        isSaving={isSaving}
      />
    </>
  );
} 