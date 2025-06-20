import React from 'react';
import { MenuBase } from './MenuBase';
import type { Menu } from '@/lib/types';

interface MenuViewProps {
  menu: Menu;
  isReadOnly?: boolean;
  onEdit?: () => void;
}

export function MenuView({ menu, isReadOnly = true, onEdit }: MenuViewProps) {
  return (
    <MenuBase
      menu={menu}
      isReadOnly={isReadOnly}
      onEdit={onEdit}
      backHref="/"
    />
  );
} 