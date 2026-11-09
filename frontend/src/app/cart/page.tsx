'use client';

import React from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { BomPriceBreakdownCard } from '@/components/common/BomPriceBreakdownCard';
import { EcoImpactBadge } from '@/components/common/EcoImpactBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { AppIcon } from '@/components/ui/AppIcon';
import { PriceTag, formatVnd } from '@/components/ui/PriceTag';
import { ASSETS } from '@/config/assets';
import { useI18n } from '@/i18n/I18nContext';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { t } = useI18n();
  const {
    items,
    totalItemsCount,
    subtotalAmount,
    totalNetWeightGrams,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const shippingFee = items.length > 0 ? (subtotalAmount >= 500000 ? 0 : 30000) : 0;
  const finalAmount = subtotalAmount + shippingFee;

  return (
    <div className="min-h-screen flex flex-col bg-coastal-bg">
      <AppHeader variant="default" />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="astryx-bento p-6 sm:p-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="astryx-pill bg-coastal-mist text-coastal-kelp">
                <AppIcon name="shoppingBag" className="h-3.5 w-3.5" />
                Giỏ Hàng Xanh & Bản Vẽ Chế Tác 3D
              </span>
              <h1 className="mt-2.5 font-serif text-3xl sm:text-4xl font-semibold text-coastal-ink">
                {t('store.cartHeading')} ({totalItemsCount} {t('common.items')})
              </h1>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-full border border-coastal-rust/30 bg-coastal-rust/10 px-4 py-2 text-xs font-semibold text-coastal-rust hover:bg-coastal-rust/20 transition"
              >
                Xóa toàn bộ giỏ hàng
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={<AppIcon name="shoppingBag" className="h-6 w-6" />}
              title="Giỏ hàng của bạn đang trống"
              description="Hãy khám phá các mẫu giỏ, túi xách, ví tiền, áo khoác, vòng tay từ lưới đánh cá đại dương hoặc tự tay đính vỏ sò trên phòng 3D Studio."
              actionLabel={t('landing.ctaShop')}
              actionHref="/shop"
            />
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-4">
                {items.map((item) => (
                  <article
                    key={item.cartItemId}
                    className="astryx-card p-5 sm:p-6"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-coastal-mist border border-coastal-line">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnail || ASSETS.placeholders.product}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                        {item.isCustom && (
                          <span className="absolute bottom-1 left-1 right-1 rounded-full bg-coastal-rust px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold text-coastal-card">
                            {t('common.custom3D')}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h2 className="font-serif text-lg font-semibold text-coastal-ink">
                              <Link
                                href={`/product/${item.productSlug}`}
                                className="hover:text-coastal-kelp"
                              >
                                {item.productName}
                              </Link>
                            </h2>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-coastal-slate">
                              <span>
                                Phân loại:{' '}
                                {item.customDesign?.braceletConfig
                                  ? `Cổ tay ${item.customDesign.braceletConfig.wristSizeCm}cm • ${item.customDesign.braceletConfig.slotCount} mắt`
                                  : item.selectedSize || t('common.standardSize')}
                              </span>
                              {item.selectedColor && (
                                <span className="inline-flex items-center gap-1">
                                  • Màu lưới:
                                  <span
                                    className="inline-block h-3 w-3 rounded-full border border-coastal-line"
                                    style={{ backgroundColor: item.selectedColor }}
                                  />
                                </span>
                              )}
                              <EcoImpactBadge
                                variant="pill"
                                netWeightGrams={item.netWeightGrams}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.cartItemId)}
                            aria-label="Xóa sản phẩm"
                            className="rounded-full p-2 text-coastal-slate hover:bg-coastal-rust/10 hover:text-coastal-rust transition"
                          >
                            <AppIcon name="trash" className="h-4 w-4" />
                          </button>
                        </div>

                        {item.isCustom && item.customDesign && (
                          <BomPriceBreakdownCard
                            variant="cart_compact"
                            baseProductName={item.productName}
                            basePrice={item.customDesign.basePrice}
                            craftFee={item.customDesign.craftFee}
                            placements={item.customDesign.placements}
                            quantity={item.quantity}
                          />
                        )}

                        {item.isCustom && item.customDesign?.artisanNote && (
                          <p className="mt-2 text-xs italic text-coastal-slate bg-coastal-bg border border-coastal-line rounded-xl px-3.5 py-2">
                            Ghi chú nghệ nhân: &ldquo;{item.customDesign.artisanNote}&rdquo;
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-between border-t border-coastal-line pt-3">
                          <div className="astryx-segmented">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              className="rounded-full px-3 py-1 font-mono text-sm font-bold text-coastal-ink hover:bg-coastal-mist"
                            >
                              -
                            </button>
                            <span className="px-3.5 font-mono text-xs font-semibold text-coastal-ink">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              className="rounded-full px-3 py-1 font-mono text-sm font-bold text-coastal-ink hover:bg-coastal-mist"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="block font-mono text-[11px] text-coastal-slate">
                              {formatVnd(item.unitPrice)} × {item.quantity}
                            </span>
                            <PriceTag amount={item.unitPrice * item.quantity} size="md" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="lg:col-span-4 space-y-4">
                <div className="astryx-bento p-6 space-y-4">
                  <h2 className="font-serif text-lg font-semibold text-coastal-ink border-b border-coastal-line pb-3">
                    Tóm Tắt Đơn Đặt Chế Tác
                  </h2>

                  <div className="rounded-xl bg-coastal-card border border-coastal-line p-3.5 text-xs text-coastal-kelp flex items-center gap-2.5">
                    <AppIcon name="recycle" className="h-5 w-5 text-coastal-kelp shrink-0" />
                    <div>
                      Đơn hàng này giúp thu hồi{' '}
                      <strong className="font-mono font-bold">
                        {totalNetWeightGrams.toLocaleString('vi-VN')}g
                      </strong>{' '}
                      lưới đánh cá đại dương.
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-coastal-slate">
                      <span>
                        Tạm tính ({totalItemsCount} {t('common.items')})
                      </span>
                      <strong className="font-mono text-coastal-ink">
                        {formatVnd(subtotalAmount)}
                      </strong>
                    </div>
                    <div className="flex justify-between text-coastal-slate">
                      <span>Phí vận chuyển hộp sinh thái</span>
                      <strong className="font-mono text-coastal-ink">
                        {shippingFee === 0 ? 'Miễn phí' : formatVnd(shippingFee)}
                      </strong>
                    </div>
                    <div className="border-t border-coastal-line pt-3 flex items-baseline justify-between">
                      <span className="text-base font-semibold text-coastal-ink">
                        {t('bom.totalForQuantity')}
                      </span>
                      <PriceTag amount={finalAmount} size="xl" />
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full astryx-btn-leaf px-5 py-3.5 text-sm"
                  >
                    {t('store.checkoutHeading')}
                    <AppIcon name="arrowRight" className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/customizer"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-coastal-kelp bg-coastal-card px-4 py-2.5 text-xs font-semibold text-coastal-kelp hover:bg-coastal-mist transition"
                  >
                    <AppIcon name="compass" className="h-3.5 w-3.5 text-coastal-rust" />
                    {t('landing.ctaStudio')}
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
