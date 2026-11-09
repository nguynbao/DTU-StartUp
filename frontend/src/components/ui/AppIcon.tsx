import React from 'react';
import { ICON_REGISTRY, type IconName } from '@/config/icons';

export interface AppIconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function AppIcon({
  name,
  size = 16,
  className = 'w-4 h-4',
  strokeWidth = 2,
}: AppIconProps) {
  const IconComponent = ICON_REGISTRY[name] || ICON_REGISTRY.compass;
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
}
