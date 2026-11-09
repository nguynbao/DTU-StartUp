'use client';

import React from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { useI18n } from '@/i18n/I18nContext';

export interface ModalConfirmProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ModalConfirm({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}: ModalConfirmProps) {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-coastal-ink/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirm-title"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-coastal-card p-6 border border-coastal-line shadow-astryx-high">
        <button
          type="button"
          onClick={onCancel}
          aria-label={t('common.closeDialog')}
          className="absolute top-4 right-4 rounded-full p-2 text-coastal-slate hover:bg-coastal-mist hover:text-coastal-ink transition-colors"
        >
          <AppIcon name="x" className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
              variant === 'danger'
                ? 'bg-coastal-stone text-coastal-deep border-coastal-border'
                : 'bg-coastal-mist text-coastal-kelp border-coastal-line'
            }`}
          >
            <AppIcon name="alertTriangle" className="h-5 w-5" />
          </div>
          <div>
            <h3
              id="modal-confirm-title"
              className="font-serif text-xl font-bold text-coastal-ink"
            >
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-coastal-slate leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-coastal-line/70 pt-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="rounded-full border border-coastal-line bg-coastal-bg px-4 py-2 text-xs font-semibold uppercase tracking-wider text-coastal-ink hover:bg-coastal-mist disabled:opacity-50 transition-all"
          >
            {cancelLabel || t('common.cancel')}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider text-coastal-card shadow-coastal transition-all disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-coastal-rust hover:bg-coastal-rust-hover'
                : 'bg-coastal-kelp hover:bg-coastal-kelp-hover'
            }`}
          >
            {isLoading
              ? t('common.processing')
              : confirmLabel || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
