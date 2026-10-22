'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem } from '@/types';

export interface PackVariantOption {
  title?: string;
  packSize: string;
  price: number;
  weightKg?: number;
}

interface CartContextType {
  items: OrderItem[];
  addToCart: (product: Product, quantity?: number, variant?: PackVariantOption) => void;
  reorderItems: (newItems: OrderItem[]) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  itemCount: number;
  subtotal: number;
  freeShippingThreshold: number;
  isFreeShipping: boolean;
  deliveryFee: number;
  total: number;
  pincode: string;
  setPincode: (pin: string) => void;
  pincodeServiceable: boolean | null;
  setPincodeServiceable: (serviceable: boolean | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pincode, setPincode] = useState('560001'); // Default to Bengaluru Urban
  const [pincodeServiceable, setPincodeServiceable] = useState<boolean | null>(true);

  // Load cart from localStorage or URL resume parameter
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tiptur_direct_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }

      // Check for cart resumption token from WhatsApp / SMS recovery link
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const resumeId = searchParams.get('resume');
        if (resumeId) {
          fetch(`/api/cart/sync?id=${encodeURIComponent(resumeId)}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.success && data.cart && Array.isArray(data.cart.cart_items) && data.cart.cart_items.length > 0) {
                setItems(data.cart.cart_items);
                setIsCartOpen(true);
              }
            })
            .catch((e) => console.warn('Failed to restore abandoned cart:', e));
        }
      }
    } catch (e) {
      console.error('Error loading cart:', e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tiptur_direct_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [items]);

  // Synchronize cart with backend and capture exit abandonment
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncWithBackend = (isExit = false) => {
      try {
        const sessionStr = localStorage.getItem('tiptur_customer_session');
        const wishlistStr = localStorage.getItem('tiptur_wishlist');
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        const wishlist = wishlistStr ? JSON.parse(wishlistStr) : [];

        // Only sync if customer is identified (has phone)
        if (!session?.phone) return;

        const payload = JSON.stringify({
          phone: session.phone,
          name: session.name || null,
          email: session.email || null,
          cart_items: items,
          watchlist_items: wishlist,
          subtotal: items.reduce((sum, item) => sum + item.total_price_inr, 0),
          is_exit: isExit
        });

        if (isExit && typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/cart/sync', blob);
        } else {
          fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: isExit
          }).catch((err) => console.warn('Cart sync warning:', err));
        }
      } catch (err) {
        console.warn('Failed to dispatch cart sync:', err);
      }
    };

    // Debounced sync on cart updates
    const debounceTimer = setTimeout(() => {
      syncWithBackend(false);
    }, 1500);

    // Exit handlers for tab close, navigation, or visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncWithBackend(true);
      }
    };

    const handleBeforeUnload = () => {
      syncWithBackend(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      clearTimeout(debounceTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [items]);

  const addToCart = (product: Product, quantity = 1, variant?: PackVariantOption) => {
    const itemTitle = variant ? `${product.title} (${variant.packSize})` : product.title;
    const itemUnit = variant ? variant.packSize : product.unit_of_measure;
    const unitPrice = variant ? variant.price : Number(product.retail_price_inr);
    const unitWeight = variant?.weightKg !== undefined ? variant.weightKg : Number(product.estimated_weight_kg || 1);
    const itemKey = variant ? `${product.id}__${variant.packSize.replace(/\s+/g, '_')}` : product.id;

    setItems((prev) => {
      const matchItem = (it: any) => (it.item_key ? it.item_key === itemKey : (it.product_id === product.id && it.unit_price_inr === unitPrice));
      const existing = prev.find(matchItem);
      if (existing) {
        return prev.map((item) =>
          matchItem(item)
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total_price_inr: (item.quantity + quantity) * item.unit_price_inr,
                estimated_weight_kg: unitWeight * (item.quantity + quantity)
              }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          sku: product.sku,
          title: itemTitle,
          unit_of_measure: itemUnit,
          quantity,
          unit_price_inr: unitPrice,
          total_price_inr: quantity * unitPrice,
          estimated_weight_kg: unitWeight * quantity,
          item_key: itemKey
        }
      ];
    });
    setIsCartOpen(true);
  };

  const reorderItems = (newItems: OrderItem[]) => {
    if (!newItems || newItems.length === 0) return;
    setItems((prev) => {
      const merged = [...prev];
      for (const item of newItems) {
        const itemKey = item.item_key || item.product_id;
        const idx = merged.findIndex((m) => (m.item_key || m.product_id) === itemKey);
        const qty = Number(item.quantity || 1);
        const price = Number(item.unit_price_inr || 0);
        const weight = Number(item.estimated_weight_kg || 1);
        if (idx >= 0) {
          merged[idx] = {
            ...merged[idx],
            quantity: merged[idx].quantity + qty,
            total_price_inr: (merged[idx].quantity + qty) * price,
            estimated_weight_kg: weight * (merged[idx].quantity + qty)
          };
        } else {
          merged.push({
            product_id: item.product_id,
            sku: item.sku || 'REORDER',
            title: item.title,
            unit_of_measure: item.unit_of_measure || 'Unit',
            quantity: qty,
            unit_price_inr: price,
            total_price_inr: qty * price,
            estimated_weight_kg: weight,
            item_key: itemKey
          });
        }
      }
      return merged;
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (idOrKey: string) => {
    setItems((prev) =>
      prev.filter((item) => {
        const itemIdentifier = item.item_key || item.product_id;
        if (itemIdentifier === idOrKey) return false;
        if (!item.item_key && item.product_id === idOrKey) return false;
        return true;
      })
    );
  };

  const updateQuantity = (idOrKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(idOrKey);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        const itemIdentifier = item.item_key || item.product_id;
        const isMatch = itemIdentifier === idOrKey || (!item.item_key && item.product_id === idOrKey);
        if (isMatch) {
          const unitWeight = item.estimated_weight_kg && item.quantity > 0 ? item.estimated_weight_kg / item.quantity : 1;
          return {
            ...item,
            quantity,
            total_price_inr: quantity * item.unit_price_inr,
            estimated_weight_kg: unitWeight * quantity
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.total_price_inr, 0);
  const freeShippingThreshold = 0; // 100% Free Shipping on all orders
  const isFreeShipping = true;
  const deliveryFee = 0; // ₹0 Free Doorstep Delivery on ALL orders
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        reorderItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        itemCount,
        subtotal,
        freeShippingThreshold,
        isFreeShipping,
        deliveryFee,
        total,
        pincode,
        setPincode,
        pincodeServiceable,
        setPincodeServiceable
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
