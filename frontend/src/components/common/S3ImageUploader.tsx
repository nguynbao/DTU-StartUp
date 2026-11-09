'use client';

import React, { useRef, useState } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { uploadMediaFile } from '@/lib/api';
import { resolveAssetUrl, ASSETS } from '@/config/assets';
import type { MediaStorageFolder } from '@/types';
import { useI18n } from '@/i18n/I18nContext';

export interface S3ImageUploaderProps {
  value: string;
  onChange: (newUrl: string) => void;
  folder: MediaStorageFolder;
  label?: string;
  compact?: boolean;
  className?: string;
}

export function S3ImageUploader({
  value,
  onChange,
  folder,
  label,
  compact = false,
  className = '',
}: S3ImageUploaderProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [storageMode, setStorageMode] = useState<'s3' | 'local-fallback' | null>(
    value?.includes('.amazonaws.com') || value?.includes('s3.') ? 's3' : null
  );
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const resolvedPreview = resolveAssetUrl(value, ASSETS.placeholders.product);

  const handleFileUpload = async (file?: File | null) => {
    if (!file) return;
    setIsUploading(true);
    setUploadNotice(null);
    try {
      const result = await uploadMediaFile(file, folder);
      onChange(result.url);
      setStorageMode(result.storageMode);
      setUploadNotice(t('cms.s3UploadSuccess'));
      setTimeout(() => setUploadNotice(null), 3200);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await handleFileUpload(file);
    }
  };

  const isS3Url =
    storageMode === 's3' ||
    value?.includes('amazonaws.com') ||
    value?.includes('cloudfront.net') ||
    value?.includes('/s3/');

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`rounded-2xl border p-3.5 transition-all ${
        isDragging
          ? 'border-coastal-kelp bg-coastal-mist/80 ring-2 ring-coastal-kelp/25'
          : 'border-coastal-line bg-coastal-card shadow-coastal'
      } ${className}`}
    >
      {/* Header Row: Label + S3 Bucket / Folder Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        {label ? (
          <span className="text-xs font-bold text-coastal-ink">{label}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-coastal-slate">
            <AppIcon name="folder" className="h-3.5 w-3.5 text-coastal-kelp" />
            {t('cms.s3FolderLabel')} <strong className="text-coastal-ink">s3://{folder}/</strong>
          </span>
        )}

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
            isS3Url
              ? 'border-coastal-border bg-coastal-stone text-coastal-deep'
              : 'border-coastal-line bg-coastal-mist text-coastal-kelp'
          }`}
        >
          <AppIcon name="cloud" className="h-3 w-3" />
          {isS3Url ? 'AWS S3' : `S3 / ${folder}`}
        </span>
      </div>

      {/* Main Content: Concentric Image Preview + Upload Controls */}
      <div
        className={`grid gap-3.5 ${
          compact ? 'grid-cols-1 sm:grid-cols-12 items-center' : 'grid-cols-1 sm:grid-cols-12 items-start'
        }`}
      >
        {/* Image Preview Frame */}
        <div
          className={`relative overflow-hidden rounded-xl border border-coastal-line/80 bg-coastal-mist ${
            compact ? 'h-20 sm:col-span-3' : 'aspect-[16/10] sm:col-span-4'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedPreview}
            alt={label || t('cms.s3PreviewAlt')}
            className="h-full w-full object-cover"
          />

          {value && (
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
              <a
                href={resolvedPreview}
                target="_blank"
                rel="noreferrer"
                title={t('cms.s3OpenImage')}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-coastal-card/90 text-coastal-ink shadow-coastal hover:bg-coastal-kelp hover:text-coastal-card transition-colors"
              >
                <AppIcon name="externalLink" className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Upload Button + Direct URL Input */}
        <div className={`space-y-2.5 ${compact ? 'sm:col-span-9' : 'sm:col-span-8'}`}>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
              className="hidden"
            />

            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-coastal-kelp to-coastal-rust px-4 py-2 text-xs font-semibold text-coastal-card shadow-coastal hover:opacity-95 disabled:opacity-60 transition-all"
            >
              <AppIcon
                name={isUploading ? 'loader' : 'cloudUpload'}
                className={`h-3.5 w-3.5 ${isUploading ? 'animate-spin' : ''}`}
              />
              {isUploading ? t('cms.s3Uploading') : t('cms.s3UploadBtn')}
            </button>

            {uploadNotice && (
              <span className="inline-flex items-center gap-1 rounded-full border border-coastal-border bg-coastal-stone px-2.5 py-1 text-[11px] font-semibold text-coastal-deep">
                <AppIcon name="checkCircle" className="h-3.5 w-3.5 text-coastal-rust-hover" />
                {uploadNotice}
              </span>
            )}
          </div>

          <div className="relative">
            <AppIcon
              name="link"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-coastal-muted"
            />
            <input
              type="url"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t('cms.s3UrlPlaceholder')}
              className="w-full rounded-full border border-coastal-line bg-coastal-bg pl-9 pr-4 py-1.5 font-mono text-xs text-coastal-ink placeholder:text-coastal-muted focus:border-coastal-kelp focus:bg-coastal-card focus:outline-none transition-all"
            />
          </div>

          {!compact && (
            <p className="text-[11px] text-coastal-muted leading-snug">
              {t('cms.s3DropHint')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
