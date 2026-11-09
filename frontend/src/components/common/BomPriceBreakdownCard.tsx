'use client';

import React, { useMemo } from 'react';
import { Placement3D } from '@/types';
import { formatVnd } from '@/components/ui/PriceTag';
import { AppIcon } from '@/components/ui/AppIcon';
import { useI18n } from '@/i18n/I18nContext';
import { THREE_COLORS } from '@/config/theme';

export interface BomPriceBreakdownCardProps {
  variant?: 'studio_live' | 'cart_compact' | 'crafting_checklist';
  baseProductName: string;
  basePrice: number;
  craftFee: number;
  placements: Placement3D[];
  quantity?: number;
  maxPlacements?: number;
  checkedMaterialIds?: string[];
  onToggleChecklist?: (materialId: string) => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  isSubmitting?: boolean;
}

export function BomPriceBreakdownCard({
  variant = 'studio_live',
  baseProductName,
  basePrice,
  craftFee,
  placements,
  quantity = 1,
  maxPlacements = 50,
  checkedMaterialIds = [],
  onToggleChecklist,
  primaryActionLabel,
  onPrimaryAction,
  isSubmitting = false,
}: BomPriceBreakdownCardProps) {
  const { t } = useI18n();

  const groupedBom = useMemo(() => {
    const map = new Map<
      string,
      {
        materialId: string;
        materialName: string;
        unitPrice: number;
        count: number;
        color: string;
      }
    >();

    (placements || []).forEach((p) => {
      const existing = map.get(p.materialId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(p.materialId, {
          materialId: p.materialId,
          materialName: p.materialName,
          unitPrice: p.unitPrice || 15000,
          count: 1,
          color: p.color || THREE_COLORS.shellDefault,
        });
      }
    });

    return Array.from(map.values());
  }, [placements]);

  const materialsTotal = useMemo(
    () => groupedBom.reduce((sum, item) => sum + item.unitPrice * item.count, 0),
    [groupedBom]
  );

  const effectiveCraftFee =
    placements.length > 0 || variant === 'studio_live' ? craftFee : 0;
  const unitCustomPrice = basePrice + effectiveCraftFee + materialsTotal;
  const grandTotal = unitCustomPrice * quantity;

  if (variant === 'cart_compact') {
    return (
      <div className="mt-2.5 rounded-2xl border border-coastal-line bg-coastal-mist/70 p-3.5 text-xs shadow-2xs">
        <div className="flex items-center justify-between font-semibold text-coastal-ink">
          <span className="inline-flex items-center gap-1.5">
            <AppIcon name="compass" className="h-3.5 w-3.5 text-coastal-rust" />
            {t('bom.compactTitle')} ({placements.length} {t('bom.accessoriesUnit')})
          </span>
          <span className="font-mono text-coastal-kelp">
            {formatVnd(unitCustomPrice)} {t('common.perItem')}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-coastal-slate">
          <span className="rounded-full bg-coastal-card px-2.5 py-0.5 border border-coastal-line font-mono">
            {t('bom.baseBlankLabel')} {formatVnd(basePrice)}
          </span>
          <span className="rounded-full bg-coastal-card px-2.5 py-0.5 border border-coastal-line font-mono">
            {t('bom.craftFeeCompact')} +{formatVnd(effectiveCraftFee)}
          </span>
          {groupedBom.map((g) => (
            <span
              key={g.materialId}
              className="rounded-full bg-coastal-stone/70 text-coastal-deep px-2.5 py-0.5 border border-coastal-border font-mono font-medium"
            >
              {g.materialName} x{g.count} (+{formatVnd(g.unitPrice * g.count)})
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-coastal-line bg-coastal-card p-5 shadow-coastal">
      <div className="flex items-center justify-between border-b border-coastal-line/70 pb-3.5">
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-coastal-kelp">
            {variant === 'crafting_checklist'
              ? t('bom.checklistTitle')
              : t('bom.liveBreakdownTitle')}
          </span>
          <h3 className="font-serif text-lg font-bold text-coastal-ink mt-0.5">
            {baseProductName}
          </h3>
        </div>
        <span
          className={`rounded-full border px-3 py-1 font-mono text-xs font-bold ${
            placements.length >= maxPlacements
              ? 'border-coastal-border bg-coastal-stone text-coastal-deep'
              : 'border-coastal-line bg-coastal-mist text-coastal-kelp'
          }`}
        >
          {placements.length}/{maxPlacements}
        </span>
      </div>

      {/* Base & Craft Fee */}
      <div className="mt-3.5 space-y-2.5 text-sm">
        <div className="flex items-center justify-between text-coastal-slate">
          <span className="inline-flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-coastal-mist text-coastal-kelp">
              <AppIcon name="layers" className="w-3.5 h-3.5" />
            </span>
            {t('bom.baseNetPriceLabel')}
          </span>
          <strong className="font-mono font-semibold text-coastal-ink">
            {formatVnd(basePrice)}
          </strong>
        </div>

        <div className="flex items-center justify-between text-coastal-slate">
          <span className="inline-flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-coastal-stone text-coastal-rust-hover">
              <AppIcon name="hammer" className="w-3.5 h-3.5" />
            </span>
            {t('bom.artisanStitchFeeLabel')}
          </span>
          <strong className="font-mono font-semibold text-coastal-ink">
            +{formatVnd(effectiveCraftFee)}
          </strong>
        </div>
      </div>

      {/* Placed Materials List */}
      <div className="mt-4 border-t border-coastal-line/70 pt-3.5">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-coastal-muted mb-2.5">
          {t('bom.attachedMaterialsHeading')} ({placements.length})
        </div>

        {groupedBom.length === 0 ? (
          <p className="rounded-xl border border-dashed border-coastal-line bg-coastal-bg p-3.5 text-xs text-coastal-slate text-center">
            {t('bom.emptyPlacementsHint')}
          </p>
        ) : (
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {groupedBom.map((item) => {
              const isChecked = checkedMaterialIds.includes(item.materialId);
              const totalQtyForOrder = item.count * quantity;
              return (
                <li
                  key={item.materialId}
                  onClick={() =>
                    variant === 'crafting_checklist' &&
                    onToggleChecklist?.(item.materialId)
                  }
                  className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs transition-all ${
                    variant === 'crafting_checklist'
                      ? isChecked
                        ? 'border-coastal-rust bg-coastal-stone/60 cursor-pointer'
                        : 'border-coastal-line bg-coastal-bg hover:bg-coastal-mist cursor-pointer'
                      : 'border-coastal-line/80 bg-coastal-bg'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {variant === 'crafting_checklist' ? (
                      isChecked ? (
                        <AppIcon
                          name="checkSquare"
                          className="w-4 h-4 text-coastal-rust-hover shrink-0"
                        />
                      ) : (
                        <AppIcon
                          name="square"
                          className="w-4 h-4 text-coastal-slate shrink-0"
                        />
                      )
                    ) : (
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-coastal-line shrink-0 shadow-2xs"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    <div>
                      <span className="font-semibold text-coastal-ink">
                        {item.materialName}
                      </span>
                      <span className="block font-mono text-[11px] text-coastal-slate">
                        {formatVnd(item.unitPrice)} x {item.count}{' '}
                        {t('common.positions')}
                        {quantity > 1
                          ? ` (${t('bom.exportStockNote')} ${totalQtyForOrder} ${t('common.pieces')})`
                          : ''}
                      </span>
                    </div>
                  </div>
                  <strong className="font-mono font-bold text-coastal-kelp">
                    +{formatVnd(item.unitPrice * item.count)}
                  </strong>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Total Price Summary */}
      <div className="mt-4 rounded-xl border border-coastal-line/70 bg-coastal-mist/60 p-3.5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-coastal-ink">
            {quantity > 1
              ? `${t('bom.totalForQuantity')} (${quantity} ${t('common.items')})`
              : t('bom.unitFinishedPrice')}
          </span>
          <span className="font-mono text-xl font-bold text-coastal-kelp">
            {formatVnd(grandTotal)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-coastal-muted">
          {t('bom.serverVerifyNote')}
        </p>
      </div>

      {primaryActionLabel && onPrimaryAction && (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onPrimaryAction}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-coastal-kelp to-coastal-rust hover:opacity-95 disabled:opacity-50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-coastal-card shadow-coastal transition-all"
        >
          {isSubmitting ? t('bom.savingDesign') : primaryActionLabel}
        </button>
      )}
    </div>
  );
}
