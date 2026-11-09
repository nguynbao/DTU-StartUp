'use client';

import React from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import type { IconName } from '@/config/icons';
import { useI18n } from '@/i18n/I18nContext';

export interface EcoImpactBadgeProps {
  variant?: 'card_counter' | 'pill' | 'product_detail' | 'cms_stat';
  netWeightGrams?: number;
  originSea?: string;
  recycledPlasticPct?: number;
  artisanGroup?: string;
  counterValue?: string | number;
  counterLabel?: string;
  iconName?: 'recycle' | 'fish' | 'users' | 'anchor' | 'sparkles';
}

export function EcoImpactBadge({
  variant = 'pill',
  netWeightGrams = 350,
  originSea,
  recycledPlasticPct = 92,
  artisanGroup,
  counterValue,
  counterLabel,
  iconName = 'recycle',
}: EcoImpactBadgeProps) {
  const { t } = useI18n();

  const resolvedIconName: IconName =
    iconName === 'sparkles' ? 'compass' : iconName || 'recycle';

  const displayOriginSea = originSea || t('eco.defaultOriginSea');
  const displayArtisanGroup = artisanGroup || t('eco.defaultArtisanGroup');

  if (variant === 'card_counter') {
    return (
      <div className="flex flex-col justify-between rounded-2xl border border-coastal-line bg-coastal-card p-5 shadow-coastal transition-all hover:-translate-y-0.5 hover:shadow-coastal-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-coastal-border bg-coastal-stone/70 text-coastal-rust-hover">
          <AppIcon name={resolvedIconName} className="w-5 h-5" />
        </div>
        <div className="mt-4">
          <div className="font-mono text-2xl sm:text-3xl font-bold text-coastal-ink tracking-tight">
            {counterValue}
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-coastal-slate">
            {counterLabel}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'product_detail') {
    return (
      <div className="rounded-2xl border border-coastal-line bg-gradient-to-br from-coastal-mist/80 via-coastal-card to-coastal-stone/50 p-4 shadow-coastal">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-coastal-kelp">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-coastal-stone text-coastal-rust-hover">
            <AppIcon name="recycle" className="h-3.5 w-3.5" />
          </span>
          {t('eco.traceabilityHeading')}
        </div>
        <div className="mt-3.5 grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-xl bg-coastal-card p-3.5 border border-coastal-line/80 shadow-2xs">
            <span className="text-coastal-muted block text-xs">
              {t('eco.ghostNetRecovered')}
            </span>
            <strong className="mt-0.5 block font-mono text-coastal-kelp font-bold text-base">
              {netWeightGrams}
              {t('eco.netGramsUnit')}
            </strong>
          </div>
          <div className="rounded-xl bg-coastal-card p-3.5 border border-coastal-border/80 shadow-2xs">
            <span className="text-coastal-muted block text-xs">
              {t('eco.recycledRatio')}
            </span>
            <strong className="mt-0.5 block font-mono text-coastal-rust-hover font-bold text-base">
              {recycledPlasticPct}
              {t('eco.materialType')}
            </strong>
          </div>
          <div className="rounded-xl bg-coastal-card p-3.5 border border-coastal-line/80 shadow-2xs">
            <span className="text-coastal-muted block text-xs">
              {t('eco.collectionSea')}
            </span>
            <strong className="mt-0.5 block text-coastal-ink font-semibold">
              {displayOriginSea}
            </strong>
          </div>
          <div className="rounded-xl bg-coastal-card p-3.5 border border-coastal-line/80 shadow-2xs">
            <span className="text-coastal-muted block text-xs">
              {t('eco.artisanGroup')}
            </span>
            <strong className="mt-0.5 block text-coastal-ink font-semibold">
              {displayArtisanGroup}
            </strong>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'cms_stat') {
    const kg = ((netWeightGrams || 0) / 1000).toFixed(2);
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-coastal-stone/80 border border-coastal-border px-3.5 py-1.5 font-mono text-xs font-semibold text-coastal-deep shadow-coastal">
        <AppIcon name="recycle" className="w-3.5 h-3.5 text-coastal-rust-hover" />
        <span>
          {t('eco.totalRecycledPrefix')} {kg} kg ({netWeightGrams.toLocaleString('vi-VN')}g)
        </span>
      </div>
    );
  }

  // Default: Astryx 'pill'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-coastal-border bg-coastal-card/90 px-2.5 py-1 font-mono text-[11px] font-semibold text-coastal-deep shadow-coastal backdrop-blur-md">
      <AppIcon name="recycle" className="w-3 h-3 text-coastal-rust" />
      {netWeightGrams}
      {t('eco.netGramsUnit')}
    </span>
  );
}
