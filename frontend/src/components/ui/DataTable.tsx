'use client';

import React from 'react';
import { EmptyState } from '@/components/common/EmptyState';
import { useI18n } from '@/i18n/I18nContext';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  render: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  onRowClick,
}: DataTableProps<T>) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-coastal-line bg-coastal-card shadow-coastal">
        <div className="animate-pulse space-y-3 p-6">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="h-12 rounded-xl bg-coastal-mist" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-coastal-line bg-coastal-card p-6 shadow-coastal">
        <EmptyState
          title={emptyTitle || t('common.noDataTitle')}
          description={emptyDescription || t('common.noDataDesc')}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-coastal-line bg-coastal-card shadow-coastal">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-coastal-line bg-coastal-mist/80 text-[11px] font-bold uppercase tracking-widest text-coastal-kelp">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3.5 ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-coastal-line/60">
            {data.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors duration-100 hover:bg-coastal-mist/50 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 align-middle text-coastal-ink ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    {col.render(row, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
