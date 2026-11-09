import React from 'react';
import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-coastal-line bg-coastal-card px-6 py-12 text-center shadow-coastal">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-coastal-line bg-coastal-mist text-coastal-kelp shadow-2xs">
        {icon || <AppIcon name="packageOpen" className="h-5 w-5" />}
      </div>
      <h3 className="mt-4 font-serif text-lg font-bold text-coastal-ink">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm text-coastal-slate leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-coastal-kelp px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-coastal-card shadow-coastal hover:bg-coastal-kelp-hover transition-all"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && !actionHref && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-coastal-kelp px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-coastal-card shadow-coastal hover:bg-coastal-kelp-hover transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
