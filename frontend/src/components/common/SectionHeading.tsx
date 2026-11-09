import React from 'react';

export interface SectionHeadingProps {
  as?: 'h1' | 'h2' | 'h3';
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  rightAction?: React.ReactNode;
}

export function SectionHeading({
  as: Tag = 'h2',
  eyebrow,
  title,
  subtitle,
  align = 'left',
  rightAction,
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={`flex flex-col gap-3 ${
        isCenter
          ? 'items-center text-center'
          : 'sm:flex-row sm:items-end sm:justify-between'
      }`}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full border border-coastal-line bg-coastal-mist px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-coastal-kelp shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-coastal-rust" />
            {eyebrow}
          </span>
        )}
        <Tag
          className={`${
            eyebrow ? 'mt-3' : ''
          } font-serif text-2xl sm:text-4xl font-bold tracking-tight text-coastal-ink`}
        >
          {title}
        </Tag>
        {subtitle && (
          <p className="mt-2 text-sm sm:text-base text-coastal-slate leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </div>
  );
}
