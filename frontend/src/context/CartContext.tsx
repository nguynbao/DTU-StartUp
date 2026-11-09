'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { CartItem, CustomDesignSnapshot, Product } from '@/types';
import { PRODUCT_COLOR_PRESETS } from '@/config/theme';
import { useI18n } from '@/i18n/I18nContext';

interface CartContextValue {
  items: CartItem[];
  totalItemsCount: number;
  subtotalAmount: number;
  totalNetWeightGrams: number;
  addStandardItem: (
    product: Product,
    quantity?: number,
    selectedColor?: string,
    selectedSize?: string
  ) => void;
  addCustomDesignItem: (
    product: Product,
    customDesign: CustomDesignSnapshot,
    quantity?: number
  ) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = 'dtu_upcycled_cart_v1';

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore storage read error
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write error
    }
  }, [items, isHydrated]);

  const addStandardItem = useCallback(
    (product: Product, quantity = 1, selectedColor?: string, selectedSize?: string) => {
      const color =
        selectedColor || product.model3D?.defaultBaseColor || PRODUCT_COLOR_PRESETS.kelpGreen;
      const size = selectedSize || product.sizes?.[0] || t('common.standardSize');
      const cartItemId = `std-${product._id}-${color}-${size}`;

      setItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.cartItemId === cartItemId);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        }
        return [
          ...prev,
          {
            cartItemId,
            productId: product._id,
            productSlug: product.slug,
            productName: product.name,
            productCategory: product.category,
            thumbnail: product.images?.[0] || product.thumbnail || '',
            quantity,
            selectedColor: color,
            selectedSize: size,
            unitPrice: product.basePrice,
            netWeightGrams: product.ecoImpact?.netWeightGrams || 250,
            isCustom: false,
          },
        ];
      });
    },
    [t]
  );

  const addCustomDesignItem = useCallback(
    (product: Product, customDesign: CustomDesignSnapshot, quantity = 1) => {
      const cartItemId = `custom-${product._id}-${Date.now()}`;
      setItems((prev) => [
        ...prev,
        {
          cartItemId,
          productId: product._id,
          productSlug: product.slug,
          productName: product.name,
          productCategory: product.category,
          thumbnail: product.images?.[0] || product.thumbnail || '',
          quantity,
          selectedColor: customDesign.baseColor,
          selectedSize: product.sizes?.[0] || t('common.custom3D'),
          unitPrice: customDesign.estimatedPrice,
          netWeightGrams: product.ecoImpact?.netWeightGrams || 300,
          isCustom: true,
          customDesignId: customDesign._id,
          customDesign,
        },
      ]);
    },
    [t]
  );

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
    );
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItemsCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  const totalNetWeightGrams = useMemo(
    () => items.reduce((sum, item) => sum + (item.netWeightGrams || 250) * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      totalItemsCount,
      subtotalAmount,
      totalNetWeightGrams,
      addStandardItem,
      addCustomDesignItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      totalItemsCount,
      subtotalAmount,
      totalNetWeightGrams,
      addStandardItem,
      addCustomDesignItem,
      updateQuantity,
      removeItem,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
