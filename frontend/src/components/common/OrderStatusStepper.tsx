'use client';

import React from 'react';
import { OrderStatus } from '@/types';
import { AppIcon } from '@/components/ui/AppIcon';
import type { IconName } from '@/config/icons';
import { useI18n } from '@/i18n/I18nContext';

export interface OrderStatusStepperProps {
  currentStatus: OrderStatus;
  interactive?: boolean;
  onStatusChange?: (nextStatus: OrderStatus) => void;
  updatedAt?: string;
}

const STEP_CONFIGS: Array<{
  key: OrderStatus;
  icon: IconName;
}> = [
  { key: 'pending', icon: 'clock' },
  { key: 'confirmed', icon: 'packageCheck' },
  { key: 'in_crafting', icon: 'hammer' },
  { key: 'quality_check', icon: 'shieldCheck' },
  { key: 'shipping', icon: 'truck' },
  { key: 'delivered', icon: 'check' },
];

export function OrderStatusStepper({
  currentStatus,
  interactive = false,
  onStatusChange,
  updatedAt,
}: OrderStatusStepperProps) {
  const { t, locale } = useI18n();

  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-3.5 rounded-2xl border border-coastal-line bg-coastal-mist p-4 text-coastal-ink shadow-coastal">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coastal-card text-coastal-kelp shadow-2xs">
          <AppIcon name="xCircle" className="h-5 w-5" />
        </span>
        <div>
          <h4 className="text-sm font-bold text-coastal-ink">
            {t('stepper.cancelledTitle')}
          </h4>
          <p className="text-xs text-coastal-slate mt-0.5">
            {t('stepper.cancelledDesc')}
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STEP_CONFIGS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="rounded-2xl border border-coastal-line bg-coastal-card p-5 shadow-coastal">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-coastal-line bg-coastal-mist px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-coastal-kelp">
          <span className="h-1.5 w-1.5 rounded-full bg-coastal-rust" />
          {t('stepper.heading')}
        </span>
        {updatedAt && (
          <span className="font-mono text-xs text-coastal-muted">
            {t('stepper.updatedAt')}{' '}
            {new Date(updatedAt).toLocaleString(
              locale === 'en' ? 'en-US' : 'vi-VN'
            )}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STEP_CONFIGS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isNextValid = index === currentIndex + 1;

          return (
            <button
              key={step.key}
              type="button"
              disabled={!interactive || !isNextValid}
              onClick={() =>
                interactive && isNextValid && onStatusChange?.(step.key)
              }
              className={`group flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                isCurrent
                  ? 'border-coastal-kelp bg-coastal-mist shadow-coastal ring-2 ring-coastal-kelp/15'
                  : isCompleted
                  ? 'border-coastal-border bg-coastal-stone/40'
                  : interactive && isNextValid
                  ? 'border-coastal-rust bg-coastal-stone/80 hover:bg-coastal-stone cursor-pointer shadow-coastal'
                  : 'border-coastal-line/60 bg-coastal-bg/60 opacity-65'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-transform ${
                    isCurrent
                      ? 'bg-coastal-kelp text-coastal-card shadow-coastal'
                      : isCompleted
                      ? 'bg-coastal-rust text-coastal-card'
                      : 'bg-coastal-mist text-coastal-slate'
                  }`}
                >
                  <AppIcon name={step.icon} className="h-3.5 w-3.5" />
                </span>
                <span className="font-mono text-[11px] font-bold text-coastal-muted">
                  0{index + 1}
                </span>
              </div>
              <div className="mt-3 font-bold text-xs text-coastal-ink">
                {t(`stepper.steps.${step.key}Label`)}
              </div>
              <p className="mt-0.5 text-[11px] text-coastal-slate leading-snug">
                {t(`stepper.steps.${step.key}Desc`)}
              </p>
              {interactive && isNextValid && (
                <span className="mt-2.5 inline-block rounded-full bg-coastal-rust px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-coastal-card shadow-2xs">
                  {t('stepper.advanceAction')}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
