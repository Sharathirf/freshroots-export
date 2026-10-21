'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem } from '@/types';

interface CartContextType {
  items: OrderItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  itemCount: number;
  subtotal: number;
  freeShippingThreshold: number;
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

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tiptur_direct_cart');
      if (saved) {
        setItems(JSON.parse(saved));
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

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total_price_inr: (item.quantity + quantity) * item.unit_price_inr,
                estimated_weight_kg: Number(product.estimated_weight_kg || 0) * (item.quantity + quantity)
              }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          sku: product.sku,
          title: product.title,
          unit_of_measure: product.unit_of_measure,
          quantity,
          unit_price_inr: Number(product.retail_price_inr),
          total_price_inr: quantity * Number(product.retail_price_inr),
          estimated_weight_kg: Number(product.estimated_weight_kg || 0) * quantity
        }
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              quantity,
              total_price_inr: quantity * item.unit_price_inr
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.total_price_inr, 0);
  const freeShippingThreshold = 1500;
  const deliveryFee = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : 99;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        itemCount,
        subtotal,
        freeShippingThreshold,
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
