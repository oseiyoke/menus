import React from 'react';
import { MenuBase } from './MenuBase';
import type { Menu } from '@/lib/types';

interface MenuEditViewProps {
  menu: Menu;
  onViewOnly?: () => void;
  onDayEdit?: (dayIndex: number) => void;
  onShare?: () => void;
}

export function MenuEditView({ menu, onViewOnly, onDayEdit, onShare }: MenuEditViewProps) {
  const handleDeleteDay = (dayIndex: number) => {
    // Implementation for deleting all meals for a day
    console.log('Delete day:', dayIndex);
    // This would typically call an API to delete all meals for the day
  };

  return (
    <MenuBase
      menu={menu}
      isReadOnly={false}
      showEditControls={true}
      onDayClick={onDayEdit}
      onDeleteDay={handleDeleteDay}
      onShare={onShare}
      backHref={onViewOnly ? undefined : '/'}
    />
  );
} 