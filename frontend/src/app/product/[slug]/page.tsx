'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { ThreeCanvasViewer } from '@/components/three/ThreeCanvasViewer';
import { EcoImpactBadge } from '@/components/common/EcoImpactBadge';
import { ProductCard } from '@/components/common/ProductCard';
import { SectionHeading } from '@/components/common/SectionHeading';
import { AppIcon } from '@/components/ui/AppIcon';
import { PriceTag } from '@/components/ui/PriceTag';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ASSETS } from '@/config/assets';
import { PRODUCT_COLOR_PRESETS } from '@/config/theme';
import { useI18n } from '@/i18n/I18nContext';
import { FALLBACK_PRODUCTS, getProductBySlug, getProducts } from '@/lib/api';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

const DEFAULT_COLOR_PALETTE = [
  PRODUCT_COLOR_PRESETS.kelpGreen,
  PRODUCT_COLOR_PRESETS.deepNavy,
  PRODUCT_COLOR_PRESETS.driftwoodBrown,
  PRODUCT_COLOR_PRESETS.charcoalInk,
  PRODUCT_COLOR_PRESETS.amberCord,
];

export default function ProductDetailPage() {
  const { t } = useI18n();
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug || 'tui-xach-luoi-dai-duong-son-tra';

  const { addStandardItem } = useCart();

  const [product, setProduct] = useState<Product>(
    () => FALLBACK_PRODUCTS.find((p) => p.slug === slug) || FALLBACK_PRODUCTS[0]
  );
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(
    FALLBACK_PRODUCTS.slice(0, 3)
  );
  const [viewMode, setViewMode] = useState<'3d' | 'image'>('3d');
  const [selectedColor, setSelectedColor] = useState<string>(
    product.model3D?.defaultBaseColor || PRODUCT_COLOR_PRESETS.kelpGreen
  );
  const [selectedStrapColor, setSelectedStrapColor] = useState<string>(
    product.model3D?.defaultStrapColor || PRODUCT_COLOR_PRESETS.terracottaRust
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes?.[0] || t('common.standardSize')
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProductBySlug(slug).then((data) => {
      if (!active || !data) return;
      setProduct(data);
      setSelectedColor(
        data.model3D?.defaultBaseColor || data.colors?.[0] || PRODUCT_COLOR_PRESETS.kelpGreen
      );
      setSelectedStrapColor(
        data.model3D?.defaultStrapColor || PRODUCT_COLOR_PRESETS.terracottaRust
      );
      setSelectedSize(data.sizes?.[0] || 'Tiêu chuẩn');
    });

    getProducts().then((list) => {
      if (!active) return;
      setRelatedProducts(list.filter((p) => p.slug !== slug).slice(0, 3));
    });

    return () => {
      active = false;
    };
  }, [slug]);

  const handleAddStandard = () => {
    addStandardItem(product, quantity, selectedColor, selectedSize);
    setToastMsg(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng.`);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const colorPalette = product.colors?.length ? product.colors : DEFAULT_COLOR_PALETTE;

  return (
    <div className="min-h-screen flex flex-col bg-coastal-bg">
      <AppHeader variant="default" />

      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-coastal-kelp px-5 py-3 text-xs font-semibold text-coastal-card shadow-lg"
        >
          <AppIcon name="checkCircle" className="h-4 w-4 text-coastal-card" />
          {toastMsg}
        </div>
      )}

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-coastal-slate">
            <Link
              href="/shop"
              className="astryx-pill bg-coastal-card hover:bg-coastal-mist text-coastal-kelp"
            >
              <AppIcon name="arrowLeft" className="h-3.5 w-3.5" />
              {t('header.navShop')}
            </Link>
            <span>/</span>
            <span className="text-coastal-ink font-medium">{product.name}</span>
          </nav>

          <div className="astryx-bento p-5 sm:p-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column (7 cols): 360° 3D Viewer & Image Switcher */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 astryx-card p-3">
                <div className="astryx-segmented">
                  <button
                    type="button"
                    onClick={() => setViewMode('3d')}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      viewMode === '3d'
                        ? 'bg-coastal-kelp text-coastal-card shadow-xs'
                        : 'text-coastal-slate hover:bg-coastal-mist'
                    }`}
                  >
                    <AppIcon name="box" className="h-4 w-4" />
                    {t('three.badgePreview')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('image')}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      viewMode === 'image'
                        ? 'bg-coastal-kelp text-coastal-card shadow-xs'
                        : 'text-coastal-slate hover:bg-coastal-mist'
                    }`}
                  >
                    <AppIcon name="image" className="h-4 w-4" />
                    Ảnh Thực Tế Làng Nghề
                  </button>
                </div>

                <StatusBadge
                  status={
                    product.stock > 10
                      ? 'in_stock'
                      : product.stock > 0
                      ? 'low_stock'
                      : 'out_of_stock'
                  }
                  label={
                    product.stock > 0
                      ? `${product.stock} ${t('common.pieces')}`
                      : t('status.out_of_stock')
                  }
                />
              </div>

              <div className="h-[420px] sm:h-[500px] w-full overflow-hidden astryx-card p-2">
                <div className="h-full w-full overflow-hidden rounded-xl">
                  {viewMode === '3d' ? (
                    <ThreeCanvasViewer
                      mode="preview"
                      productPreset={product.model3D?.meshPreset || 'tote_bag'}
                      productGlbUrl={product.model3D?.glbUrl}
                      baseColor={selectedColor}
                      strapColor={selectedStrapColor}
                      placements={[]}
                      braceletConfig={
                        product.category === 'bracelet'
                          ? { wristSizeCm: 16, slotCount: 12 }
                          : undefined
                      }
                      autoRotate={true}
                      className="h-full w-full"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={product.images?.[0] || ASSETS.placeholders.product}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): H1, Price, EcoImpactBadge, Options & CTAs */}
            <div className="lg:col-span-5 space-y-6 astryx-card p-6 sm:p-8">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-coastal-kelp">
                    SKU: {product.sku || 'DTU-UPCYCLE'}
                  </span>
                  {product.isCustomizable && (
                    <span className="astryx-pill border-coastal-rust/40 bg-coastal-rust/10 text-coastal-rust">
                      <AppIcon name="compass" className="h-3 w-3" />
                      {t('common.custom3D')}
                    </span>
                  )}
                </div>

                <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-coastal-ink">
                  {product.name}
                </h1>

                <div className="mt-3 flex items-baseline gap-3">
                  <PriceTag amount={product.basePrice} size="xl" suffix={t('common.perItem')} />
                </div>

                <p className="mt-3 text-sm text-coastal-slate leading-relaxed">
                  {product.description}
                </p>
              </div>

              <EcoImpactBadge
                variant="product_detail"
                netWeightGrams={product.ecoImpact?.netWeightGrams || 350}
                originSea={product.ecoImpact?.originSea || t('eco.defaultOriginSea')}
                recycledPlasticPct={product.ecoImpact?.recycledPlasticPct || 92}
                artisanGroup={product.ecoImpact?.artisanGroup || t('eco.defaultArtisanGroup')}
              />

              <div className="space-y-4 border-t border-coastal-line pt-4">
                <div>
                  <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-coastal-ink mb-2">
                    {t('customizer.cordColorLabel')}:
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {colorPalette.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => {
                          setSelectedColor(hex);
                          setViewMode('3d');
                        }}
                        aria-label={`Chọn màu ${hex}`}
                        className={`h-7 w-7 rounded-full border transition ${
                          selectedColor === hex
                            ? 'border-coastal-rust scale-110 ring-2 ring-coastal-rust/30'
                            : 'border-coastal-line'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>

                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-coastal-ink mb-2">
                      Kích cỡ đan thủ công:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                            selectedSize === sz
                              ? 'border-coastal-kelp bg-coastal-mist text-coastal-ink font-semibold'
                              : 'border-coastal-line bg-coastal-card text-coastal-slate hover:bg-coastal-bg'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-coastal-ink">
                    Số lượng đặt:
                  </span>
                  <div className="astryx-segmented">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="rounded-full px-3.5 py-1 font-mono text-sm font-bold text-coastal-ink hover:bg-coastal-mist"
                    >
                      -
                    </button>
                    <span className="px-4 font-mono text-sm font-semibold text-coastal-ink">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="rounded-full px-3.5 py-1 font-mono text-sm font-bold text-coastal-ink hover:bg-coastal-mist"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {product.isCustomizable && (
                  <button
                    type="button"
                    onClick={() => router.push(`/customizer?product=${product.slug}`)}
                    className="w-full astryx-btn-leaf px-5 py-4 text-sm"
                  >
                    <AppIcon name="compass" className="h-4 w-4" />
                    {product.category === 'bracelet'
                      ? `Tự Kết Chuỗi Vòng Tay 3D Ngay (+${product.craftFee.toLocaleString('vi-VN')}đ)`
                      : `Tự Đính Vỏ Sò & Chế Tác 3D Ngay (+${product.craftFee.toLocaleString('vi-VN')}đ)`}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAddStandard}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-coastal-kelp bg-coastal-card px-5 py-3.5 text-sm font-semibold text-coastal-kelp hover:bg-coastal-mist transition"
                >
                  <AppIcon name="shoppingBag" className="h-4 w-4" />
                  {t('common.buyReady')}
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-coastal-line bg-coastal-bg p-3 text-xs text-coastal-slate">
                <AppIcon name="shieldCheck" className="h-4 w-4 text-coastal-kelp shrink-0" />
                <span>{t('footer.guaranteeWarranty')}</span>
              </div>
            </div>
          </div>

          <section aria-label="Sản phẩm gợi ý" className="pt-8 border-t border-coastal-line">
            <SectionHeading
              eyebrow="Khám Phá Thêm"
              title="Các Phôi Lưới Đại Dương Khác Có Thể Chế Tác 3D"
            />
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item._id}
                  product={item}
                  showCustomCta={true}
                  onAddToCart={(p) => {
                    addStandardItem(p, 1);
                    setToastMsg(`Đã thêm "${p.name}" vào giỏ hàng.`);
                    setTimeout(() => setToastMsg(null), 2500);
                  }}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
