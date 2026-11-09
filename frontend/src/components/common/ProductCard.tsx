'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { EcoImpactBadge } from '@/components/common/EcoImpactBadge';
import { PriceTag } from '@/components/ui/PriceTag';
import { AppIcon } from '@/components/ui/AppIcon';
import { ASSETS, resolveAssetUrl } from '@/config/assets';
import { useI18n } from '@/i18n/I18nContext';

export interface ProductCardProps {
  product: Product;
  showCustomCta?: boolean;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({
  product,
  showCustomCta = true,
  onAddToCart,
}: ProductCardProps) {
  const { t } = useI18n();

  const imageUrl = resolveAssetUrl(
    product.images?.[0] || product.thumbnail,
    ASSETS.placeholders.product
  );

  const categoryLabel = t(`categories.${product.category}`);

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-coastal-line bg-coastal-card p-3 shadow-coastal transition-all duration-200 hover:-translate-y-1 hover:border-coastal-kelp-light hover:shadow-coastal-lg">
      <div>
        {/* Concentric Inner Media Frame (outer rounded-2xl minus p-3 = inner rounded-xl) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-coastal-line/50 bg-coastal-mist">
          <Link href={`/product/${product.slug}`} className="block h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </Link>

          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            <EcoImpactBadge
              variant="pill"
              netWeightGrams={product.ecoImpact?.netWeightGrams || 250}
            />
          </div>

          {product.isCustomizable && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full border border-coastal-border bg-coastal-card/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-coastal-deep shadow-coastal backdrop-blur-md">
              <AppIcon name="compass" className="h-3 w-3 text-coastal-rust" />
              {t('common.custom3D')}
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="px-1.5 pt-3.5 pb-2">
          <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-coastal-slate">
            <span className="inline-flex items-center gap-1 rounded-full bg-coastal-mist px-2.5 py-0.5 font-semibold uppercase tracking-wider text-coastal-kelp">
              {categoryLabel}
            </span>
            <span className="truncate text-coastal-muted">
              {product.ecoImpact?.originSea || t('common.centralSea')}
            </span>
          </div>

          <h3 className="mt-2 font-serif text-lg font-bold tracking-tight text-coastal-ink line-clamp-1 group-hover:text-coastal-kelp transition-colors">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>

          <p className="mt-1 text-xs text-coastal-slate line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>
      </div>

      {/* Price & Astryx Pill Actions Footer */}
      <div className="mt-2 border-t border-coastal-line/70 px-1.5 pt-3 pb-1">
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-coastal-muted">
              {t('common.listPrice')}
            </span>
            <PriceTag amount={product.basePrice} size="md" />
          </div>

          {product.colors && product.colors.length > 0 && (
            <div
              className="flex items-center gap-1 rounded-full border border-coastal-line/80 bg-coastal-bg px-2 py-1"
              title={t('common.netColorPalette')}
            >
              {product.colors.slice(0, 4).map((hex) => (
                <span
                  key={hex}
                  className="h-3 w-3 rounded-full border border-coastal-line shadow-2xs"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {onAddToCart ? (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-coastal-line bg-coastal-bg px-3 py-2 text-xs font-semibold text-coastal-ink hover:border-coastal-kelp hover:bg-coastal-mist transition-all"
            >
              <AppIcon name="shoppingBag" className="h-3.5 w-3.5 text-coastal-kelp" />
              {t('common.buyReady')}
            </button>
          ) : (
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-coastal-line bg-coastal-bg px-3 py-2 text-xs font-semibold text-coastal-ink hover:border-coastal-kelp hover:bg-coastal-mist transition-all"
            >
              {t('common.view3D')}
            </Link>
          )}

          {showCustomCta && product.isCustomizable ? (
            <Link
              href={`/customizer?product=${product.slug}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-coastal-kelp to-coastal-rust px-3 py-2 text-xs font-semibold text-coastal-card shadow-coastal hover:opacity-95 transition-all"
            >
              <AppIcon name="compass" className="h-3.5 w-3.5 text-coastal-card" />
              {t('common.design3D')}
            </Link>
          ) : (
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex items-center justify-center rounded-full bg-coastal-kelp px-3 py-2 text-xs font-semibold text-coastal-card shadow-coastal hover:bg-coastal-kelp-hover transition-all"
            >
              {t('common.detail')}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
