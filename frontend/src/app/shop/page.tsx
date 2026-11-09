'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { FilterToolbar } from '@/components/common/FilterToolbar';
import { ProductCard } from '@/components/common/ProductCard';
import { EmptyState } from '@/components/common/EmptyState';
import { AppIcon } from '@/components/ui/AppIcon';
import { useI18n } from '@/i18n/I18nContext';
import { FALLBACK_PRODUCTS, getProducts } from '@/lib/api';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: Thấp đến Cao' },
  { value: 'price_desc', label: 'Giá: Cao đến Thấp' },
];

function ShopCatalogContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const { addStandardItem } = useCart();

  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [onlyCustomizable, setOnlyCustomizable] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const categoryOptions = [
    { value: 'all', label: t('categories.all') },
    { value: 'bag', label: t('categories.bag') },
    { value: 'basket', label: t('categories.basket') },
    { value: 'wallet', label: t('categories.wallet') },
    { value: 'apparel', label: t('categories.apparel') },
    { value: 'bracelet', label: t('categories.bracelet') },
    { value: 'accessory', label: t('categories.accessory') },
  ];

  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    if (catFromUrl) {
      setSelectedCategory(catFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getProducts({
      category: selectedCategory,
      search,
      sort: selectedSort,
      isCustomizable: onlyCustomizable ? true : undefined,
    })
      .then((list) => {
        if (active) setProducts(list);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategory, search, selectedSort, onlyCustomizable]);

  const handleReset = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedSort('newest');
    setOnlyCustomizable(false);
  };

  const handleAddToCart = (product: Product) => {
    addStandardItem(product, 1);
    setToastMsg(`Đã thêm "${product.name}" vào giỏ hàng.`);
    setTimeout(() => setToastMsg(null), 2600);
  };

  return (
    <main className="flex-1 py-8 sm:py-12">
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-sm bg-coastal-kelp px-4 py-3 text-xs font-medium text-coastal-card shadow-lg"
        >
          <AppIcon name="checkCircle" className="h-4 w-4 text-coastal-card" />
          {toastMsg}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-coastal-line pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-coastal-line bg-coastal-mist px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-coastal-kelp">
              {t('header.navShop')}
            </span>
            <h1 className="mt-2.5 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-coastal-ink">
              {t('store.shopHeading')}
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-coastal-slate max-w-2xl">
              {t('store.shopSubtitle')}
            </p>
          </div>

          <Link
            href="/customizer"
            className="inline-flex items-center gap-2 rounded-sm bg-coastal-rust px-5 py-3 text-xs sm:text-sm font-semibold text-coastal-card hover:bg-coastal-rust-hover transition shrink-0"
          >
            <AppIcon name="compass" className="h-4 w-4" />
            {t('landing.ctaStudio')}
          </Link>
        </div>

        {/* Category Quick Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categoryOptions.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`rounded-sm px-3.5 py-2 text-xs font-medium transition ${
                selectedCategory === cat.value
                  ? 'bg-coastal-kelp text-coastal-card'
                  : 'bg-coastal-card border border-coastal-line text-coastal-slate hover:bg-coastal-mist'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Shared FilterToolbar */}
        <FilterToolbar
          searchValue={search}
          onSearchChange={setSearch}
          categoryOptions={categoryOptions}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortOptions={SORT_OPTIONS}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          toggleFilterLabel="Chỉ hiện SP hỗ trợ Chế tác 3D"
          toggleFilterChecked={onlyCustomizable}
          onToggleFilterChange={setOnlyCustomizable}
          onResetFilters={handleReset}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-96 animate-pulse rounded-sm border border-coastal-line bg-coastal-card p-4"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title={t('common.noDataTitle')}
            description={t('common.noDataDesc')}
            actionLabel={t('common.reset')}
            onAction={handleReset}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showCustomCta={true}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col bg-coastal-bg">
      <AppHeader variant="default" />
      <Suspense
        fallback={
          <main className="flex-1 mx-auto max-w-7xl px-4 py-12">
            <div className="h-96 animate-pulse rounded-sm bg-coastal-card" />
          </main>
        }
      >
        <ShopCatalogContent />
      </Suspense>
      <AppFooter />
    </div>
  );
}
