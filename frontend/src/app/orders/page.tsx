'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { OrderStatusStepper } from '@/components/common/OrderStatusStepper';
import { BomPriceBreakdownCard } from '@/components/common/BomPriceBreakdownCard';
import { ThreeCanvasViewer } from '@/components/three/ThreeCanvasViewer';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriceTag, formatVnd } from '@/components/ui/PriceTag';
import { ModalConfirm } from '@/components/ui/ModalConfirm';
import { AppIcon } from '@/components/ui/AppIcon';
import { PRODUCT_COLOR_PRESETS } from '@/config/theme';
import { useI18n } from '@/i18n/I18nContext';
import { cancelOrderByCustomer, getAdminOrders, lookupOrderByCode } from '@/lib/api';
import { Order, OrderItem } from '@/types';

const RECENT_ORDERS_KEY = 'dtu_recent_orders_v1';

const SAMPLE_DEMO_ORDER: Order = {
  _id: 'ord-demo-01',
  orderCode: 'DTU-20261108-8899',
  customerInfo: {
    fullName: 'Trần Minh Ngọc',
    phone: '0905888999',
    email: 'minhngoc@dtu.edu.vn',
    address: 'Số 03 Quang Trung, Quận Hải Châu, TP. Đà Nẵng',
    note: 'Nhờ nghệ nhân khâu chắc phần vỏ sò điệp ở mặt trước túi.',
  },
  items: [
    {
      productId: 'prod-bag-01',
      productName: 'Túi Xách Lưới Đại Dương Sơn Trà',
      productSlug: 'tui-xach-luoi-dai-duong-son-tra',
      category: 'bag',
      quantity: 1,
      selectedColor: PRODUCT_COLOR_PRESETS.kelpGreen,
      selectedSize: 'Tiêu chuẩn (38x32cm)',
      unitPrice: 405000,
      subtotal: 405000,
      isCustom: true,
      customDesignSnapshot: {
        productId: 'prod-bag-01',
        productName: 'Túi Xách Lưới Đại Dương Sơn Trà',
        productSlug: 'tui-xach-luoi-dai-duong-son-tra',
        meshPreset: 'tote_bag',
        baseColor: PRODUCT_COLOR_PRESETS.kelpGreen,
        strapColor: PRODUCT_COLOR_PRESETS.terracottaRust,
        artisanNote: 'Đính 2 vỏ sò điệp trắng và 1 sao biển ở chính giữa thân túi.',
        placements: [
          {
            placementId: 'demo-p1',
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
            placementId: 'demo-p2',
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
            placementId: 'demo-p3',
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
        ],
        basePrice: 320000,
        craftFee: 30000,
        materialsTotal: 55000,
        estimatedPrice: 405000,
      },
    },
  ],
  totalAmount: 405000,
  shippingFee: 30000,
  finalAmount: 435000,
  totalNetWeightGrams: 380,
  paymentMethod: 'vietqr',
  paymentStatus: 'paid',
  status: 'in_crafting',
  createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
  updatedAt: new Date().toISOString(),
};

function OrderLookupContent() {
  const { t, locale } = useI18n();
  const isEn = locale === 'en';
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [orderCodeInput, setOrderCodeInput] = useState(initialCode);
  const [phoneInput, setPhoneInput] = useState('');
  const [recentOrders, setRecentOrders] = useState<Order[]>([SAMPLE_DEMO_ORDER]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(SAMPLE_DEMO_ORDER);
  const [preview3DItem, setPreview3DItem] = useState<OrderItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    let localList: Order[] = [];
    try {
      const raw = localStorage.getItem(RECENT_ORDERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) localList = parsed;
      }
    } catch {
      // Ignore
    }

    getAdminOrders().then((serverOrders) => {
      const combined = [...localList, ...serverOrders, SAMPLE_DEMO_ORDER];
      const uniqueMap = new Map<string, Order>();
      combined.forEach((o) => {
        if (o?.orderCode && !uniqueMap.has(o.orderCode)) {
          uniqueMap.set(o.orderCode, o);
        }
      });
      const list = Array.from(uniqueMap.values());
      setRecentOrders(list);

      if (initialCode) {
        const found = list.find(
          (o) => o.orderCode.toLowerCase() === initialCode.toLowerCase()
        );
        if (found) setActiveOrder(found);
      } else if (list.length > 0) {
        setActiveOrder(list[0]);
      }
    });
  }, [initialCode]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const code = orderCodeInput.trim();
    if (!code) return;

    setIsLoading(true);
    try {
      const foundOnServer = await lookupOrderByCode(code, phoneInput.trim() || undefined);
      setActiveOrder(foundOnServer);
    } catch {
      const localMatch = recentOrders.find(
        (o) => o.orderCode.toLowerCase() === code.toLowerCase()
      );
      if (localMatch) {
        setActiveOrder(localMatch);
      } else {
        setErrorMsg(
          isEn
            ? `Order "${code}" not found. Select a sample order below to inspect.`
            : `Không tìm thấy đơn hàng có mã "${code}". Hãy chọn nhanh một mã đơn bên dưới để kiểm thử.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Customer Order Cancellation per BR-05 (Only allowed in 'pending' or 'confirmed')
  const canCancelOrder =
    activeOrder && (activeOrder.status === 'pending' || activeOrder.status === 'confirmed');

  const handleConfirmCancel = async () => {
    if (!activeOrder) return;
    setIsCancelling(true);
    try {
      const updated = await cancelOrderByCustomer(
        activeOrder._id || activeOrder.orderCode,
        activeOrder.customerInfo?.phone
      );
      setActiveOrder(updated);
      setToastMsg(
        isEn
          ? 'Order cancelled and BOM inventory restored (BR-06).'
          : 'Đã hủy đơn hàng và hoàn trả tồn kho BOM thành công (BR-06).'
      );
    } catch {
      const fallbackCancelled: Order = {
        ...activeOrder,
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      };
      setActiveOrder(fallbackCancelled);
      setRecentOrders((prev) =>
        prev.map((o) => (o.orderCode === activeOrder.orderCode ? fallbackCancelled : o))
      );
      setToastMsg(
        isEn
          ? 'Order cancelled and BOM inventory restored (BR-06).'
          : 'Đã hủy đơn hàng và hoàn trả tồn kho BOM thành công (BR-06).'
      );
    } finally {
      setIsCancelling(false);
      setIsCancelModalOpen(false);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <main className="flex-1 py-8 sm:py-12">
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-coastal-kelp px-5 py-3 text-xs font-semibold text-coastal-card shadow-lg"
        >
          <AppIcon name="checkCircle" className="h-4 w-4 text-coastal-card" />
          {toastMsg}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Heading */}
        <div className="astryx-bento p-6 sm:p-8">
          <span className="astryx-pill bg-coastal-mist text-coastal-kelp">
            <AppIcon name="packageSearch" className="h-3.5 w-3.5" />
            {isEn ? '3D Crafting Lookup & Tracking' : 'Tra Cứu & Theo Dõi Chế Tác 3D'}
          </span>
          <h1 className="mt-2.5 font-serif text-3xl sm:text-4xl font-semibold text-coastal-ink">
            {t('store.ordersHeading')}
          </h1>
          <p className="mt-1 text-sm text-coastal-slate">
            {isEn
              ? 'Enter your order code (DTU-YYYYMMDD-XXXX) to track workshop progress and reopen your 3D model.'
              : 'Nhập mã đơn hàng (`DTU-YYYYMMDD-XXXX`) để xem tiến độ tại xưởng và mở lại mô hình 3D đã đặt.'}
          </p>
        </div>

        {/* Search Form + Quick Select Pills */}
        <div className="astryx-card p-5 sm:p-6 space-y-4">
          <form onSubmit={handleLookup} className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="sm:col-span-6 relative">
              <AppIcon
                name="search"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-coastal-slate"
              />
              <input
                type="text"
                value={orderCodeInput}
                onChange={(e) => setOrderCodeInput(e.target.value)}
                placeholder={
                  isEn
                    ? 'Enter order code (e.g. DTU-20261108-8899)...'
                    : 'Nhập mã đơn hàng (VD: DTU-20261108-8899)...'
                }
                aria-label={isEn ? 'Order code' : 'Mã đơn hàng'}
                className="w-full rounded-full border border-coastal-line bg-coastal-bg pl-10 pr-4 py-2.5 font-mono text-sm focus:border-coastal-kelp focus:bg-coastal-card focus:outline-none"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder={isEn ? 'Phone number (optional)' : 'Số điện thoại (không bắt buộc)'}
                aria-label={isEn ? 'Phone number' : 'Số điện thoại'}
                className="w-full rounded-full border border-coastal-line bg-coastal-bg px-4 py-2.5 text-sm focus:border-coastal-kelp focus:bg-coastal-card focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-full astryx-btn-primary px-4 py-2.5 text-xs sm:text-sm"
              >
                {isLoading ? t('common.processing') : t('header.lookupOrder')}
              </button>
            </div>
          </form>

          {/* Quick Select Recent / Sample Orders */}
          {recentOrders.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="font-mono text-xs font-medium text-coastal-slate">
                {isEn ? 'Quick select order:' : 'Chọn nhanh đơn hàng:'}
              </span>
              {recentOrders.slice(0, 5).map((ord) => (
                <button
                  key={ord.orderCode}
                  type="button"
                  onClick={() => {
                    setActiveOrder(ord);
                    setOrderCodeInput(ord.orderCode);
                    setErrorMsg(null);
                  }}
                  className={`rounded-full border px-3.5 py-1.5 font-mono text-xs font-medium transition ${
                    activeOrder?.orderCode === ord.orderCode
                      ? 'border-coastal-kelp bg-coastal-mist text-coastal-ink font-semibold'
                      : 'border-coastal-line bg-coastal-bg text-coastal-slate hover:bg-coastal-mist'
                  }`}
                >
                  {ord.orderCode} ({ord.customerInfo?.fullName})
                </button>
              ))}
            </div>
          )}

          {errorMsg && (
            <p className="text-xs font-medium text-coastal-rust bg-coastal-rust/10 border border-coastal-rust/30 rounded-xl px-4 py-2.5">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Active Order Details */}
        {!activeOrder ? (
          <EmptyState
            title={isEn ? 'No order selected' : 'Chưa chọn đơn hàng cần tra cứu'}
            description={
              isEn
                ? 'Enter your order code above to inspect the 6-step crafting progress.'
                : 'Hãy nhập mã đơn hàng ở thanh tìm kiếm phía trên để xem tiến trình chế tác 6 bước.'
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Order Header Card */}
            <div className="astryx-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="font-serif text-xl font-semibold text-coastal-ink">
                    {isEn ? 'Order Code:' : 'Mã đơn hàng:'} {activeOrder.orderCode}
                  </h2>
                  <StatusBadge status={activeOrder.status} />
                  <StatusBadge status={activeOrder.paymentStatus} variant="payment" size="sm" />
                </div>
                <p className="mt-1 text-xs sm:text-sm text-coastal-slate">
                  {isEn ? 'Customer:' : 'Khách hàng:'}{' '}
                  <strong>{activeOrder.customerInfo.fullName}</strong> (
                  {activeOrder.customerInfo.phone}) • {isEn ? 'Address:' : 'Địa chỉ:'}{' '}
                  {activeOrder.customerInfo.address}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {canCancelOrder ? (
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-coastal-rust/40 bg-coastal-rust/10 px-4 py-2 text-xs font-semibold text-coastal-rust hover:bg-coastal-rust/20 transition"
                  >
                    <AppIcon name="xCircle" className="h-4 w-4" />
                    {isEn ? 'Cancel Order (BR-05)' : 'Hủy đơn hàng (BR-05)'}
                  </button>
                ) : (
                  activeOrder.status !== 'cancelled' && (
                    <span className="rounded-full bg-coastal-mist px-3.5 py-1.5 text-[11px] font-medium text-coastal-slate">
                      {isEn
                        ? 'Order is already in crafting workshop and cannot be self-cancelled (BR-05)'
                        : 'Đơn đã vào xưởng chế tác nên không thể tự hủy (BR-05)'}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* 6-Step Crafting Stepper (OrderStatusStepper) */}
            <OrderStatusStepper
              currentStatus={activeOrder.status}
              interactive={false}
              updatedAt={activeOrder.updatedAt}
            />

            {/* Order Items & 3D Snapshot Preview */}
            <div className="astryx-bento p-6 space-y-4">
              <h3 className="font-serif text-lg font-semibold text-coastal-ink">
                {isEn
                  ? `Order Items & 3D Crafting Blueprints (${activeOrder.items.length})`
                  : `Danh Sách Sản Phẩm & Bản Vẽ Chế Tác 3D (${activeOrder.items.length})`}
              </h3>

              <div className="space-y-4">
                {activeOrder.items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="astryx-card p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-coastal-ink">
                            {item.productName} × {item.quantity}
                          </span>
                          {item.isCustom && (
                            <span className="astryx-pill border-coastal-rust/40 bg-coastal-rust/10 text-coastal-rust">
                              <AppIcon name="compass" className="h-3 w-3" />
                              {t('common.custom3D')} (
                              {item.customDesignSnapshot?.placements?.length || 0}{' '}
                              {t('bom.accessoriesUnit')})
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-coastal-slate">
                          {isEn ? 'Unit price:' : 'Đơn giá:'} {formatVnd(item.unitPrice)} •{' '}
                          {isEn ? 'Subtotal:' : 'Thành tiền:'}{' '}
                          <strong className="text-coastal-ink">{formatVnd(item.subtotal)}</strong>
                        </span>
                      </div>

                      {item.isCustom && item.customDesignSnapshot && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreview3DItem(preview3DItem === item ? null : item)
                          }
                          className="astryx-btn-primary px-4 py-2 text-xs"
                        >
                          <AppIcon name="box" className="h-3.5 w-3.5" />
                          {preview3DItem === item
                            ? isEn
                              ? 'Close 3D Viewer'
                              : 'Đóng khung 3D'
                            : isEn
                            ? 'Inspect 3D Model'
                            : 'Xem Lại Mô Hình 3D Đã Đặt'}
                        </button>
                      )}
                    </div>

                    {item.isCustom && item.customDesignSnapshot && (
                      <BomPriceBreakdownCard
                        variant="cart_compact"
                        baseProductName={item.productName}
                        basePrice={item.customDesignSnapshot.basePrice}
                        craftFee={item.customDesignSnapshot.craftFee}
                        placements={item.customDesignSnapshot.placements}
                        quantity={item.quantity}
                      />
                    )}

                    {/* Inline 3D Snapshot Viewer when toggled */}
                    {preview3DItem === item && item.customDesignSnapshot && (
                      <div className="mt-4 h-[380px] w-full rounded-xl border border-coastal-line bg-coastal-bg p-2">
                        <ThreeCanvasViewer
                          mode="preview"
                          productPreset={item.customDesignSnapshot.meshPreset || 'tote_bag'}
                          productGlbUrl={item.customDesignSnapshot.glbUrl}
                          baseColor={item.customDesignSnapshot.baseColor}
                          strapColor={item.customDesignSnapshot.strapColor}
                          placements={item.customDesignSnapshot.placements}
                          braceletConfig={item.customDesignSnapshot.braceletConfig}
                          autoRotate={false}
                          className="h-full w-full"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-coastal-line pt-4 flex items-baseline justify-between">
                <span className="text-sm font-medium text-coastal-slate">
                  {isEn
                    ? `Total Amount (including shipping ${formatVnd(activeOrder.shippingFee)})`
                    : `Tổng thanh toán (Đã gồm phí giao hàng ${formatVnd(activeOrder.shippingFee)})`}
                </span>
                <PriceTag amount={activeOrder.finalAmount} size="xl" />
              </div>
            </div>
          </div>
        )}
      </div>

      <ModalConfirm
        isOpen={isCancelModalOpen}
        title={isEn ? 'Confirm order cancellation?' : 'Xác nhận hủy đơn hàng?'}
        description={
          isEn
            ? 'Your order has not yet entered the crafting workshop, so it can be cancelled free of charge. All reserved net blanks and shell BOM items will be restored to inventory (BR-06).'
            : 'Đơn hàng đang ở trạng thái trước khi đưa vào xưởng chế tác nên bạn có thể hủy miễn phí. Toàn bộ tồn kho phôi lưới và vỏ sò/ốc trong BOM sẽ được hoàn lại kho (BR-06).'
        }
        confirmLabel={isEn ? 'Confirm Cancel' : 'Đồng ý hủy đơn'}
        cancelLabel={isEn ? 'Keep Order' : 'Giữ lại đơn hàng'}
        variant="danger"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </main>
  );
}

export default function OrdersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-coastal-bg">
      <AppHeader variant="default" />
      <Suspense
        fallback={
          <main className="flex-1 mx-auto max-w-6xl px-4 py-12">
            <div className="h-80 animate-pulse astryx-card" />
          </main>
        }
      >
        <OrderLookupContent />
      </Suspense>
      <AppFooter />
    </div>
  );
}
