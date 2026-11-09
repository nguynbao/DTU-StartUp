'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { ThreeCanvasViewer } from '@/components/three/ThreeCanvasViewer';
import { BomPriceBreakdownCard } from '@/components/common/BomPriceBreakdownCard';
import { AppIcon } from '@/components/ui/AppIcon';
import { ModalConfirm } from '@/components/ui/ModalConfirm';
import { formatVnd } from '@/components/ui/PriceTag';
import { PRODUCT_COLOR_PRESETS, THEME_COLORS } from '@/config/theme';
import { useI18n } from '@/i18n/I18nContext';
import {
  FALLBACK_MATERIALS,
  FALLBACK_PRODUCTS,
  getCustomMaterials,
  getProducts,
  saveCustomDesign,
} from '@/lib/api';
import { BraceletConfig, CustomMaterial, Placement3D, Product } from '@/types';
import { useCart } from '@/context/CartContext';

const MAX_PLACEMENTS = 50; // BR-02
const WRIST_SIZE_OPTIONS = [14, 15, 16, 17, 18, 19, 20];
const QUICK_SLOT_COUNTS = [8, 10, 12, 14, 16];

const BASE_NET_SWATCHES = [
  PRODUCT_COLOR_PRESETS.kelpGreen,
  PRODUCT_COLOR_PRESETS.abyssalTeal,
  PRODUCT_COLOR_PRESETS.deepNavy,
  PRODUCT_COLOR_PRESETS.charcoalInk,
  PRODUCT_COLOR_PRESETS.driftwoodBrown,
  PRODUCT_COLOR_PRESETS.amberCord,
  THEME_COLORS.kelpLight,
];

const STRAP_CORD_SWATCHES = [
  PRODUCT_COLOR_PRESETS.terracottaRust,
  THEME_COLORS.gold,
  PRODUCT_COLOR_PRESETS.driftwoodBrown,
  PRODUCT_COLOR_PRESETS.kelpGreen,
  PRODUCT_COLOR_PRESETS.charcoalInk,
  THEME_COLORS.goldLight,
];

const SHELL_TINT_SWATCHES = [
  PRODUCT_COLOR_PRESETS.sandCream,
  PRODUCT_COLOR_PRESETS.coralShell,
  PRODUCT_COLOR_PRESETS.goldenSnail,
  PRODUCT_COLOR_PRESETS.turquoiseConch,
  PRODUCT_COLOR_PRESETS.cowrieIvory,
  PRODUCT_COLOR_PRESETS.seaGlassBlue,
];

const MATERIAL_TYPE_TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'shell', label: 'Vỏ sò' },
  { value: 'snail', label: 'Ốc biển' },
  { value: 'charm', label: 'Charm' },
  { value: 'bead', label: 'Ngọc trai' },
  { value: 'cord', label: 'Dây lưới' },
];

function computeSlotCoords(
  slotIdx: number,
  slotCount: number,
  wristSizeCm: number,
  isCharm = false
): { position: [number, number, number]; normal: [number, number, number]; rotation: number } {
  const radius = 0.95 * (wristSizeCm / 16);
  const arcSpan = Math.PI * 1.76;
  const startAngle = Math.PI / 2 + arcSpan / 2;
  const theta =
    slotCount > 1 ? startAngle - (slotIdx / (slotCount - 1)) * arcSpan : Math.PI / 2;
  const radialDist = isCharm ? radius + 0.14 : radius;
  const sx = Number((Math.cos(theta) * radialDist).toFixed(4));
  const sy = Number((Math.sin(theta) * radialDist).toFixed(4));
  const nx = Number(Math.cos(theta).toFixed(4));
  const ny = Number(Math.sin(theta).toFixed(4));
  const rotDeg = Math.round(((theta - Math.PI / 2) * 180) / Math.PI);
  return {
    position: [sx, sy, 0],
    normal: [nx, ny, 0.25],
    rotation: ((rotDeg % 360) + 360) % 360,
  };
}

function CustomizerStudioContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialProductSlug = searchParams.get('product');

  const { addCustomDesignItem } = useCart();

  const [products, setProducts] = useState<Product[]>(
    FALLBACK_PRODUCTS.filter((p) => p.isCustomizable)
  );
  const [materials, setMaterials] = useState<CustomMaterial[]>(FALLBACK_MATERIALS);

  const [selectedProduct, setSelectedProduct] = useState<Product>(() => {
    const found = FALLBACK_PRODUCTS.find((p) => p.slug === initialProductSlug);
    return found || FALLBACK_PRODUCTS[0];
  });

  const [baseColor, setBaseColor] = useState<string>(
    selectedProduct.model3D?.defaultBaseColor || PRODUCT_COLOR_PRESETS.kelpGreen
  );
  const [strapColor, setStrapColor] = useState<string>(
    selectedProduct.model3D?.defaultStrapColor || PRODUCT_COLOR_PRESETS.terracottaRust
  );

  // Sequential Bracelet Chain State
  const [braceletConfig, setBraceletConfig] = useState<BraceletConfig>({
    wristSizeCm: 16,
    slotCount: 12,
    cordMaterial: 'hemp_net',
  });
  const [activeSlotCursor, setActiveSlotCursor] = useState<number>(0);

  const [placements, setPlacements] = useState<Placement3D[]>([]);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);
  const [activeMaterialTab, setActiveMaterialTab] = useState<string>('all');
  const [activeMaterialToPlace, setActiveMaterialToPlace] = useState<CustomMaterial | null>(
    FALLBACK_MATERIALS[0]
  );

  const [artisanNote, setArtisanNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isBraceletMode = useMemo(() => {
    return (
      selectedProduct.category === 'bracelet' ||
      (selectedProduct.model3D?.meshPreset || '').toLowerCase().includes('bracelet')
    );
  }, [selectedProduct]);

  useEffect(() => {
    let mounted = true;
    Promise.all([getProducts({ isCustomizable: true }), getCustomMaterials()]).then(
      ([prodList, matList]) => {
        if (!mounted) return;
        if (prodList.length > 0) {
          setProducts(prodList);
          if (initialProductSlug) {
            const match = prodList.find((p) => p.slug === initialProductSlug);
            if (match) {
              setSelectedProduct(match);
              setBaseColor(
                match.model3D?.defaultBaseColor || PRODUCT_COLOR_PRESETS.kelpGreen
              );
              setStrapColor(
                match.model3D?.defaultStrapColor || PRODUCT_COLOR_PRESETS.terracottaRust
              );
            }
          }
        }
        if (matList.length > 0) {
          setMaterials(matList);
          setActiveMaterialToPlace(matList[0]);
        }
      }
    );
    return () => {
      mounted = false;
    };
  }, [initialProductSlug]);

  const filteredMaterials = useMemo(() => {
    if (activeMaterialTab === 'all') return materials;
    return materials.filter((m) => m.materialType === activeMaterialTab);
  }, [materials, activeMaterialTab]);

  const selectedPlacement = useMemo(
    () => placements.find((p) => p.placementId === selectedPlacementId) || null,
    [placements, selectedPlacementId]
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  // Switch Base Product
  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setBaseColor(prod.model3D?.defaultBaseColor || PRODUCT_COLOR_PRESETS.kelpGreen);
    setStrapColor(prod.model3D?.defaultStrapColor || PRODUCT_COLOR_PRESETS.terracottaRust);
    setPlacements([]);
    setSelectedPlacementId(null);
    setActiveSlotCursor(0);
  };

  // Update Bracelet Slot Count and keep existing slots within range
  const handleChangeSlotCount = (newCount: number) => {
    const clamped = Math.min(20, Math.max(6, newCount));
    setBraceletConfig((prev) => ({ ...prev, slotCount: clamped }));
    setPlacements((prev) =>
      prev
        .filter((p) => p.slotIndex === undefined || p.slotIndex < clamped)
        .map((p) => {
          if (p.slotIndex === undefined) return p;
          const coords = computeSlotCoords(
            p.slotIndex,
            clamped,
            braceletConfig.wristSizeCm,
            p.isDanglingCharm
          );
          return {
            ...p,
            position: coords.position,
            normal: coords.normal,
          };
        })
    );
    if (activeSlotCursor >= clamped) {
      setActiveSlotCursor(clamped - 1);
    }
  };

  // Place or Replace a Material into a specific Bracelet Slot (0 .. slotCount-1)
  const placeMaterialAtBraceletSlot = (mat: CustomMaterial, targetSlotIdx: number) => {
    const safeSlot = Math.min(braceletConfig.slotCount - 1, Math.max(0, targetSlotIdx));
    const isCharm =
      mat.materialType === 'charm' ||
      (mat.model3D?.meshPreset || '').includes('charm') ||
      (mat.model3D?.meshPreset || '').includes('starfish') ||
      (mat.model3D?.meshPreset || '').includes('turtle');

    const coords = computeSlotCoords(
      safeSlot,
      braceletConfig.slotCount,
      braceletConfig.wristSizeCm,
      isCharm
    );

    const newId = `slot-${safeSlot}-${Date.now()}`;
    const newPlacement: Placement3D = {
      placementId: newId,
      materialId: mat._id,
      materialName: mat.name,
      materialType: mat.materialType,
      meshPreset: mat.model3D?.meshPreset || 'scallop_shell',
      glbUrl: mat.model3D?.glbUrl,
      unitPrice: mat.unitPrice,
      position: coords.position,
      normal: coords.normal,
      rotation: 0,
      scale: mat.model3D?.defaultScale || 1.0,
      color: mat.colorHex || PRODUCT_COLOR_PRESETS.sandCream,
      slotIndex: safeSlot,
      isDanglingCharm: isCharm,
    };

    setPlacements((prev) => {
      const withoutTarget = prev.filter((p) => p.slotIndex !== safeSlot);
      return [...withoutTarget, newPlacement].sort(
        (a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0)
      );
    });
    setSelectedPlacementId(newId);

    const nextSlot = (safeSlot + 1) % braceletConfig.slotCount;
    setActiveSlotCursor(nextSlot);
  };

  // Auto-fill harmonizing pattern across all bracelet slots
  const handleAutoFillBraceletPattern = () => {
    if (materials.length === 0) return;
    const patternMats = materials.filter((m) => m.stockQuantity > 0);
    if (patternMats.length === 0) return;

    const generated: Placement3D[] = [];
    for (let s = 0; s < braceletConfig.slotCount; s++) {
      const mat = patternMats[s % patternMats.length];
      const isCharm =
        mat.materialType === 'charm' ||
        (mat.model3D?.meshPreset || '').includes('charm');
      const coords = computeSlotCoords(
        s,
        braceletConfig.slotCount,
        braceletConfig.wristSizeCm,
        isCharm
      );
      generated.push({
        placementId: `auto-slot-${s}-${Date.now()}`,
        materialId: mat._id,
        materialName: mat.name,
        materialType: mat.materialType,
        meshPreset: mat.model3D?.meshPreset || 'scallop_shell',
        glbUrl: mat.model3D?.glbUrl,
        unitPrice: mat.unitPrice,
        position: coords.position,
        normal: coords.normal,
        rotation: 0,
        scale: mat.model3D?.defaultScale || 1.0,
        color: mat.colorHex || PRODUCT_COLOR_PRESETS.sandCream,
        slotIndex: s,
        isDanglingCharm: isCharm,
      });
    }
    setPlacements(generated);
    setSelectedPlacementId(generated[0]?.placementId || null);
    showToast(`Đã phối tự động chuỗi ${braceletConfig.slotCount} mắt vòng tay.`);
  };

  // Swap selected bracelet slot with left (-1) or right (+1) neighbor
  const handleSwapBraceletSlot = (direction: -1 | 1) => {
    if (!selectedPlacement || selectedPlacement.slotIndex === undefined) return;
    const curSlot = selectedPlacement.slotIndex;
    const neighborSlot =
      (curSlot + direction + braceletConfig.slotCount) % braceletConfig.slotCount;

    setPlacements((prev) => {
      const updated = prev.map((p) => {
        if (p.slotIndex === curSlot) {
          const coords = computeSlotCoords(
            neighborSlot,
            braceletConfig.slotCount,
            braceletConfig.wristSizeCm,
            p.isDanglingCharm
          );
          return {
            ...p,
            slotIndex: neighborSlot,
            position: coords.position,
            normal: coords.normal,
          };
        }
        if (p.slotIndex === neighborSlot) {
          const coords = computeSlotCoords(
            curSlot,
            braceletConfig.slotCount,
            braceletConfig.wristSizeCm,
            p.isDanglingCharm
          );
          return {
            ...p,
            slotIndex: curSlot,
            position: coords.position,
            normal: coords.normal,
          };
        }
        return p;
      });
      return updated.sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0));
    });
    setActiveSlotCursor(neighborSlot);
  };

  // Surface Raycasting Handler (BR-02 & BR-03)
  const handleSurfacePlace = (
    position: [number, number, number],
    normal: [number, number, number],
    slotIndex?: number
  ) => {
    if (!activeMaterialToPlace) {
      showToast('Vui lòng chọn một loại vỏ sò/ốc ở cột bên trái trước khi đính.');
      return;
    }

    if (isBraceletMode) {
      const targetSlot = slotIndex !== undefined ? slotIndex : activeSlotCursor;
      placeMaterialAtBraceletSlot(activeMaterialToPlace, targetSlot);
      return;
    }

    if (placements.length >= MAX_PLACEMENTS) {
      showToast(`Đã đạt giới hạn tối đa ${MAX_PLACEMENTS} phụ kiện trên một sản phẩm (BR-02).`);
      return;
    }

    const countSameMat = placements.filter(
      (p) => p.materialId === activeMaterialToPlace._id
    ).length;
    if (countSameMat >= activeMaterialToPlace.stockQuantity) {
      showToast(
        `Nguyên liệu "${activeMaterialToPlace.name}" chỉ còn ${activeMaterialToPlace.stockQuantity} cái trong kho.`
      );
      return;
    }

    const newId = `place-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const nextPlacement: Placement3D = {
      placementId: newId,
      materialId: activeMaterialToPlace._id,
      materialName: activeMaterialToPlace.name,
      materialType: activeMaterialToPlace.materialType,
      meshPreset: activeMaterialToPlace.model3D?.meshPreset || 'scallop_shell',
      glbUrl: activeMaterialToPlace.model3D?.glbUrl,
      unitPrice: activeMaterialToPlace.unitPrice,
      position,
      normal,
      rotation: 0,
      scale: activeMaterialToPlace.model3D?.defaultScale || 1.0,
      color: activeMaterialToPlace.colorHex || PRODUCT_COLOR_PRESETS.sandCream,
    };

    setPlacements((prev) => [...prev, nextPlacement]);
    setSelectedPlacementId(newId);
  };

  const handleUpdatePlacement = (placementId: string, patch: Partial<Placement3D>) => {
    setPlacements((prev) =>
      prev.map((p) => (p.placementId === placementId ? { ...p, ...patch } : p))
    );
  };

  const handleDuplicateSelected = () => {
    if (!selectedPlacement) return;
    if (placements.length >= MAX_PLACEMENTS) {
      showToast(`Không thể nhân bản quá ${MAX_PLACEMENTS} phụ kiện (BR-02).`);
      return;
    }
    if (isBraceletMode) {
      placeMaterialAtBraceletSlot(
        materials.find((m) => m._id === selectedPlacement.materialId) || materials[0],
        activeSlotCursor
      );
      return;
    }
    const newId = `place-${Date.now()}`;
    const offsetPos: [number, number, number] = [
      Number((selectedPlacement.position[0] + 0.14).toFixed(4)),
      Number((selectedPlacement.position[1] + 0.06).toFixed(4)),
      selectedPlacement.position[2],
    ];
    const cloned: Placement3D = {
      ...selectedPlacement,
      placementId: newId,
      position: offsetPos,
    };
    setPlacements((prev) => [...prev, cloned]);
    setSelectedPlacementId(newId);
  };

  const handleRemoveSelected = () => {
    if (!selectedPlacementId) return;
    setPlacements((prev) => prev.filter((p) => p.placementId !== selectedPlacementId));
    setSelectedPlacementId(null);
  };

  const handleSaveAndAddToCart = async () => {
    setIsSaving(true);
    try {
      const materialsTotal = placements.reduce((sum, p) => sum + (p.unitPrice || 0), 0);
      const effectiveCraftFee = selectedProduct.craftFee;
      const estimatedPrice =
        selectedProduct.basePrice + effectiveCraftFee + materialsTotal;

      const snapshotPayload = {
        productId: selectedProduct._id,
        productName: selectedProduct.name,
        productSlug: selectedProduct.slug,
        meshPreset: selectedProduct.model3D?.meshPreset || 'tote_bag',
        glbUrl: selectedProduct.model3D?.glbUrl,
        baseColor,
        strapColor,
        braceletConfig: isBraceletMode ? braceletConfig : undefined,
        artisanNote: artisanNote.trim() || undefined,
        placements,
        basePrice: selectedProduct.basePrice,
        craftFee: effectiveCraftFee,
        materialsTotal,
        estimatedPrice,
      };

      const savedDesign = await saveCustomDesign(snapshotPayload);
      addCustomDesignItem(selectedProduct, savedDesign, 1);
      showToast('Đã lưu bản vẽ 3D và thêm vào giỏ hàng. Đang chuyển tới Giỏ hàng...');
      setTimeout(() => {
        router.push('/cart');
      }, 850);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-coastal-bg">
      <AppHeader
        variant="studio"
        studioTitle={`${t('customizer.studioHeading')} — ${selectedProduct.name}`}
        backHref={`/product/${selectedProduct.slug}`}
      />

      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-coastal-kelp px-5 py-3 text-xs font-semibold text-coastal-card shadow-lg border border-coastal-kelp-hover"
        >
          <AppIcon name="checkCircle" className="h-4 w-4 text-coastal-card" />
          {toastMsg}
        </div>
      )}

      <main className="flex-1 mx-auto w-full max-w-[1600px] p-3 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 astryx-bento px-5 py-4">
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-semibold text-coastal-ink flex items-center gap-2">
              <AppIcon name="compass" className="h-4 w-4 text-coastal-rust" />
              {isBraceletMode
                ? t('three.badgeBraceletStudio')
                : t('customizer.studioHeading')}
            </h1>
            <p className="text-xs text-coastal-slate mt-0.5">
              {isBraceletMode
                ? t('three.hintBraceletStudio')
                : t('three.hintSurfaceStudio')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-coastal-line bg-coastal-card px-4 py-2 text-xs font-semibold text-coastal-slate hover:bg-coastal-rust/10 hover:text-coastal-rust hover:border-coastal-rust/40 transition"
          >
            <AppIcon name="rotateCcw" className="h-3.5 w-3.5" />
            {t('common.reset')} ({placements.length})
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* LEFT PANEL (3 cols) */}
          <aside
            aria-label="Kho phôi sản phẩm và phụ kiện vỏ sò"
            className="lg:col-span-3 space-y-4"
          >
            <div className="astryx-card p-4">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-coastal-kelp mb-2.5">
                <AppIcon name="layers" className="h-3.5 w-3.5" />
                1. Chọn Phôi Sản Phẩm 3D
              </div>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {products.map((prod) => {
                  const isSelected = prod._id === selectedProduct._id;
                  return (
                    <button
                      key={prod._id}
                      type="button"
                      onClick={() => handleSelectProduct(prod)}
                      className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs transition ${
                        isSelected
                          ? 'border-coastal-kelp bg-coastal-mist font-semibold text-coastal-ink'
                          : 'border-coastal-line bg-coastal-card text-coastal-slate hover:bg-coastal-bg'
                      }`}
                    >
                      <span className="truncate pr-2">{prod.name}</span>
                      <span className="font-mono text-[11px] font-medium text-coastal-kelp shrink-0">
                        {formatVnd(prod.basePrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {isBraceletMode && (
              <div className="astryx-bento border-coastal-rust/40 p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-coastal-rust">
                    <AppIcon name="ruler" className="h-3.5 w-3.5" />
                    Thông Số Chuỗi Vòng Tay
                  </span>
                  <span className="astryx-pill bg-coastal-card text-coastal-ink">
                    {braceletConfig.wristSizeCm}cm
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-coastal-ink mb-1.5">
                    {t('customizer.wristSizeLabel')}:
                  </label>
                  <div className="grid grid-cols-7 gap-1">
                    {WRIST_SIZE_OPTIONS.map((cm) => (
                      <button
                        key={cm}
                        type="button"
                        onClick={() =>
                          setBraceletConfig((prev) => ({ ...prev, wristSizeCm: cm }))
                        }
                        className={`rounded-full border py-1.5 font-mono text-xs font-medium transition ${
                          braceletConfig.wristSizeCm === cm
                            ? 'border-coastal-kelp bg-coastal-kelp text-coastal-card'
                            : 'border-coastal-line bg-coastal-card text-coastal-ink hover:bg-coastal-mist'
                        }`}
                      >
                        {cm}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-coastal-ink mb-1">
                    <span>{t('customizer.slotCountLabel')}:</span>
                    <span className="font-mono font-bold text-coastal-rust">
                      {braceletConfig.slotCount} mắt
                    </span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={20}
                    step={1}
                    value={braceletConfig.slotCount}
                    onChange={(e) => handleChangeSlotCount(parseInt(e.target.value, 10))}
                    className="w-full accent-coastal-kelp"
                  />
                  <div className="mt-1.5 flex items-center justify-between gap-1">
                    {QUICK_SLOT_COUNTS.map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => handleChangeSlotCount(cnt)}
                        className={`flex-1 rounded-full border py-1 font-mono text-[11px] transition ${
                          braceletConfig.slotCount === cnt
                            ? 'border-coastal-rust bg-coastal-rust/15 font-bold text-coastal-rust'
                            : 'border-coastal-line bg-coastal-card text-coastal-slate'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoFillBraceletPattern}
                  className="w-full astryx-btn-leaf px-3 py-2.5 text-xs"
                >
                  Tự động phối chuỗi mẫu ({braceletConfig.slotCount} mắt)
                </button>
              </div>
            )}

            <div className="astryx-card p-4 space-y-3">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-coastal-kelp">
                <AppIcon name="palette" className="h-3.5 w-3.5" />
                2. Phối Màu Sợi Lưới & Dây Viền
              </div>

              <div>
                <span className="block text-[11px] font-medium text-coastal-slate mb-1.5">
                  {t('customizer.cordColorLabel')}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {BASE_NET_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setBaseColor(hex)}
                      aria-label={`Màu thân ${hex}`}
                      className={`h-6 w-6 rounded-full border transition ${
                        baseColor === hex
                          ? 'border-coastal-rust scale-110 ring-2 ring-coastal-rust/30'
                          : 'border-coastal-line'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-medium text-coastal-slate mb-1.5">
                  {t('customizer.strapColorLabel')}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {STRAP_CORD_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setStrapColor(hex)}
                      aria-label={`Màu dây ${hex}`}
                      className={`h-6 w-6 rounded-full border transition ${
                        strapColor === hex
                          ? 'border-coastal-rust scale-110 ring-2 ring-coastal-rust/30'
                          : 'border-coastal-line'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="astryx-card p-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-coastal-kelp">
                  3. Kho Vỏ Sò & Ốc Biển ({filteredMaterials.length})
                </span>
                <span className="astryx-pill border-coastal-rust/30 bg-coastal-rust/10 text-coastal-rust">
                  {isBraceletMode ? `Mắt số ${activeSlotCursor + 1}` : 'Chọn để đính'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {MATERIAL_TYPE_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveMaterialTab(tab.value)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                      activeMaterialTab === tab.value
                        ? 'bg-coastal-kelp text-coastal-card shadow-xs'
                        : 'bg-coastal-mist text-coastal-slate hover:text-coastal-ink'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredMaterials.map((mat) => {
                  const isActive = activeMaterialToPlace?._id === mat._id;
                  const outOfStock = mat.stockQuantity <= 0;
                  return (
                    <button
                      key={mat._id}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => {
                        setActiveMaterialToPlace(mat);
                        if (isBraceletMode) {
                          placeMaterialAtBraceletSlot(mat, activeSlotCursor);
                        }
                      }}
                      className={`w-full flex items-center justify-between rounded-xl border p-2.5 text-left transition ${
                        outOfStock
                          ? 'opacity-45 cursor-not-allowed border-coastal-line bg-coastal-bg'
                          : isActive
                          ? 'border-coastal-rust bg-coastal-mist shadow-xs'
                          : 'border-coastal-line hover:border-coastal-kelp bg-coastal-card'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="h-7 w-7 rounded-full border border-coastal-line shrink-0"
                          style={{ backgroundColor: mat.colorHex }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-coastal-ink truncate">
                            {mat.name}
                          </div>
                          <div className="font-mono text-[10px] text-coastal-slate">
                            Tồn kho: {mat.stockQuantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className="block font-mono text-xs font-semibold text-coastal-kelp">
                          +{formatVnd(mat.unitPrice)}
                        </span>
                        {isBraceletMode ? (
                          <span className="font-mono text-[10px] text-coastal-rust">
                            + Mắt {activeSlotCursor + 1}
                          </span>
                        ) : (
                          isActive && (
                            <span className="font-mono text-[10px] text-coastal-rust">
                              Đang chọn
                            </span>
                          )
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* CENTER PANEL (6 cols) */}
          <section
            aria-label="Không gian thiết kế 3D tương tác"
            className="lg:col-span-6 flex flex-col gap-3"
          >
            <div className="h-[460px] sm:h-[520px] w-full astryx-bento p-2.5">
              <div className="h-full w-full overflow-hidden rounded-2xl">
                <ThreeCanvasViewer
                  mode="studio"
                  productPreset={selectedProduct.model3D?.meshPreset || 'tote_bag'}
                  productGlbUrl={selectedProduct.model3D?.glbUrl}
                  baseColor={baseColor}
                  strapColor={strapColor}
                  placements={placements}
                  braceletConfig={isBraceletMode ? braceletConfig : undefined}
                  selectedPlacementId={selectedPlacementId}
                  activeMaterialToPlace={activeMaterialToPlace}
                  onSurfacePlace={handleSurfacePlace}
                  onSelectPlacement={(id) => {
                    setSelectedPlacementId(id);
                    if (id && isBraceletMode) {
                      const found = placements.find((p) => p.placementId === id);
                      if (found?.slotIndex !== undefined) {
                        setActiveSlotCursor(found.slotIndex);
                      }
                    }
                  }}
                  onUpdatePlacement={handleUpdatePlacement}
                  onRemovePlacement={(id) => {
                    setPlacements((prev) => prev.filter((p) => p.placementId !== id));
                    if (selectedPlacementId === id) setSelectedPlacementId(null);
                  }}
                  className="h-full w-full"
                />
              </div>
            </div>

            {isBraceletMode && (
              <div className="astryx-card p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-coastal-kelp">
                      Sơ Đồ Thứ Tự Mắt Vòng Tay (1 → {braceletConfig.slotCount})
                    </span>
                    <p className="text-xs text-coastal-slate">
                      Chạm vào ô bất kỳ bên dưới để chọn vị trí cần gắn hoặc hoán đổi thứ tự vỏ sò/ốc.
                    </p>
                  </div>
                  <span className="astryx-pill border-coastal-rust/30 bg-coastal-rust/10 text-coastal-rust">
                    Đã kết: {placements.length}/{braceletConfig.slotCount} mắt
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                  {Array.from({ length: braceletConfig.slotCount }).map((_, idx) => {
                    const slotItem = placements.find((p) => p.slotIndex === idx);
                    const isCursor = activeSlotCursor === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveSlotCursor(idx);
                          if (slotItem) {
                            setSelectedPlacementId(slotItem.placementId);
                          } else if (activeMaterialToPlace) {
                            placeMaterialAtBraceletSlot(activeMaterialToPlace, idx);
                          }
                        }}
                        className={`flex flex-col items-start justify-between rounded-xl border p-2 text-left transition ${
                          isCursor
                            ? 'border-coastal-rust bg-coastal-rust/10 ring-1 ring-coastal-rust'
                            : slotItem
                            ? 'border-coastal-kelp/40 bg-coastal-mist'
                            : 'border-dashed border-coastal-line bg-coastal-bg hover:border-coastal-kelp'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-coastal-slate">
                            Mắt {idx + 1}
                          </span>
                          {slotItem && (
                            <span
                              className="h-2.5 w-2.5 rounded-full border border-coastal-ink/20"
                              style={{ backgroundColor: slotItem.color }}
                            />
                          )}
                        </div>
                        <span className="mt-1 w-full truncate text-[11px] font-medium text-coastal-ink">
                          {slotItem ? slotItem.materialName.replace('Vỏ ', '') : 'Trống'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="astryx-card p-4">
              {selectedPlacement ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-coastal-line pb-2.5">
                    <div>
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-coastal-rust">
                        {selectedPlacement.slotIndex !== undefined
                          ? `Đang chỉnh mắt vòng số ${selectedPlacement.slotIndex + 1}`
                          : 'Đang chỉnh sửa phụ kiện đã gắn'}
                      </span>
                      <h2 className="font-serif text-base font-semibold text-coastal-ink">
                        {selectedPlacement.materialName} (+{formatVnd(selectedPlacement.unitPrice)})
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {isBraceletMode && selectedPlacement.slotIndex !== undefined && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSwapBraceletSlot(-1)}
                            className="inline-flex items-center gap-1 rounded-full border border-coastal-line bg-coastal-bg px-3 py-1.5 text-xs font-medium text-coastal-ink hover:bg-coastal-mist"
                            title="Hoán đổi vị trí với mắt bên trái"
                          >
                            <AppIcon name="arrowLeft" className="h-3.5 w-3.5" />
                            Đổi sang trái
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSwapBraceletSlot(1)}
                            className="inline-flex items-center gap-1 rounded-full border border-coastal-line bg-coastal-bg px-3 py-1.5 text-xs font-medium text-coastal-ink hover:bg-coastal-mist"
                            title="Hoán đổi vị trí với mắt bên phải"
                          >
                            Đổi sang phải
                            <AppIcon name="arrowRight" className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdatePlacement(selectedPlacement.placementId, {
                                isDanglingCharm: !selectedPlacement.isDanglingCharm,
                              })
                            }
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                              selectedPlacement.isDanglingCharm
                                ? 'border-coastal-rust bg-coastal-rust text-coastal-card'
                                : 'border-coastal-line bg-coastal-bg text-coastal-ink'
                            }`}
                          >
                            {selectedPlacement.isDanglingCharm ? 'Charm treo rủ' : 'Nằm trên dây'}
                          </button>
                        </>
                      )}

                      {!isBraceletMode && (
                        <button
                          type="button"
                          onClick={handleDuplicateSelected}
                          className="inline-flex items-center gap-1 rounded-full border border-coastal-line bg-coastal-bg px-3 py-1.5 text-xs font-medium text-coastal-ink hover:bg-coastal-mist"
                        >
                          <AppIcon name="copy" className="h-3.5 w-3.5" />
                          Nhân bản
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleRemoveSelected}
                        className="inline-flex items-center gap-1 rounded-full border border-coastal-rust/30 bg-coastal-rust/10 px-3 py-1.5 text-xs font-semibold text-coastal-rust hover:bg-coastal-rust/20"
                      >
                        <AppIcon name="trash" className="h-3.5 w-3.5" />
                        Gỡ bỏ
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-coastal-ink mb-1">
                        <span>Kích thước (Scale)</span>
                        <span className="font-mono text-coastal-kelp">
                          {selectedPlacement.scale.toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.4}
                        max={2.5}
                        step={0.05}
                        value={selectedPlacement.scale}
                        onChange={(e) =>
                          handleUpdatePlacement(selectedPlacement.placementId, {
                            scale: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-coastal-kelp"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-coastal-ink mb-1">
                        <span>Xoay quanh tâm</span>
                        <span className="font-mono text-coastal-kelp">
                          {selectedPlacement.rotation}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        step={5}
                        value={selectedPlacement.rotation}
                        onChange={(e) =>
                          handleUpdatePlacement(selectedPlacement.placementId, {
                            rotation: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full accent-coastal-kelp"
                      />
                    </div>

                    <div>
                      <span className="block text-xs font-medium text-coastal-ink mb-1.5">
                        Sắc thái vỏ sò / xà cừ:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {SHELL_TINT_SWATCHES.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() =>
                              handleUpdatePlacement(selectedPlacement.placementId, {
                                color: hex,
                              })
                            }
                            className={`h-6 w-6 rounded-full border ${
                              selectedPlacement.color === hex
                                ? 'border-coastal-rust scale-110 ring-2 ring-coastal-rust/30'
                                : 'border-coastal-line'
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-coastal-slate py-1">
                  <span className="inline-flex items-center gap-1.5">
                    <AppIcon name="sliders" className="h-3.5 w-3.5 text-coastal-kelp" />
                    Hướng dẫn: Chạm trực tiếp lên mô hình 3D để gắn{' '}
                    <strong className="text-coastal-ink">
                      {activeMaterialToPlace?.name || 'phụ kiện'}
                    </strong>
                    , hoặc chạm vào một vỏ sò đã gắn để chỉnh kích thước, xoay hoặc hoán đổi vị trí.
                  </span>
                  <span className="font-mono font-semibold text-coastal-kelp shrink-0 ml-2">
                    Đã gắn: {placements.length}/{isBraceletMode ? braceletConfig.slotCount : MAX_PLACEMENTS}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT PANEL (3 cols) */}
          <aside aria-label="Bảng định mức BOM và đặt chế tác" className="lg:col-span-3 space-y-4">
            <BomPriceBreakdownCard
              variant="studio_live"
              baseProductName={
                isBraceletMode
                  ? `${selectedProduct.name} (${braceletConfig.wristSizeCm}cm • ${braceletConfig.slotCount} mắt)`
                  : selectedProduct.name
              }
              basePrice={selectedProduct.basePrice}
              craftFee={selectedProduct.craftFee}
              placements={placements}
              maxPlacements={isBraceletMode ? braceletConfig.slotCount : MAX_PLACEMENTS}
              primaryActionLabel={t('customizer.saveAndAddToCart')}
              onPrimaryAction={handleSaveAndAddToCart}
              isSubmitting={isSaving}
            />

            <div className="astryx-card p-4">
              <label
                htmlFor="artisan-note"
                className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-coastal-ink mb-2"
              >
                Ghi chú gửi nghệ nhân đan & khâu:
              </label>
              <textarea
                id="artisan-note"
                rows={3}
                value={artisanNote}
                onChange={(e) => setArtisanNote(e.target.value)}
                placeholder="VD: Nhờ nghệ nhân thắt nút rút vừa cổ tay 16cm, khâu kỹ phần vỏ sò điệp ở chính giữa..."
                className="w-full rounded-xl border border-coastal-line bg-coastal-bg p-3 text-xs text-coastal-ink placeholder:text-coastal-slate focus:border-coastal-kelp focus:bg-coastal-card focus:outline-none"
              />
            </div>
          </aside>
        </div>
      </main>

      <ModalConfirm
        isOpen={isResetModalOpen}
        title="Làm mới toàn bộ phụ kiện 3D?"
        description="Toàn bộ vỏ sò, ốc biển bạn vừa đính trên mô hình 3D sẽ được gỡ bỏ để bắt đầu lại từ đầu."
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={() => {
          setPlacements([]);
          setSelectedPlacementId(null);
          setActiveSlotCursor(0);
          setIsResetModalOpen(false);
        }}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}

export default function CustomizerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-coastal-bg font-serif text-base text-coastal-kelp">
          Đang khởi tạo Xưởng Chế Tác 3D...
        </div>
      }
    >
      <CustomizerStudioContent />
    </Suspense>
  );
}
