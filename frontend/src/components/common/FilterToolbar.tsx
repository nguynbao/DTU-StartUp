'use client';

import React from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { useI18n } from '@/i18n/I18nContext';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  categoryOptions?: FilterOption[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  sortOptions?: FilterOption[];
  selectedSort?: string;
  onSortChange?: (sort: string) => void;
  toggleFilterLabel?: string;
  toggleFilterChecked?: boolean;
  onToggleFilterChange?: (checked: boolean) => void;
  onResetFilters?: () => void;
  rightSlot?: React.ReactNode;
}

export function FilterToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  categoryOptions = [],
  selectedCategory = 'all',
  onCategoryChange,
  sortOptions = [],
  selectedSort = 'newest',
  onSortChange,
  toggleFilterLabel,
  toggleFilterChecked = false,
  onToggleFilterChange,
  onResetFilters,
  rightSlot,
}: FilterToolbarProps) {
  const { t } = useI18n();
  const effectivePlaceholder = searchPlaceholder || t('filter.searchPlaceholder');

  return (
    <div className="rounded-2xl border border-coastal-line bg-coastal-card/90 p-4 shadow-coastal backdrop-blur-md space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Astryx Spotlight Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <AppIcon
            name="search"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-coastal-kelp"
          />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={effectivePlaceholder}
            aria-label={effectivePlaceholder}
            className="w-full rounded-full border border-coastal-line bg-coastal-bg pl-10 pr-4 py-2 text-sm text-coastal-ink placeholder:text-coastal-muted focus:border-coastal-kelp focus:bg-coastal-card focus:ring-2 focus:ring-coastal-kelp/20 focus:outline-none transition-all"
          />
        </div>

        {/* Sort + Toggle + Reset Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {categoryOptions.length > 0 && onCategoryChange && (
            <div className="inline-flex items-center gap-1.5 sm:hidden">
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                aria-label={t('filter.categoryAria')}
                className="rounded-full border border-coastal-line bg-coastal-bg px-3.5 py-2 text-xs font-semibold text-coastal-ink focus:border-coastal-kelp focus:outline-none"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {sortOptions.length > 0 && onSortChange && (
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label={t('filter.sortAria')}
              className="rounded-full border border-coastal-line bg-coastal-bg px-4 py-2 text-xs sm:text-sm font-medium text-coastal-ink focus:border-coastal-kelp focus:outline-none transition-all"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {toggleFilterLabel && onToggleFilterChange && (
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold select-none transition-all ${
                toggleFilterChecked
                  ? 'border-coastal-rust bg-coastal-stone text-coastal-deep shadow-coastal'
                  : 'border-coastal-line bg-coastal-mist/70 text-coastal-slate hover:text-coastal-ink'
              }`}
            >
              <input
                type="checkbox"
                checked={toggleFilterChecked}
                onChange={(e) => onToggleFilterChange(e.target.checked)}
                className="h-3.5 w-3.5 rounded-full accent-coastal-rust"
              />
              {toggleFilterLabel}
            </label>
          )}

          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 rounded-full border border-coastal-line bg-coastal-bg px-3.5 py-2 text-xs font-semibold text-coastal-slate hover:border-coastal-kelp hover:bg-coastal-mist hover:text-coastal-ink transition-all"
            >
              <AppIcon name="rotateCcw" className="h-3.5 w-3.5 text-coastal-kelp" />
              {t('filter.resetBtn')}
            </button>
          )}

          {rightSlot}
        </div>
      </div>

      {/* Astryx Segmented Category Pill Bar (Desktop & Tablet) */}
      {categoryOptions.length > 0 && onCategoryChange && (
        <div
          role="tablist"
          aria-label={t('filter.categoryAria')}
          className="hidden sm:flex flex-wrap items-center gap-1.5 border-t border-coastal-line/60 pt-3"
        >
          {categoryOptions.map((opt) => {
            const active = selectedCategory === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onCategoryChange(opt.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-coastal-kelp text-coastal-card shadow-coastal'
                    : 'bg-coastal-mist/70 text-coastal-slate hover:bg-coastal-sand/70 hover:text-coastal-ink'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
