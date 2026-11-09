import React from 'react';

export interface PriceTagProps {
  amount: number;
  originalAmount?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  suffix?: string;
  className?: string;
}

export function formatVnd(amount: number): string {
  return `${Math.round(amount || 0).toLocaleString('vi-VN')}đ`;
}

export function PriceTag({
  amount,
  originalAmount,
  size = 'md',
  suffix,
  className = '',
}: PriceTagProps) {
  const sizeMap = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl sm:text-3xl font-extrabold',
  };

  return (
    <span
      className={`inline-flex items-baseline gap-1.5 font-mono tabular-nums ${className}`}
    >
      <span className={`text-coastal-ink tracking-tight ${sizeMap[size]}`}>
        {formatVnd(amount)}
      </span>
      {suffix && (
        <span className="font-sans text-xs font-medium text-coastal-slate">
          {suffix}
        </span>
      )}
      {originalAmount && originalAmount > amount && (
        <span className="text-xs text-coastal-muted line-through">
          {formatVnd(originalAmount)}
        </span>
      )}
    </span>
  );
}
