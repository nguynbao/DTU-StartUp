'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { ProductCard } from '@/components/common/ProductCard';
import { EcoImpactBadge } from '@/components/common/EcoImpactBadge';
import { ThreeCanvasViewer } from '@/components/three/ThreeCanvasViewer';
import { PriceTag } from '@/components/ui/PriceTag';
import { AppIcon } from '@/components/ui/AppIcon';
import { ASSETS, resolveAssetUrl } from '@/config/assets';
import { PRODUCT_COLOR_PRESETS } from '@/config/theme';
import { IconName } from '@/config/icons';
import { useI18n } from '@/i18n/I18nContext';
import { useCart } from '@/context/CartContext';
import {
  FALLBACK_MATERIALS,
  FALLBACK_PRODUCTS,
  getCustomMaterials,
  getProducts,
} from '@/lib/api';
import { CustomMaterial, Placement3D, Product, ProductCategory } from '@/types';

const DEMO_PLACEMENTS: Placement3D[] = [
  {
    placementId: 'store-demo-p1',
    materialId: 'mat-shell-01',
    materialName: 'Vỏ Sò Điệp Trắng',
    meshPreset: 'scallop_shell',
    unitPrice: 15000,
    position: [-0.32, 0.22, 0.56],
    normal: [-0.28, 0.08, 0.95],
    rotation: 10,
    scale: 1.15,
    color: PRODUCT_COLOR_PRESETS.sandCream,
  },
  {
    placementId: 'store-demo-p2',
    materialId: 'mat-shell-02',
    materialName: 'Vỏ Sò Điệp Hồng San Hô',
    meshPreset: 'scallop_shell',
    unitPrice: 18000,
    position: [0.32, 0.22, 0.56],
    normal: [0.28, 0.08, 0.95],
    rotation: -15,
    scale: 1.15,
    color: PRODUCT_COLOR_PRESETS.coralShell,
  },
  {
    placementId: 'store-demo-p3',
    materialId: 'mat-charm-01',
    materialName: 'Charm Sao Biển Đúc Đồng',
    meshPreset: 'starfish_charm',
    unitPrice: 22000,
    position: [0.0, -0.15, 0.58],
    normal: [0.0, 0.02, 0.99],
    rotation: 0,
    scale: 1.2,
    color: PRODUCT_COLOR_PRESETS.copperStarfish,
  },
];

export default function WebStoreHomePage() {
  const { t, locale } = useI18n();
  const isEn = locale === 'en';
  const { addStandardItem } = useCart();

  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [materials, setMaterials] = useState<CustomMaterial[]>(FALLBACK_MATERIALS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [heroPreset, setHeroPreset] = useState<string>('tote_bag');
  const [heroBaseColor, setHeroBaseColor] = useState<string>(PRODUCT_COLOR_PRESETS.kelpGreen);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getProducts(), getCustomMaterials()]).then(([prods, mats]) => {
      if (!mounted) return;
      if (prods && prods.length > 0) setProducts(prods);
      if (mats && mats.length > 0) setMaterials(mats);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleQuickAddToCart = (product: Product) => {
    addStandardItem(product, 1);
    setToastMsg(
      isEn
        ? `Added "${product.name}" to your cart.`
        : `Đã thêm "${product.name}" vào giỏ hàng.`
    );
    setTimeout(() => setToastMsg(null), 2800);
  };

  const categoryCards: {
    id: 'all' | ProductCategory;
    label: string;
    subtitle: string;
    icon: IconName;
    imageUrl: string;
  }[] = [
    {
      id: 'all',
      label: isEn ? 'All Upcycled Items' : 'Tất cả sản phẩm',
      subtitle: `${products.length} ${t('common.items')}`,
      icon: 'sparkles',
      imageUrl: ASSETS.products.toteBagMain,
    },
    {
      id: 'bag',
      label: t('categories.bag'),
      subtitle: isEn ? 'Hand-woven ghost net totes' : 'Túi đan tay từ lưới biển',
      icon: 'shoppingBag',
      imageUrl: ASSETS.products.toteBagAlt,
    },
    {
      id: 'basket',
      label: t('categories.basket'),
      subtitle: isEn ? 'Durable storage & market baskets' : 'Giỏ đựng đồ sợi lưới dẻo dai',
      icon: 'package',
      imageUrl: ASSETS.products.marketBasket,
    },
    {
      id: 'bracelet',
      label: t('categories.bracelet'),
      subtitle: isEn ? 'Sequential shell & snail cords' : 'Vòng tay đính sò/ốc nối chuỗi',
      icon: 'shell',
      imageUrl: ASSETS.products.braidedBracelet,
    },
    {
      id: 'wallet',
      label: t('categories.wallet'),
      subtitle: isEn ? 'Compact upcycled net wallets' : 'Ví cầm tay sợi lưới chống thấm',
      icon: 'shieldCheck',
      imageUrl: ASSETS.products.zipWallet,
    },
    {
      id: 'apparel',
      label: t('categories.apparel'),
      subtitle: isEn ? 'Coastal mesh vests & wearables' : 'Áo khoác & phụ kiện dệt lưới',
      icon: 'layers',
      imageUrl: ASSETS.products.oceanVest,
    },
  ];

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const totalNetRecoveredGrams = useMemo(
    () => products.reduce((sum, p) => sum + (p.ecoImpact?.netWeightGrams || 250), 0),
    [products]
  );

  return (
    <div className="min-h-screen flex flex-col bg-coastal-bg">
      <AppHeader variant="store" />

      {/* Toast Notification */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full bg-coastal-kelp px-5 py-3 text-xs font-semibold text-coastal-card shadow-lg animate-fade-in"
        >
          <AppIcon name="checkCircle" className="h-4 w-4 text-coastal-card" />
          {toastMsg}
        </div>
      )}

      <main className="flex-1">
        {/* ================================================================= */}
        {/* 1. STORE HERO BANNER (META ASTRYX BENTO + AWS S3 PHOTOGRAPHY)     */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden border-b border-coastal-line bg-coastal-bg py-8 sm:py-12 lg:py-14">
          <div className="pointer-events-none absolute -top-28 -left-24 h-80 w-80 rounded-full bg-coastal-kelp/10 blur-3xl" />
          <div className="pointer-events-none absolute top-16 -right-24 h-80 w-80 rounded-full bg-coastal-rust/10 blur-3xl" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
              {/* Left 7 Cols: Store Value Proposition & Direct Shopping CTAs */}
              <div className="lg:col-span-7 astryx-bento p-6 sm:p-9 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="astryx-pill bg-coastal-mist text-coastal-kelp">
                      <AppIcon name="waves" className="h-3.5 w-3.5" />
                      {isEn
                        ? 'OFFICIAL UPCYCLED COASTAL STORE'
                        : 'CỬA HÀNG THỦ CÔNG LƯỚI BIỂN TÁI CHẾ'}
                    </span>
                    <span className="astryx-pill bg-coastal-stone text-coastal-rust font-mono">
                      <AppIcon name="sparkles" className="h-3.5 w-3.5" />
                      AWS S3 CDN • 3D WebGL
                    </span>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-coastal-ink leading-[1.12]">
                    {isEn ? (
                      <>
                        Shop Upcycled Ocean Net Crafts &{' '}
                        <span className="gradient-ocean-leaf">Bespoke 3D Shell Designs</span>
                      </>
                    ) : (
                      <>
                        Cửa Hàng Túi, Giỏ, Vòng Tay Lưới Biển &{' '}
                        <span className="gradient-ocean-leaf">Tùy Biến Vỏ Sò 3D</span>
                      </>
                    )}
                  </h1>

                  <p className="text-sm sm:text-base text-coastal-slate leading-relaxed max-w-2xl">
                    {isEn
                      ? 'Every bag, basket, wallet, and sequential shell bracelet is hand-woven by Da Nang coastal artisans from recovered ghost fishing nets. Buy ready-to-wear pieces or customize 360° in our interactive 3D Studio.'
                      : 'Mỗi chiếc túi xách, giỏ đi chợ, ví cầm tay và vòng tay nối chuỗi đều được nghệ nhân làng chài Đà Nẵng đan thủ công từ lưới đánh cá thu hồi. Chọn mua sẵn hoặc tự tay đính vỏ sò, ốc biển trên mô hình 3D 360°.'}
                  </p>
                </div>

                {/* Primary Store Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/shop"
                    className="astryx-btn-primary px-6 py-3.5 text-sm shadow-md"
                  >
                    <AppIcon name="shoppingBag" className="h-4 w-4" />
                    {isEn ? 'Browse Full Catalog' : 'Khám Phá Cửa Hàng'}
                    <AppIcon name="arrowRight" className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/customizer"
                    className="astryx-btn-leaf px-6 py-3.5 text-sm shadow-md"
                  >
                    <AppIcon name="sparkles" className="h-4 w-4" />
                    {isEn ? 'Open 3D Design Studio' : 'Mở Xưởng Thiết Kế 3D'}
                  </Link>

                  <Link
                    href="/orders"
                    className="astryx-btn-secondary px-5 py-3.5 text-sm"
                  >
                    <AppIcon name="package" className="h-4 w-4 text-coastal-kelp" />
                    {isEn ? 'Track Order' : 'Tra Cứu Đơn Hàng'}
                  </Link>
                </div>

                {/* Store Quick Metrics Bar */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-coastal-line">
                  <div className="rounded-xl bg-coastal-bg/80 p-3 border border-coastal-line">
                    <span className="block font-mono text-lg sm:text-xl font-bold text-coastal-kelp">
                      {products.length}
                    </span>
                    <span className="text-[11px] text-coastal-slate">
                      {isEn ? 'Upcycled Blanks' : 'Dòng phôi túi/vòng'}
                    </span>
                  </div>
                  <div className="rounded-xl bg-coastal-bg/80 p-3 border border-coastal-line">
                    <span className="block font-mono text-lg sm:text-xl font-bold text-coastal-rust">
                      {materials.length}
                    </span>
                    <span className="text-[11px] text-coastal-slate">
                      {isEn ? '3D Shells & Charms' : 'Loại vỏ sò & ốc 3D'}
                    </span>
                  </div>
                  <div className="rounded-xl bg-coastal-bg/80 p-3 border border-coastal-line">
                    <span className="block font-mono text-lg sm:text-xl font-bold text-coastal-ink">
                      {(totalNetRecoveredGrams / 1000).toFixed(1)} kg
                    </span>
                    <span className="text-[11px] text-coastal-slate">
                      {isEn ? 'Net Recovered / Lot' : 'Lưới biển thu hồi'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: S3 Featured Product Bento Showcase */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                {/* Main Featured Tote Card */}
                <Link
                  href="/customizer?product=tui-xach-luoi-dai-duong-son-tra"
                  className="col-span-2 group relative overflow-hidden rounded-3xl border border-coastal-line bg-coastal-card shadow-xs min-h-[240px] flex items-end p-5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveAssetUrl(ASSETS.products.toteBagMain, ASSETS.landing.oceanHero)}
                    alt="Túi Xách Lưới Đại Dương Sơn Trà"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-coastal-ink/85 via-coastal-ink/30 to-transparent" />
                  <div className="relative z-10 w-full flex items-end justify-between gap-3">
                    <div>
                      <span className="astryx-pill bg-coastal-card/90 text-coastal-kelp mb-2">
                        <AppIcon name="sparkles" className="h-3.5 w-3.5" />
                        {isEn ? 'Best Seller • 3D Ready' : 'Bán chạy nhất • Hỗ trợ 3D'}
                      </span>
                      <h2 className="font-serif text-lg sm:text-xl font-semibold text-coastal-card">
                        {isEn ? 'Son Tra Ocean Net Tote Bag' : 'Túi Xách Lưới Đại Dương Sơn Trà'}
                      </h2>
                      <p className="text-xs text-coastal-card/80">
                        {isEn ? '350g Ghost Net • Click to customize 3D' : '350g lưới biển • Chạm để thiết kế 3D'}
                      </p>
                    </div>
                    <span className="rounded-full bg-coastal-card px-3.5 py-2 font-mono text-xs font-bold text-coastal-kelp shrink-0 shadow-xs">
                      320.000đ
                    </span>
                  </div>
                </Link>

                {/* Sub Card 1: Sequential Shell Bracelet */}
                <Link
                  href="/customizer?product=vong-tay-luoi-bien-ben-thung-chai"
                  className="group relative overflow-hidden rounded-2xl border border-coastal-line bg-coastal-card min-h-[165px] flex items-end p-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveAssetUrl(ASSETS.products.braidedBracelet)}
                    alt="Vòng Tay Lưới Biển"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-coastal-ink/80 via-coastal-ink/20 to-transparent" />
                  <div className="relative z-10">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-coastal-mist">
                      {isEn ? '12-Slot Chain' : 'Đính nối tiếp 12 nút'}
                    </span>
                    <span className="font-serif text-sm font-semibold text-coastal-card">
                      {isEn ? 'Shell Cord Bracelet' : 'Vòng Tay Vỏ Sò 3D'}
                    </span>
                  </div>
                </Link>

                {/* Sub Card 2: Market Basket */}
                <Link
                  href="/customizer?product=gio-di-cho-luoi-bien-cu-lao-cham"
                  className="group relative overflow-hidden rounded-2xl border border-coastal-line bg-coastal-card min-h-[165px] flex items-end p-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveAssetUrl(ASSETS.products.marketBasket)}
                    alt="Giỏ Đi Chợ Lưới Biển"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-coastal-ink/80 via-coastal-ink/20 to-transparent" />
                  <div className="relative z-10">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-coastal-mist">
                      {isEn ? '420g Ghost Net' : '420g Lưới thu hồi'}
                    </span>
                    <span className="font-serif text-sm font-semibold text-coastal-card">
                      {isEn ? 'Cu Lao Cham Basket' : 'Giỏ Lưới Cù Lao Chàm'}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. CATEGORY QUICK FILTER CARDS & FEATURED PRODUCT CATALOG         */}
        {/* ================================================================= */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="astryx-pill bg-coastal-mist text-coastal-kelp">
                  <AppIcon name="shoppingBag" className="h-3.5 w-3.5" />
                  {isEn ? 'STORE CATALOG' : 'DANH MỤC SẢN PHẨM TÁI CHẾ'}
                </span>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-coastal-ink">
                  {isEn
                    ? 'Choose a Category or Buy Ready-to-Wear'
                    : 'Chọn Danh Mục Hoặc Mua Ngay Sản Phẩm Sẵn Có'}
                </h2>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-coastal-kelp hover:underline"
              >
                {isEn ? 'Open Advanced Filter & Search' : 'Mở bộ lọc nâng cao & tìm kiếm'}
                <AppIcon name="arrowRight" className="h-4 w-4" />
              </Link>
            </div>

            {/* Category Quick Filter Bento Strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categoryCards.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`group text-left rounded-2xl border p-3.5 transition-all ${
                      isActive
                        ? 'border-coastal-kelp bg-coastal-mist/70 shadow-sm ring-2 ring-coastal-kelp/20'
                        : 'border-coastal-line bg-coastal-card hover:border-coastal-kelp/40 hover:bg-coastal-mist/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                          isActive
                            ? 'bg-coastal-kelp text-coastal-card'
                            : 'bg-coastal-mist text-coastal-kelp'
                        }`}
                      >
                        <AppIcon name={cat.icon} className="h-4 w-4" />
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveAssetUrl(cat.imageUrl)}
                        alt={cat.label}
                        className="h-9 w-9 rounded-lg object-cover border border-coastal-line"
                      />
                    </div>
                    <div className="font-semibold text-xs sm:text-sm text-coastal-ink line-clamp-1">
                      {cat.label}
                    </div>
                    <div className="mt-0.5 text-[11px] text-coastal-slate line-clamp-1">
                      {cat.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  showCustomCta={true}
                  onAddToCart={handleQuickAddToCart}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 3. INTERACTIVE 3D STUDIO PREVIEW (TRY BEFORE YOU CUSTOMIZE)       */}
        {/* ================================================================= */}
        <section className="border-t border-coastal-line bg-coastal-sand/50 py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="astryx-bento p-6 sm:p-10 grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
              {/* Left 5 Cols: Preset & Color Controls */}
              <div className="lg:col-span-5 space-y-5">
                <span className="astryx-pill bg-coastal-stone text-coastal-rust">
                  <AppIcon name="compass" className="h-3.5 w-3.5" />
                  {isEn ? 'INTERACTIVE 360° 3D STUDIO' : 'TRẢI NGHIỆM XƯỞNG ĐÍNH VỎ SÒ 3D'}
                </span>

                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-coastal-ink">
                  {isEn
                    ? 'Preview 3D Models & Real-Time BOM Pricing'
                    : 'Xoay Thử Mô Hình 3D 360° & Tính Giá Tự Động'}
                </h2>

                <p className="text-sm text-coastal-slate leading-relaxed">
                  {isEn
                    ? 'Switch between upcycled product blanks below or jump directly into the full 3D Customizer Studio to pin shells, sea snails, and charms anywhere on the surface.'
                    : 'Chọn thử phôi sản phẩm và màu sợi lưới bên dưới, hoặc mở Xưởng Thiết Kế 3D để tự tay gắn từng vỏ sò điệp, ốc xà cừ, ốc sứ và sao biển lên bề mặt túi.'}
                </p>

                {/* Preset Switcher */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-coastal-slate">
                    {isEn ? '1. Select 3D Product Blank:' : '1. Chọn phôi mô hình 3D:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'tote_bag', label: isEn ? 'Ocean Tote Bag' : 'Túi Xách Lưới' },
                      { id: 'market_basket', label: isEn ? 'Market Basket' : 'Giỏ Đi Chợ' },
                      { id: 'braided_bracelet', label: isEn ? '12-Slot Bracelet' : 'Vòng Tay 12 Nút' },
                      { id: 'zip_wallet', label: isEn ? 'Zip Wallet' : 'Ví Khóa Kéo' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setHeroPreset(preset.id)}
                        className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all text-left ${
                          heroPreset === preset.id
                            ? 'border-coastal-kelp bg-coastal-kelp text-coastal-card shadow-xs'
                            : 'border-coastal-line bg-coastal-card text-coastal-ink hover:border-coastal-kelp/40'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Net Color Swatches */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-coastal-slate">
                    {isEn ? '2. Upcycled Net Colorway:' : '2. Đổi màu sợi lưới tái chế:'}
                  </span>
                  <div className="flex items-center gap-2.5">
                    {[
                      { hex: PRODUCT_COLOR_PRESETS.kelpGreen, name: 'Ocean Aqua' },
                      { hex: PRODUCT_COLOR_PRESETS.terracottaRust, name: 'Fresh Leaf' },
                      { hex: PRODUCT_COLOR_PRESETS.deepNavy, name: 'Deep Navy' },
                      { hex: PRODUCT_COLOR_PRESETS.coralShell, name: 'Sunset Coral' },
                    ].map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => setHeroBaseColor(swatch.hex)}
                        className={`h-8 w-8 rounded-full border-2 transition-transform ${
                          heroBaseColor === swatch.hex
                            ? 'scale-110 border-coastal-ink ring-2 ring-coastal-kelp/30'
                            : 'border-coastal-card hover:scale-105'
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                        aria-label={swatch.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-coastal-line">
                  <div>
                    <span className="block text-[11px] text-coastal-slate">
                      {isEn ? 'Estimated 3D Sample Price' : 'Giá ước tính mẫu 3D (kèm 3 vỏ sò)'}
                    </span>
                    <PriceTag amount={405000} size="lg" />
                  </div>

                  <Link
                    href="/customizer"
                    className="astryx-btn-primary px-6 py-3.5 text-sm shadow-md"
                  >
                    <AppIcon name="sparkles" className="h-4 w-4" />
                    {isEn ? 'Customize in 3D Studio' : 'Tùy Biến Trong Xưởng 3D'}
                  </Link>
                </div>
              </div>

              {/* Right 7 Cols: Interactive 3D Canvas Viewer */}
              <div className="lg:col-span-7">
                <ThreeCanvasViewer
                  mode="preview"
                  productPreset={heroPreset}
                  baseColor={heroBaseColor}
                  strapColor={PRODUCT_COLOR_PRESETS.terracottaRust}
                  placements={DEMO_PLACEMENTS}
                  className="h-[380px] sm:h-[440px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. STORE GUARANTEE & ECO IMPACT FOOTER BANNER                     */}
        {/* ================================================================= */}
        <section className="border-t border-coastal-line bg-coastal-card py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex items-start gap-3.5 rounded-2xl border border-coastal-line bg-coastal-bg/60 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coastal-mist text-coastal-kelp">
                  <AppIcon name="recycle" className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-base font-semibold text-coastal-ink">
                    {isEn ? '100% Upcycled Ghost Nets' : '100% Lưới Đánh Cá Thu Hồi'}
                  </h3>
                  <p className="mt-1 text-xs text-coastal-slate leading-relaxed">
                    {isEn
                      ? 'Collected from Son Tra, Cu Lao Cham & Ly Son seas, ultrasonically cleaned and hand-woven.'
                      : 'Thu gom từ vùng biển Sơn Trà, Cù Lao Chàm & Lý Sơn, khử khuẩn siêu âm và đan thủ công.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-coastal-line bg-coastal-bg/60 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coastal-stone text-coastal-rust">
                  <AppIcon name="compass" className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-base font-semibold text-coastal-ink">
                    {isEn ? 'Exact 3D Coordinates Blueprint' : 'Bản Vẽ Tọa Độ 3D Chính Xác'}
                  </h3>
                  <p className="mt-1 text-xs text-coastal-slate leading-relaxed">
                    {isEn
                      ? 'Your 3D shell placements are saved as (x,y,z) coordinates for artisans to hand-stitch accurately.'
                      : 'Mọi vị trí vỏ sò bạn gắn trên 3D đều được lưu tọa độ (x,y,z) chuyển thẳng tới bàn khâu nghệ nhân.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <EcoImpactBadge
                  variant="product_detail"
                  netWeightGrams={totalNetRecoveredGrams}
                  originSea={isEn ? 'Central Vietnam Sea' : 'Biển Đà Nẵng & Quảng Nam'}
                  recycledPlasticPct={94}
                  artisanGroup={t('eco.defaultArtisanGroup')}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
