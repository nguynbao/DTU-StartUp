'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { ThreeCanvasViewer } from '@/components/three/ThreeCanvasViewer';
import { BomPriceBreakdownCard } from '@/components/common/BomPriceBreakdownCard';
import { EcoImpactBadge } from '@/components/common/EcoImpactBadge';
import { OrderStatusStepper } from '@/components/common/OrderStatusStepper';
import { FilterToolbar } from '@/components/common/FilterToolbar';
import { S3ImageUploader } from '@/components/common/S3ImageUploader';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriceTag, formatVnd } from '@/components/ui/PriceTag';
import { ModalConfirm } from '@/components/ui/ModalConfirm';
import { AppIcon } from '@/components/ui/AppIcon';
import { ASSETS, resolveAssetUrl } from '@/config/assets';
import { IconName } from '@/config/icons';
import { PRODUCT_COLOR_PRESETS } from '@/config/theme';
import { useI18n } from '@/i18n/I18nContext';
import {
  FALLBACK_MATERIALS,
  FALLBACK_PRODUCTS,
  createMaterialAdmin,
  createProductAdmin,
  deleteMaterialAdmin,
  deleteProductAdmin,
  getAdminDashboard,
  getAdminOrders,
  getCustomMaterials,
  getMediaStatus,
  getProducts,
  updateMaterialAdmin,
  updateOrderPaymentStatus,
  updateOrderStatus,
  updateProductAdmin,
} from '@/lib/api';
import {
  CustomMaterial,
  MaterialCategory,
  MediaStorageStatus,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
} from '@/types';

type AdminTab = 'dashboard' | 'orders' | 'products' | 'materials';

const DEMO_CRAFTING_ORDER: Order = {
  _id: 'ord-cms-demo-1',
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
        artisanNote: 'Đính 2 vỏ sò điệp và 1 sao biển đối xứng ở mặt trước túi.',
        placements: [
          {
            placementId: 'cms-p1',
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
            placementId: 'cms-p2',
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
            placementId: 'cms-p3',
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
  createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function AdminCmsPage() {
  const { t, locale } = useI18n();
  const isEn = locale === 'en';

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Data States
  const [orders, setOrders] = useState<Order[]>([DEMO_CRAFTING_ORDER]);
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [materials, setMaterials] = useState<CustomMaterial[]>(FALLBACK_MATERIALS);
  const [mediaStatus, setMediaStatus] = useState<MediaStorageStatus | null>(null);

  // Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialTypeFilter, setMaterialTypeFilter] = useState('all');

  // 3D Crafting Inspector Modal State (BR-07)
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);
  const [selectedInspectorPlacementId, setSelectedInspectorPlacementId] = useState<string | null>(
    null
  );
  const [checkedMaterialIds, setCheckedMaterialIds] = useState<string[]>([]);

  // Product Form Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    slug: '',
    category: 'bag' as ProductCategory,
    basePrice: 320000,
    craftFee: 30000,
    stock: 20,
    shortDescription: '',
    imageUrl: ASSETS.products.toteBagMain as string,
    meshPreset: 'tote_bag',
    glbUrl: '',
    netWeightGrams: 350,
    originSea: 'Bán đảo Sơn Trà, Đà Nẵng',
    isCustomizable: true,
  });

  // Material Form Modal State
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<CustomMaterial | null>(null);
  const [matForm, setMatForm] = useState({
    name: '',
    materialType: 'shell' as MaterialCategory,
    unitPrice: 15000,
    stockQuantity: 100,
    colorHex: PRODUCT_COLOR_PRESETS.sandCream as string,
    thumbnail: ASSETS.materials.scallopShell as string,
    meshPreset: 'scallop_shell',
    glbUrl: '',
    description: '',
  });

  // Confirm Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'material';
    id: string;
    name: string;
  } | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getAdminDashboard(),
      getAdminOrders(),
      getProducts({ includeInactive: true }),
      getCustomMaterials(),
      getMediaStatus(),
    ]).then(([, serverOrders, prodList, matList, s3Status]) => {
      if (!mounted) return;
      if (serverOrders && serverOrders.length > 0) {
        setOrders(serverOrders);
      } else {
        try {
          const raw = localStorage.getItem('dtu_recent_orders_v1');
          const localOrders: Order[] = raw ? JSON.parse(raw) : [];
          if (localOrders.length > 0) {
            setOrders([...localOrders, DEMO_CRAFTING_ORDER]);
          }
        } catch {
          // Ignore
        }
      }
      if (prodList.length > 0) setProducts(prodList);
      if (matList.length > 0) setMaterials(matList);
      if (s3Status) setMediaStatus(s3Status);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Filtered Lists
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      if (orderSearch) {
        const q = orderSearch.toLowerCase();
        return (
          o.orderCode.toLowerCase().includes(q) ||
          o.customerInfo.fullName.toLowerCase().includes(q) ||
          o.customerInfo.phone.includes(q)
        );
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productCatFilter !== 'all' && p.category !== productCatFilter) return false;
      if (productSearch) {
        return p.name.toLowerCase().includes(productSearch.toLowerCase());
      }
      return true;
    });
  }, [products, productCatFilter, productSearch]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (materialTypeFilter !== 'all' && m.materialType !== materialTypeFilter) return false;
      if (materialSearch) {
        return m.name.toLowerCase().includes(materialSearch.toLowerCase());
      }
      return true;
    });
  }, [materials, materialTypeFilter, materialSearch]);

  // Dashboard Computed KPIs
  const kpiStats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'cancelled');
    const revenue = activeOrders.reduce((s, o) => s + (o.finalAmount || 0), 0);
    const craftingCount = orders.filter(
      (o) => o.status === 'confirmed' || o.status === 'in_crafting' || o.status === 'quality_check'
    ).length;
    const totalNetsGrams = activeOrders.reduce(
      (s, o) => s + (o.totalNetWeightGrams || 380),
      16850
    );
    const lowStockMats = materials.filter((m) => m.stockQuantity <= 15);
    return {
      revenue,
      totalOrders: orders.length,
      craftingCount,
      totalNetsGrams,
      lowStockMats,
    };
  }, [orders, materials]);

  // Order Status Step Handler (BR-05)
  const handleStepOrderStatus = async (order: Order, nextStatus: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(order._id, nextStatus);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)));
      if (inspectedOrder?._id === order._id) setInspectedOrder(updated);
      notify(
        isEn
          ? `Order ${order.orderCode} advanced to "${nextStatus}" (BR-05).`
          : `Đã chuyển đơn ${order.orderCode} sang bước "${nextStatus}" (BR-05).`
      );
    } catch {
      const fallbackUpdated: Order = {
        ...order,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      };
      setOrders((prev) => prev.map((o) => (o.orderCode === order.orderCode ? fallbackUpdated : o)));
      if (inspectedOrder?.orderCode === order.orderCode) setInspectedOrder(fallbackUpdated);
      notify(
        isEn
          ? `Order ${order.orderCode} advanced to "${nextStatus}" (BR-05).`
          : `Đã chuyển đơn ${order.orderCode} sang bước "${nextStatus}" (BR-05).`
      );
    }
  };

  // Toggle Payment Status
  const handleTogglePayment = async (order: Order) => {
    const nextPay = order.paymentStatus === 'paid' ? 'unpaid' : 'paid';
    try {
      const updated = await updateOrderPaymentStatus(order._id, nextPay);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)));
      if (inspectedOrder?._id === order._id) setInspectedOrder(updated);
    } catch {
      const fallbackUpdated: Order = { ...order, paymentStatus: nextPay };
      setOrders((prev) => prev.map((o) => (o.orderCode === order.orderCode ? fallbackUpdated : o)));
      if (inspectedOrder?.orderCode === order.orderCode) setInspectedOrder(fallbackUpdated);
    }
    notify(
      isEn
        ? `Updated payment status for order ${order.orderCode}.`
        : `Đã cập nhật trạng thái thanh toán đơn ${order.orderCode}.`
    );
  };

  // Save Product (Create / Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedImg = prodForm.imageUrl || editingProduct?.images?.[0] || ASSETS.placeholders.product;
    const payload: Partial<Product> = {
      name: prodForm.name,
      slug:
        prodForm.slug ||
        prodForm.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-'),
      category: prodForm.category,
      basePrice: Number(prodForm.basePrice),
      craftFee: Number(prodForm.craftFee),
      stock: Number(prodForm.stock),
      shortDescription: prodForm.shortDescription,
      description: prodForm.shortDescription,
      isCustomizable: prodForm.isCustomizable,
      isActive: true,
      images: [resolvedImg],
      thumbnail: resolvedImg,
      model3D: {
        meshPreset: prodForm.meshPreset,
        glbUrl: prodForm.glbUrl,
        defaultBaseColor: PRODUCT_COLOR_PRESETS.kelpGreen,
        defaultStrapColor: PRODUCT_COLOR_PRESETS.terracottaRust,
      },
      ecoImpact: {
        netWeightGrams: Number(prodForm.netWeightGrams),
        originSea: prodForm.originSea,
        recycledPlasticPct: 92,
        artisanGroup: t('eco.defaultArtisanGroup'),
      },
    };

    try {
      if (editingProduct) {
        const updated = await updateProductAdmin(editingProduct._id, payload);
        setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? updated : p)));
      } else {
        const created = await createProductAdmin(payload);
        setProducts((prev) => [created, ...prev]);
      }
    } catch {
      const localProd: Product = {
        ...(editingProduct || ({ _id: `prod-${Date.now()}` } as Product)),
        ...(payload as Product),
      };
      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? localProd : p)));
      } else {
        setProducts((prev) => [localProd, ...prev]);
      }
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
    notify(
      isEn
        ? 'Saved product & S3 image configuration.'
        : 'Đã lưu thông tin sản phẩm & ảnh AWS S3 thành công.'
    );
  };

  // Save Material (Create / Edit)
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<CustomMaterial> = {
      name: matForm.name,
      materialType: matForm.materialType,
      unitPrice: Number(matForm.unitPrice),
      stockQuantity: Number(matForm.stockQuantity),
      colorHex: matForm.colorHex,
      thumbnail: matForm.thumbnail || editingMaterial?.thumbnail || ASSETS.materials.scallopShell,
      description: matForm.description,
      isActive: true,
      model3D: {
        meshPreset: matForm.meshPreset,
        glbUrl: matForm.glbUrl,
        defaultScale: 1.0,
      },
    };

    try {
      if (editingMaterial) {
        const updated = await updateMaterialAdmin(editingMaterial._id, payload);
        setMaterials((prev) => prev.map((m) => (m._id === editingMaterial._id ? updated : m)));
      } else {
        const created = await createMaterialAdmin(payload);
        setMaterials((prev) => [created, ...prev]);
      }
    } catch {
      const localMat: CustomMaterial = {
        ...(editingMaterial || ({ _id: `mat-${Date.now()}` } as CustomMaterial)),
        ...(payload as CustomMaterial),
      };
      if (editingMaterial) {
        setMaterials((prev) => prev.map((m) => (m._id === editingMaterial._id ? localMat : m)));
      } else {
        setMaterials((prev) => [localMat, ...prev]);
      }
    }

    setIsMaterialModalOpen(false);
    setEditingMaterial(null);
    notify(
      isEn
        ? 'Updated shell/snail S3 image & BOM inventory.'
        : 'Đã cập nhật ảnh AWS S3 & kho nguyên liệu vỏ sò / ốc biển thành công.'
    );
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'product') {
      try {
        await deleteProductAdmin(deleteTarget.id);
      } catch {
        // Fallback local removal
      }
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget.id));
      notify(
        isEn
          ? `Deleted product "${deleteTarget.name}".`
          : `Đã xóa sản phẩm "${deleteTarget.name}".`
      );
    } else {
      try {
        await deleteMaterialAdmin(deleteTarget.id);
      } catch {
        // Fallback local removal
      }
      setMaterials((prev) => prev.filter((m) => m._id !== deleteTarget.id));
      notify(
        isEn
          ? `Deleted material "${deleteTarget.name}".`
          : `Đã xóa nguyên liệu "${deleteTarget.name}".`
      );
    }
    setDeleteTarget(null);
  };

  // DataTable Columns for Orders
  const orderColumns: DataTableColumn<Order>[] = [
    {
      key: 'orderCode',
      header: isEn ? 'Order Code & Time' : 'Mã đơn & Thời gian',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-coastal-kelp">{row.orderCode}</span>
          <span className="block font-mono text-[11px] text-coastal-slate">
            {new Date(row.createdAt).toLocaleString(isEn ? 'en-US' : 'vi-VN')}
          </span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: isEn ? 'Customer' : 'Khách hàng',
      render: (row) => (
        <div>
          <div className="font-semibold text-coastal-ink">{row.customerInfo.fullName}</div>
          <div className="font-mono text-xs text-coastal-slate">{row.customerInfo.phone}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: isEn ? 'Crafting Type' : 'Loại chế tác',
      render: (row) => {
        const hasCustom = row.items.some((i) => i.isCustom);
        return hasCustom ? (
          <span className="astryx-pill border-coastal-rust/40 bg-coastal-rust/10 text-coastal-rust">
            <AppIcon name="compass" className="h-3 w-3" />
            {isEn ? 'Has 3D Blueprint' : 'Có bản vẽ 3D'}
          </span>
        ) : (
          <span className="astryx-pill bg-coastal-mist text-coastal-slate">
            {isEn ? 'Standard Blank' : 'Phôi tiêu chuẩn'}
          </span>
        );
      },
    },
    {
      key: 'total',
      header: isEn ? 'Total Amount' : 'Tổng tiền',
      align: 'right',
      render: (row) => (
        <div className="text-right">
          <PriceTag amount={row.finalAmount} size="sm" />
          <div className="mt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePayment(row);
              }}
              title={isEn ? 'Click to toggle payment status' : 'Chạm để đổi trạng thái thanh toán'}
            >
              <StatusBadge status={row.paymentStatus} size="sm" />
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: isEn ? 'Crafting Status (BR-05)' : 'Trạng thái chế tác (BR-05)',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: isEn ? '3D Inspector Workstation' : 'Máy trạm 3D Inspector',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={() => {
            setInspectedOrder(row);
            setCheckedMaterialIds([]);
            setSelectedInspectorPlacementId(null);
          }}
          className="astryx-btn-primary px-3.5 py-1.5 text-xs"
        >
          <AppIcon name="eye" className="h-3.5 w-3.5" />
          {isEn ? 'Open 3D Ticket' : 'Mở Phiếu Chế Tác 3D'}
        </button>
      ),
    },
  ];

  // DataTable Columns for Products
  const productColumns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      header: isEn ? 'Upcycled Product' : 'Sản phẩm tái chế',
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveAssetUrl(row.images?.[0] || row.thumbnail, ASSETS.placeholders.product)}
            alt={row.name}
            className="h-11 w-11 rounded-xl object-cover border border-coastal-line"
          />
          <div>
            <div className="font-semibold text-coastal-ink">{row.name}</div>
            <div className="text-xs text-coastal-slate">
              Preset 3D: <code className="font-mono text-coastal-kelp">{row.model3D?.meshPreset}</code>{' '}
              • {t('eco.ghostNetRecovered')}: {row.ecoImpact?.netWeightGrams}g
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: isEn ? 'Category' : 'Danh mục',
      render: (row) => (
        <span className="astryx-pill bg-coastal-mist text-coastal-ink">
          {row.category}
        </span>
      ),
    },
    {
      key: 'price',
      header: isEn ? 'Base Price & 3D Fee' : 'Giá phôi & Phí khâu 3D',
      align: 'right',
      render: (row) => (
        <div>
          <PriceTag amount={row.basePrice} size="sm" />
          <span className="block font-mono text-[11px] text-coastal-slate">
            {t('bom.craftFeeCompact')} +{formatVnd(row.craftFee)}
          </span>
        </div>
      ),
    },
    {
      key: 'stock',
      header: isEn ? 'Blank Stock' : 'Tồn kho phôi',
      align: 'center',
      render: (row) => (
        <StatusBadge
          status={row.stock > 10 ? 'in_stock' : row.stock > 0 ? 'low_stock' : 'out_of_stock'}
          label={`${row.stock} ${t('common.pieces')}`}
          size="sm"
        />
      ),
    },
    {
      key: 'actions',
      header: isEn ? 'Actions' : 'Thao tác',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => {
              setEditingProduct(row);
              setProdForm({
                name: row.name,
                slug: row.slug,
                category: row.category,
                basePrice: row.basePrice,
                craftFee: row.craftFee,
                stock: row.stock,
                shortDescription: row.shortDescription,
                imageUrl: row.images?.[0] || row.thumbnail || ASSETS.products.toteBagMain,
                meshPreset: row.model3D?.meshPreset || 'tote_bag',
                glbUrl: row.model3D?.glbUrl || '',
                netWeightGrams: row.ecoImpact?.netWeightGrams || 350,
                originSea: row.ecoImpact?.originSea || t('common.centralSea'),
                isCustomizable: row.isCustomizable,
              });
              setIsProductModalOpen(true);
            }}
            className="rounded-full border border-coastal-line p-2 text-coastal-slate hover:bg-coastal-mist"
            aria-label={isEn ? 'Edit product' : 'Sửa sản phẩm'}
          >
            <AppIcon name="edit" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              setDeleteTarget({ type: 'product', id: row._id, name: row.name })
            }
            className="rounded-full border border-coastal-rust/30 p-2 text-coastal-rust hover:bg-coastal-rust/10"
            aria-label={isEn ? 'Delete product' : 'Xóa sản phẩm'}
          >
            <AppIcon name="trash" className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // DataTable Columns for CustomMaterials
  const materialColumns: DataTableColumn<CustomMaterial>[] = [
    {
      key: 'name',
      header: isEn ? 'Shell / Snail Material' : 'Tên nguyên liệu vỏ sò / ốc',
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveAssetUrl(row.thumbnail, ASSETS.materials.scallopShell)}
            alt={row.name}
            className="h-10 w-10 rounded-xl object-cover border border-coastal-line shrink-0"
          />
          <span
            className="h-5 w-5 rounded-full border border-coastal-line shrink-0"
            style={{ backgroundColor: row.colorHex }}
          />
          <div>
            <div className="font-semibold text-coastal-ink">{row.name}</div>
            <div className="text-xs text-coastal-slate">
              Mesh 3D: <code className="font-mono text-coastal-kelp">{row.model3D?.meshPreset}</code>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: isEn ? 'Material Group' : 'Nhóm phụ kiện',
      render: (row) => (
        <span className="astryx-pill bg-coastal-mist text-coastal-kelp">
          {row.materialType}
        </span>
      ),
    },
    {
      key: 'unitPrice',
      header: isEn ? '3D Unit Price' : 'Đơn giá đính 3D',
      align: 'right',
      render: (row) => <PriceTag amount={row.unitPrice} size="sm" suffix={`/ ${t('common.pieces')}`} />,
    },
    {
      key: 'stock',
      header: isEn ? 'BOM Inventory (BR-04)' : 'Tồn kho BOM (BR-04)',
      align: 'center',
      render: (row) => (
        <StatusBadge
          status={
            row.stockQuantity > 15
              ? 'in_stock'
              : row.stockQuantity > 0
              ? 'low_stock'
              : 'out_of_stock'
          }
          label={`${row.stockQuantity} ${t('common.pieces')}`}
          size="sm"
        />
      ),
    },
    {
      key: 'actions',
      header: isEn ? 'Actions' : 'Thao tác',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => {
              setEditingMaterial(row);
              setMatForm({
                name: row.name,
                materialType: row.materialType,
                unitPrice: row.unitPrice,
                stockQuantity: row.stockQuantity,
                colorHex: row.colorHex,
                thumbnail: row.thumbnail || ASSETS.materials.scallopShell,
                meshPreset: row.model3D?.meshPreset || 'scallop_shell',
                glbUrl: row.model3D?.glbUrl || '',
                description: row.description || '',
              });
              setIsMaterialModalOpen(true);
            }}
            className="rounded-full border border-coastal-line p-2 text-coastal-slate hover:bg-coastal-mist"
            aria-label={isEn ? 'Edit material' : 'Sửa nguyên liệu'}
          >
            <AppIcon name="edit" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              setDeleteTarget({ type: 'material', id: row._id, name: row.name })
            }
            className="rounded-full border border-coastal-rust/30 p-2 text-coastal-rust hover:bg-coastal-rust/10"
            aria-label={isEn ? 'Delete material' : 'Xóa nguyên liệu'}
          >
            <AppIcon name="trash" className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const inspectedCustomItem = inspectedOrder?.items.find((i) => i.isCustom && i.customDesignSnapshot);

  const cmsTabs: { id: AdminTab; label: string; icon: IconName }[] = [
    {
      id: 'dashboard',
      label: isEn ? '1. Overview & Stock Alerts' : '1. Tổng Quan & Cảnh Báo Kho',
      icon: 'layoutDashboard',
    },
    {
      id: 'orders',
      label: `2. ${t('cms.ordersTab')} (${orders.length})`,
      icon: 'clipboardList',
    },
    {
      id: 'products',
      label: `3. ${t('cms.productsTab')} (${products.length})`,
      icon: 'package',
    },
    {
      id: 'materials',
      label: `4. ${t('cms.materialsTab')} (${materials.length})`,
      icon: 'shell',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-coastal-bg">
      <AppHeader variant="cms" />

      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-coastal-kelp px-5 py-3 text-xs font-semibold text-coastal-card shadow-lg"
        >
          <AppIcon name="checkCircle" className="h-4 w-4 text-coastal-card" />
          {toastMsg}
        </div>
      )}

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* CMS Header & Single H1 + AWS S3 Storage Status */}
          <div className="astryx-bento p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="astryx-pill bg-coastal-mist text-coastal-kelp">
                  <AppIcon name="hammer" className="h-3.5 w-3.5" />
                  {t('cms.dashboardHeading')}
                </span>
                {mediaStatus && (
                  <span
                    className={`astryx-pill font-mono ${
                      mediaStatus.isS3Configured
                        ? 'bg-coastal-stone text-coastal-rust border border-coastal-rust/25'
                        : 'bg-coastal-sand text-coastal-kelp border border-coastal-kelp/25'
                    }`}
                  >
                    <AppIcon
                      name={mediaStatus.isS3Configured ? 'checkCircle' : 'layers'}
                      className="h-3.5 w-3.5"
                    />
                    {mediaStatus.isS3Configured
                      ? `AWS S3 Connected (${mediaStatus.bucket} • ${mediaStatus.region})`
                      : `Local Fallback Mode (${t('cms.s3StatusFallback')})`}
                  </span>
                )}
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-coastal-ink">
                {isEn
                  ? 'CMS Admin Portal & 3D Crafting Inspector Workstation'
                  : 'Cổng Quản Trị CMS & Máy Trạm Chế Tác 3D (Crafting Inspector)'}
              </h1>
            </div>

            <EcoImpactBadge
              variant="cms_stat"
              netWeightGrams={kpiStats.totalNetsGrams}
            />
          </div>

          {/* 5 CMS Segmented Navigation Tabs */}
          <div className="astryx-segmented overflow-x-auto max-w-full">
            {cmsTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-coastal-kelp text-coastal-card shadow-xs'
                      : 'text-coastal-slate hover:bg-coastal-mist hover:text-coastal-ink'
                  }`}
                >
                  <AppIcon name={tab.icon} className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="astryx-bento p-5">
                  <span className="font-mono text-[11px] font-semibold uppercase text-coastal-slate">
                    {isEn ? 'Total Workshop Revenue' : 'Tổng Doanh Thu Xưởng'}
                  </span>
                  <div className="mt-2">
                    <PriceTag amount={kpiStats.revenue} size="xl" />
                  </div>
                  <span className="mt-1 block text-xs text-coastal-kelp font-medium">
                    {isEn ? '+18% from 3D Custom Orders' : '+18% từ đơn Chế tác 3D'}
                  </span>
                </div>

                <div className="astryx-bento p-5">
                  <span className="font-mono text-[11px] font-semibold uppercase text-coastal-slate">
                    {isEn ? 'Total Orders' : 'Tổng Đơn Đặt Hàng'}
                  </span>
                  <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-coastal-ink">
                    {kpiStats.totalOrders} {isEn ? 'orders' : 'đơn'}
                  </div>
                  <span className="mt-1 block text-xs text-coastal-slate">
                    {isEn ? 'Synced VietQR & COD' : 'Đồng bộ VietQR & COD'}
                  </span>
                </div>

                <div className="astryx-bento p-5">
                  <span className="font-mono text-[11px] font-semibold uppercase text-coastal-slate">
                    {isEn ? 'Orders in Crafting' : 'Đơn Đang Đan & Đính Ốc'}
                  </span>
                  <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-coastal-rust">
                    {kpiStats.craftingCount} {isEn ? '3D tickets' : 'phiếu 3D'}
                  </div>
                  <span className="mt-1 block text-xs text-coastal-slate">
                    {isEn ? 'Active on 3D Inspector' : 'Đang mở trên 3D Inspector'}
                  </span>
                </div>

                <div className="astryx-bento p-5">
                  <span className="font-mono text-[11px] font-semibold uppercase text-coastal-slate">
                    {isEn ? 'Ghost Nets Recovered (BR-08)' : 'Lưới Đánh Cá Thu Hồi (BR-08)'}
                  </span>
                  <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-coastal-kelp">
                    {(kpiStats.totalNetsGrams / 1000).toFixed(2)} kg
                  </div>
                  <span className="mt-1 block text-xs text-coastal-kelp font-medium">
                    {kpiStats.totalNetsGrams.toLocaleString(isEn ? 'en-US' : 'vi-VN')}{' '}
                    {t('eco.netGramsUnit')}
                  </span>
                </div>
              </div>

              {/* Low Stock Material Alert Box */}
              <div className="astryx-bento border-coastal-rust/40 p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-coastal-ink">
                    <AppIcon name="alertTriangle" className="h-5 w-5 text-coastal-rust" />
                    {isEn
                      ? `Low Stock Shell / Snail BOM Alert (${kpiStats.lowStockMats.length})`
                      : `Cảnh Báo Nguyên Liệu Vỏ Sò / Ốc Sắp Cạn Kho (${kpiStats.lowStockMats.length})`}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('materials')}
                    className="font-mono text-xs font-semibold text-coastal-kelp hover:underline"
                  >
                    {isEn ? 'Restock BOM inventory →' : 'Nhập thêm kho nguyên liệu →'}
                  </button>
                </div>

                {kpiStats.lowStockMats.length === 0 ? (
                  <p className="text-xs text-coastal-slate">
                    {isEn
                      ? 'All shell and snail materials have sufficient safety stock.'
                      : 'Tất cả nguyên liệu vỏ sò, ốc biển đều đảm bảo định mức tồn kho an toàn.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {kpiStats.lowStockMats.map((m) => (
                      <div
                        key={m._id}
                        className="flex items-center justify-between astryx-card p-3.5 text-xs"
                      >
                        <div>
                          <strong className="text-coastal-ink block">{m.name}</strong>
                          <span className="font-mono text-coastal-slate">
                            {isEn ? 'Unit:' : 'Đơn giá:'} {formatVnd(m.unitPrice)}
                          </span>
                        </div>
                        <StatusBadge
                          status="low_stock"
                          label={`${m.stockQuantity} ${t('common.pieces')}`}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Recent Orders Table */}
              <div className="space-y-3">
                <h2 className="font-serif text-lg font-semibold text-coastal-ink">
                  {isEn ? 'Recent 3D Crafting Tickets' : 'Phiếu Chế Tác 3D Mới Tiếp Nhận'}
                </h2>
                <DataTable
                  columns={orderColumns}
                  data={orders.slice(0, 5)}
                  rowKey={(r) => r.orderCode}
                />
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS & 3D CRAFTING INSPECTOR */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <FilterToolbar
                searchValue={orderSearch}
                onSearchChange={setOrderSearch}
                searchPlaceholder={
                  isEn
                    ? 'Search by order code DTU-..., customer name, or phone...'
                    : 'Tìm theo mã đơn DTU-..., tên khách hàng hoặc SĐT...'
                }
                categoryOptions={[
                  { value: 'all', label: isEn ? 'All statuses (7)' : 'Tất cả trạng thái (7)' },
                  { value: 'pending', label: t('status.pending') },
                  { value: 'confirmed', label: t('status.confirmed') },
                  { value: 'in_crafting', label: t('status.in_crafting') },
                  { value: 'quality_check', label: t('status.quality_check') },
                  { value: 'shipping', label: t('status.shipping') },
                  { value: 'delivered', label: t('status.delivered') },
                  { value: 'cancelled', label: t('status.cancelled') },
                ]}
                selectedCategory={orderStatusFilter}
                onCategoryChange={setOrderStatusFilter}
                onResetFilters={() => {
                  setOrderSearch('');
                  setOrderStatusFilter('all');
                }}
              />

              <DataTable
                columns={orderColumns}
                data={filteredOrders}
                rowKey={(r) => r.orderCode}
              />
            </div>
          )}

          {/* TAB 3: PRODUCTS CRUD (BR-09) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <FilterToolbar
                searchValue={productSearch}
                onSearchChange={setProductSearch}
                searchPlaceholder={
                  isEn ? 'Search product by name...' : 'Tìm sản phẩm theo tên...'
                }
                categoryOptions={[
                  { value: 'all', label: t('categories.all') },
                  { value: 'bag', label: t('categories.bag') },
                  { value: 'basket', label: t('categories.basket') },
                  { value: 'wallet', label: t('categories.wallet') },
                  { value: 'apparel', label: t('categories.apparel') },
                  { value: 'bracelet', label: t('categories.bracelet') },
                  { value: 'accessory', label: t('categories.accessory') },
                ]}
                selectedCategory={productCatFilter}
                onCategoryChange={setProductCatFilter}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setProdForm({
                        name: '',
                        slug: '',
                        category: 'bag',
                        basePrice: 320000,
                        craftFee: 30000,
                        stock: 25,
                        shortDescription: '',
                        imageUrl: ASSETS.products.toteBagMain,
                        meshPreset: 'tote_bag',
                        glbUrl: '',
                        netWeightGrams: 380,
                        originSea: 'Bán đảo Sơn Trà, Đà Nẵng',
                        isCustomizable: true,
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="astryx-btn-primary px-4 py-2 text-xs"
                  >
                    <AppIcon name="plus" className="h-4 w-4" />
                    {isEn ? 'Add 3D Product Blank' : 'Thêm Phôi Sản Phẩm 3D'}
                  </button>
                }
              />

              <DataTable
                columns={productColumns}
                data={filteredProducts}
                rowKey={(r) => r._id}
              />
            </div>
          )}

          {/* TAB 4: MATERIALS CRUD */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              <FilterToolbar
                searchValue={materialSearch}
                onSearchChange={setMaterialSearch}
                searchPlaceholder={
                  isEn
                    ? 'Search shell, spiral snail, starfish...'
                    : 'Tìm nguyên liệu vỏ sò, ốc xoắn, sao biển...'
                }
                categoryOptions={[
                  {
                    value: 'all',
                    label: isEn ? 'All material groups' : 'Tất cả nhóm phụ kiện',
                  },
                  { value: 'shell', label: 'Vỏ sò (Shell)' },
                  { value: 'snail', label: 'Ốc biển (Snail)' },
                  { value: 'charm', label: 'Charm biển' },
                  { value: 'bead', label: 'Ngọc trai / Hạt' },
                  { value: 'cord', label: 'Dây lưới' },
                ]}
                selectedCategory={materialTypeFilter}
                onCategoryChange={setMaterialTypeFilter}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMaterial(null);
                      setMatForm({
                        name: '',
                        materialType: 'shell',
                        unitPrice: 15000,
                        stockQuantity: 100,
                        colorHex: PRODUCT_COLOR_PRESETS.sandCream,
                        thumbnail: ASSETS.materials.scallopShell,
                        meshPreset: 'scallop_shell',
                        glbUrl: '',
                        description: '',
                      });
                      setIsMaterialModalOpen(true);
                    }}
                    className="astryx-btn-leaf px-4 py-2 text-xs"
                  >
                    <AppIcon name="plus" className="h-4 w-4" />
                    {isEn ? 'Add New Shell / Snail' : 'Thêm Vỏ Sò / Ốc Mới'}
                  </button>
                }
              />

              <DataTable
                columns={materialColumns}
                data={filteredMaterials}
                rowKey={(r) => r._id}
              />
            </div>
          )}
        </div>
      </main>

      {/* ===================================================================== */}
      {/* MODAL 1: 3D CRAFTING INSPECTOR WORKSTATION (BR-07 & BR-05)            */}
      {/* ===================================================================== */}
      {inspectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-coastal-ink/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={isEn ? '3D Crafting Inspector Workstation' : 'Máy trạm kiểm tra phiếu chế tác 3D'}
        >
          <div className="relative w-full max-w-6xl astryx-bento bg-coastal-card p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-coastal-line pb-4">
              <div>
                <span className="astryx-pill bg-coastal-mist text-coastal-kelp">
                  <AppIcon name="box" className="h-4 w-4" />
                  {isEn
                    ? 'Artisan 3D Crafting Inspector Workstation — BR-07'
                    : 'Máy Trạm Chế Tác 3D (Artisan 3D Crafting Inspector — BR-07)'}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-coastal-ink mt-1.5">
                  {isEn ? 'Crafting Ticket:' : 'Phiếu Chế Tác Đơn Hàng:'} {inspectedOrder.orderCode} —{' '}
                  {inspectedOrder.customerInfo.fullName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setInspectedOrder(null)}
                className="rounded-full border border-coastal-line p-2 text-coastal-slate hover:bg-coastal-mist"
              >
                <AppIcon name="x" className="h-5 w-5" />
              </button>
            </div>

            {/* Interactive 6-Step Status Stepper */}
            <OrderStatusStepper
              currentStatus={inspectedOrder.status}
              interactive={true}
              onStatusChange={(nextStatus) => handleStepOrderStatus(inspectedOrder, nextStatus)}
              updatedAt={inspectedOrder.updatedAt}
            />

            {/* 3D Inspector Split View */}
            {inspectedCustomItem && inspectedCustomItem.customDesignSnapshot ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7 space-y-3">
                  <div className="h-[420px] w-full astryx-card p-2">
                    <div className="h-full w-full overflow-hidden rounded-xl">
                      <ThreeCanvasViewer
                        mode="inspector"
                        productPreset={
                          inspectedCustomItem.customDesignSnapshot.meshPreset || 'tote_bag'
                        }
                        productGlbUrl={inspectedCustomItem.customDesignSnapshot.glbUrl}
                        baseColor={inspectedCustomItem.customDesignSnapshot.baseColor}
                        strapColor={inspectedCustomItem.customDesignSnapshot.strapColor}
                        placements={inspectedCustomItem.customDesignSnapshot.placements}
                        braceletConfig={inspectedCustomItem.customDesignSnapshot.braceletConfig}
                        selectedPlacementId={selectedInspectorPlacementId}
                        onSelectPlacement={setSelectedInspectorPlacementId}
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                  {inspectedCustomItem.customDesignSnapshot.artisanNote && (
                    <div className="rounded-xl border border-coastal-line bg-coastal-mist p-3.5 text-xs text-coastal-ink">
                      <strong>
                        {isEn ? 'Customer note for artisan:' : 'Ghi chú của khách cho thợ khâu:'}
                      </strong>{' '}
                      {inspectedCustomItem.customDesignSnapshot.artisanNote}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <BomPriceBreakdownCard
                    variant="crafting_checklist"
                    baseProductName={inspectedCustomItem.productName}
                    basePrice={inspectedCustomItem.customDesignSnapshot.basePrice}
                    craftFee={inspectedCustomItem.customDesignSnapshot.craftFee}
                    placements={inspectedCustomItem.customDesignSnapshot.placements}
                    quantity={inspectedCustomItem.quantity}
                    checkedMaterialIds={checkedMaterialIds}
                    onToggleChecklist={(matId) => {
                      setCheckedMaterialIds((prev) =>
                        prev.includes(matId)
                          ? prev.filter((id) => id !== matId)
                          : [...prev, matId]
                      );
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="astryx-card p-6 text-center text-sm text-coastal-slate">
                {isEn
                  ? 'This order contains standard ready-made blanks (no 3D shell attachments).'
                  : 'Đơn hàng này gồm các sản phẩm phôi tiêu chuẩn (không đính phụ kiện Chế tác 3D).'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: CREATE / EDIT PRODUCT (BR-09)                                */}
      {/* ===================================================================== */}
      {isProductModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-coastal-ink/70 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveProduct}
            className="w-full max-w-xl astryx-bento bg-coastal-card p-6 shadow-xl space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-coastal-line pb-3">
              <h3 className="font-serif text-lg font-semibold text-coastal-ink">
                {editingProduct
                  ? isEn
                    ? 'Update 3D Product Blank'
                    : 'Cập Nhật Phôi Sản Phẩm 3D'
                  : isEn
                  ? 'Add New Product Blank'
                  : 'Thêm Phôi Sản Phẩm Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="rounded-full p-1.5 text-coastal-slate hover:bg-coastal-mist"
              >
                <AppIcon name="x" className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-coastal-ink mb-1">
                  {isEn ? 'Product Name *' : 'Tên sản phẩm *'}
                </label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full rounded-xl border border-coastal-line bg-coastal-bg px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-coastal-ink mb-1">
                  {isEn ? 'Category' : 'Danh mục'}
                </label>
                <select
                  value={prodForm.category}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, category: e.target.value as ProductCategory })
                  }
                  className="w-full rounded-xl border border-coastal-line bg-coastal-bg px-3.5 py-2 text-sm"
                >
                  <option value="bag">Túi xách lưới (bag)</option>
                  <option value="basket">Giỏ đựng đồ (basket)</option>
                  <option value="wallet">Ví tiền (wallet)</option>
                  <option value="apparel">Áo quần (apparel)</option>
                  <option value="bracelet">Vòng tay (bracelet)</option>
                  <option value="accessory">Phụ kiện (accessory)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-coastal-ink mb-1">
                  Mesh Preset 3D (BR-09)
                </label>
                <select
                  value={prodForm.meshPreset}
                  onChange={(e) => setProdForm({ ...prodForm, meshPreset: e.target.value })}
                  className="w-full rounded-xl border border-coastal-line bg-coastal-bg px-3.5 py-2 text-sm"
                >
                  <option value="tote_bag">tote_bag (Túi xách lưới)</option>
                  <option value="market_basket">market_basket (Giỏ tròn đan lưới)</option>
                  <option value="zip_wallet">zip_wallet (Ví cầm tay)</option>
                  <option value="ocean_vest">ocean_vest (Áo khoác Upcycled)</option>
                  <option value="braided_bracelet">braided_bracelet (Vòng tay dây lưới)</option>
                  <option value="shell_charm_holder">shell_charm_holder (Móc khóa phao)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-coastal-ink mb-1">
                  {isEn ? 'Base Price (VND)' : 'Giá phôi gốc (VNĐ)'}
                </label>
                <input
                  type="number"
                  required
                  value={prodForm.basePrice}
                  onChange={(e) => setProdForm({ ...prodForm, basePrice: Number(e.target.value) })}
                  className="w-full rounded-xl border border-coastal-line bg-coastal-bg px-3.5 py-2 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-coastal-ink mb-1">
                  {isEn ? '3D Craft Fee (VND)' : 'Phí đan & khâu 3D (VNĐ)'}
                </label>
                <input
                  type="number"
                  required
                  value={prodForm.craftFee}
                  onChange={(e) => setProdForm({ ...prodForm, craftFee: Number(e.target.value) })}
                  className="w-full rounded-xl border border-coastal-line bg-coastal-bg px-3.5 py-2 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-coastal-ink mb-1">
                  {isEn ? 'Blank Stock' : 'Tồn kho phôi'}
                </label>
                <input
                  type="number"
                  required
                  value={prodForm.stock}
                  onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                  className="w-full rounded-xl border border-coastal-line bg-coastal-bg px-3.5 py-2 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-coastal-ink mb-1">
                  {isEn ? 'Recovered Net Weight (grams)' : 'Lượng lưới thu hồi (gram)'}
                </label>
                <input
                  type="number"
                  value={prodForm.netWeightGrams}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, netWeightGrams: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-coastal-line bg-coastal-bg px-3.5 py-2 font-mono text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <S3ImageUploader
                  folder="products"
                  compact
                  label={isEn ? 'Product Image (Upload to AWS S3)' : 'Ảnh đại diện sản phẩm (Tải lên AWS S3)'}
                  value={prodForm.imageUrl}
                  onChange={(newUrl) => setProdForm({ ...prodForm, imageUrl: newUrl })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-coastal-ink mb-1">
                  {isEn
                    ? 'External 3D .glb URL (Optional — BR-09)'
                    : 'Đường dẫn file 3D `.glb` ngoài (Tùy chọn — BR-09)'}
                </label>
                <input
                  type="text"
                  value={prodForm.glbUrl}
                  onChange={(e) => setProdForm({ ...prodForm, glbUrl: e.target.value })}
                  placeholder="/models/custom-bag.glb"
                  className="w-full rounded-xl border border-coastal-line bg-coastal-bg px-3.5 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-coastal-line">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="rounded-full border border-coastal-line px-4 py-2 text-xs font-semibold text-coastal-ink"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="astryx-btn-primary px-5 py-2 text-xs"
              >
                {isEn ? 'Save Product' : 'Lưu Sản Phẩm'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: CREATE / EDIT CUSTOM MATERIAL (VỎ SÒ / ỐC)                   */}
      {/* ===================================================================== */}
      {isMaterialModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-coastal-ink/70 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveMaterial}
            className="w-full max-w-lg astryx-bento bg-coastal-card p-6 shadow-xl space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-coastal-line pb-3">
              <h3 className="font-serif text-lg font-semibold text-coastal-ink">
                {editingMaterial
                  ? isEn
                    ? 'Update Shell / Snail Material'
                    : 'Cập Nhật Nguyên Liệu Vỏ Sò / Ốc'
                  : isEn
                  ? 'Add New Marine Accessory'
                  : 'Thêm Phụ Kiện Biển Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMaterialModalOpen(false)}
                className="rounded-full p-1.5 text-coastal-slate hover:bg-coastal-mist"
              >
                <AppIcon name="x" className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-coastal-ink mb-1">
                  {isEn ? 'Shell / Snail / Charm Name *' : 'Tên vỏ sò / ốc / charm *'}
                </label>
                <input
                  type="text"
                  required
                  value={matForm.name}
                  onChange={(e) => setMatForm({ ...matForm, name: e.target.value })}
                  className="w-full rounded-xl border border-coastal-line bg-coastal-bg px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-coastal-ink mb-1">
                  {isEn ? 'Group' : 'Nhóm'}
                </label>
                <select
                  value={matForm.materialType}
                  onChange={(e) =>
                    setMatForm({ ...matForm, materialType: e.target.value as MaterialCategory })
                  }
                  className="w-full rounded-xl border border-coastal-line bg-coastal-bg px-3.5 py-2 text-sm"
                >
                  <option value="shell">Vỏ sò (shell)</option>
                  <option value="snail">Ốc biển (snail)</option>
                  <option value="charm">Charm biển (charm)</option>
                  <option value="bead">Ngọc trai / Hạt (bead)</option>
                  <option value="cord">Nút dây lưới (cord)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-coastal-ink mb-1">
                  Mesh Preset 3D
                </label>
                <select
                  value={matForm.meshPreset}
                  onChange={(e) => setMatForm({ ...matForm, meshPreset: e.target.value })}
                  className="w-full rounded-xl border border-coastal-line bg-coastal-bg px-3.5 py-2 text-sm"
                >
                  <option value="scallop_shell">scallop_shell (Vỏ sò điệp)</option>
                  <option value="cowrie_shell">cowrie_shell (Ốc sứ)</option>
                  <option value="spiral_snail">spiral_snail (Ốc xoắn)</option>
                  <option value="conch_snail">conch_snail (Ốc xà cừ)</option>
                  <option value="starfish_charm">starfish_charm (Sao biển)</option>
                  <option value="turtle_charm">turtle_charm (Rùa biển)</option>
                  <option value="pearl_bead">pearl_bead (Ngọc trai)</option>
                  <option value="fishing_cord">fishing_cord (Nút dây lưới)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-coastal-ink mb-1">
                  {isEn ? 'Unit Price (VND/pc)' : 'Đơn giá đính (VNĐ/cái)'}
                </label>
                <input
                  type="number"
                  required
                  value={matForm.unitPrice}
                  onChange={(e) => setMatForm({ ...matForm, unitPrice: Number(e.target.value) })}
                  className="w-full rounded-xl border border-coastal-line bg-coastal-bg px-3.5 py-2 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-coastal-ink mb-1">
                  {isEn ? 'Stock Quantity (pcs)' : 'Số lượng tồn kho (cái)'}
                </label>
                <input
                  type="number"
                  required
                  value={matForm.stockQuantity}
                  onChange={(e) =>
                    setMatForm({ ...matForm, stockQuantity: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-coastal-line bg-coastal-bg px-3.5 py-2 font-mono text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <S3ImageUploader
                  folder="materials"
                  compact
                  label={
                    isEn
                      ? 'Shell / Snail / Charm Image (Upload to AWS S3)'
                      : 'Ảnh vỏ sò / ốc biển / charm (Tải lên AWS S3)'
                  }
                  value={matForm.thumbnail}
                  onChange={(newUrl) => setMatForm({ ...matForm, thumbnail: newUrl })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-coastal-line">
              <button
                type="button"
                onClick={() => setIsMaterialModalOpen(false)}
                className="rounded-full border border-coastal-line px-4 py-2 text-xs font-semibold text-coastal-ink"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="astryx-btn-leaf px-5 py-2 text-xs"
              >
                {isEn ? 'Save Material' : 'Lưu Nguyên Liệu'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ModalConfirm
        isOpen={Boolean(deleteTarget)}
        title={
          isEn
            ? `Delete ${deleteTarget?.type === 'product' ? 'product' : 'material'}?`
            : `Xóa ${deleteTarget?.type === 'product' ? 'sản phẩm' : 'nguyên liệu'}?`
        }
        description={
          isEn
            ? `Are you sure you want to delete "${deleteTarget?.name}" from the catalog?`
            : `Bạn có chắc chắn muốn xóa "${deleteTarget?.name}" khỏi danh mục hệ thống?`
        }
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <AppFooter />
    </div>
  );
}
