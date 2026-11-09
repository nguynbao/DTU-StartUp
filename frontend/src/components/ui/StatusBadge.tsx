'use client';

import React from 'react';
import { useI18n } from '@/i18n/I18nContext';

export interface StatusBadgeProps {
  status: string;
  variant?: 'order' | 'payment' | 'stock' | 'custom';
  size?: 'sm' | 'md';
  label?: string;
}

const STATUS_STYLE_MAP: Record<
  string,
  { classes: string; dotColor: string }
> = {
  pending: {
    classes: 'bg-coastal-mist text-coastal-forest border-coastal-line',
    dotColor: 'bg-coastal-gold',
  },
  confirmed: {
    classes: 'bg-coastal-sand text-coastal-forest border-coastal-line',
    dotColor: 'bg-coastal-kelp',
  },
  in_crafting: {
    classes: 'bg-coastal-stone/80 text-coastal-deep border-coastal-border',
    dotColor: 'bg-coastal-rust',
  },
  quality_check: {
    classes: 'bg-coastal-mist text-coastal-ink border-coastal-line',
    dotColor: 'bg-coastal-kelp',
  },
  shipping: {
    classes: 'bg-coastal-sand/80 text-coastal-kelp border-coastal-line',
    dotColor: 'bg-coastal-kelp',
  },
  delivered: {
    classes: 'bg-coastal-rust text-coastal-card border-coastal-rust',
    dotColor: 'bg-coastal-card',
  },
  cancelled: {
    classes: 'bg-coastal-mist text-coastal-muted border-coastal-line',
    dotColor: 'bg-coastal-muted',
  },
  unpaid: {
    classes: 'bg-coastal-mist text-coastal-slate border-coastal-line',
    dotColor: 'bg-coastal-gold',
  },
  paid: {
    classes: 'bg-coastal-stone text-coastal-deep border-coastal-border',
    dotColor: 'bg-coastal-rust',
  },
  refunded: {
    classes: 'bg-coastal-mist text-coastal-slate border-coastal-line',
    dotColor: 'bg-coastal-slate',
  },
  in_stock: {
    classes: 'bg-coastal-stone/80 text-coastal-deep border-coastal-border',
    dotColor: 'bg-coastal-rust',
  },
  low_stock: {
    classes: 'bg-coastal-sand text-coastal-forest border-coastal-line',
    dotColor: 'bg-coastal-kelp',
  },
  out_of_stock: {
    classes: 'bg-coastal-mist text-coastal-muted border-coastal-line',
    dotColor: 'bg-coastal-muted',
  },
  active: {
    classes: 'bg-coastal-stone/80 text-coastal-deep border-coastal-border',
    dotColor: 'bg-coastal-rust',
  },
  hidden: {
    classes: 'bg-coastal-mist text-coastal-slate border-coastal-line',
    dotColor: 'bg-coastal-slate',
  },
};

export function StatusBadge({
  status,
  size = 'md',
  label,
}: StatusBadgeProps) {
  const { t } = useI18n();
  const key = (status || '').toLowerCase();
  const styleConfig = STATUS_STYLE_MAP[key] || {
    classes: 'bg-coastal-mist text-coastal-ink border-coastal-line',
    dotColor: 'bg-coastal-slate',
  };

  const translated = t(`status.${key}`);
  const displayText =
    label || (translated !== `status.${key}` ? translated : status);

  const sizeClass =
    size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border shadow-2xs ${styleConfig.classes} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styleConfig.dotColor}`} />
      {displayText}
    </span>
  );
}
