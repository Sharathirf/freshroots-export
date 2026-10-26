'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

export interface RecentOrderItem {
  product_id?: string;
  sku?: string;
  title: string;
  unit_of_measure?: string;
  quantity?: number;
  unit_price_inr?: number;
  image_url?: string;
}

export interface ActiveOrderToast {
  order_number: string;
  date: string;
  total: number;
  status: string;
  items_count?: number;
  first_item_title?: string;
  image_url?: string;
  items?: RecentOrderItem[];
  tracking_reference?: string;
}

function resolveProductImage(sku?: string): string {
  if (!sku) return 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=400&q=80';
  if (sku.includes('ARE')) return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80';
  if (sku.includes('COC-SEMI') || sku.includes('COC-MAT')) return 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=400&q=80';
  if (sku.includes('COP') || sku.includes('BAL')) return '/products/tiptur-ball-copra.jpg';
  if (sku.includes('NUR-COC')) return '/products/coconut-plants-saplings.jpg';
  if (sku.includes('OIL') || sku.includes('GNT')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80';
  if (sku.includes('MIL') || sku.includes('RAG')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80';
  if (sku.includes('GHE') || sku.includes('COW') || sku.includes('DAI')) return 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=400&q=80';
  if (sku.includes('TND')) return 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=400&q=80';
  if (sku.includes('GIN')) return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80';
  if (sku.includes('SHL')) return '/products/coconut-shells-pile.jpg';
  return 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=400&q=80';
}

export default function ActiveOrderBanner() {
  const { lang } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<ActiveOrderToast[]>([]);
  const [dismissed, setDismissed] = useState(false);

  const loadOrders = () => {
    try {
      const recentRaw = localStorage.getItem('agri_recent_orders');
      let orderList: ActiveOrderToast[] = [];

      if (recentRaw) {
        const parsed = JSON.parse(recentRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          orderList = parsed;
        }
      }

      if (orderList.length === 0) {
        const singleRaw = localStorage.getItem('agri_latest_order');
        if (singleRaw) {
          const single = JSON.parse(singleRaw);
          if (single?.order_number) {
            orderList = [single];
          }
        }
      }

      // Filter to orders placed within last 14 days
      const now = Date.now();
      const validOrders = orderList.filter((ord) => {
        const orderDate = new Date(ord.date).getTime();
        return !isNaN(orderDate) && now - orderDate < 14 * 24 * 60 * 60 * 1000;
      });

      // Ensure every order has an image_url
      const enrichedOrders = validOrders.map((ord) => {
        const firstSku = ord.items?.[0]?.sku;
        const img = ord.image_url || resolveProductImage(firstSku);
        return { ...ord, image_url: img };
      });

      setOrders(enrichedOrders);
    } catch (e) {
      console.warn('Failed to parse active orders:', e);
    }
  };

  useEffect(() => {
    loadOrders();

    const handleNewOrder = () => {
      setDismissed(false);
      loadOrders();
    };

    window.addEventListener('agri_order_placed', handleNewOrder);
    window.addEventListener('storage', handleNewOrder);
    return () => {
      window.removeEventListener('agri_order_placed', handleNewOrder);
      window.removeEventListener('storage', handleNewOrder);
    };
  }, []);

  if (orders.length === 0 || dismissed) return null;

  const isKannada = lang === 'kn';

  // Gather unique recently ordered items for the shelf
  const recentItemsMap = new Map<string, RecentOrderItem>();
  orders.forEach((ord) => {
    if (ord.items && Array.isArray(ord.items)) {
      ord.items.forEach((it) => {
        const key = it.sku || it.title;
        if (!recentItemsMap.has(key)) {
          recentItemsMap.set(key, {
            ...it,
            image_url: it.image_url || resolveProductImage(it.sku)
          });
        }
      });
    } else if (ord.first_item_title) {
      const key = ord.first_item_title;
      if (!recentItemsMap.has(key)) {
        recentItemsMap.set(key, {
          title: ord.first_item_title,
          image_url: ord.image_url || resolveProductImage()
        });
      }
    }
  });

  const recentProductsList = Array.from(recentItemsMap.values());

  const handleBuyAgain = (item: RecentOrderItem) => {
    const dummyProduct: Product = {
      id: item.product_id || 'reorder-item',
      sku: item.sku || 'REORDER-SKU',
      title: item.title,
      slug: (item.sku || item.title).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: 'value_added',
      grade: 'Farm Fresh Standard',
      origin: 'Karnataka, India',
      unit_of_measure: item.unit_of_measure || 'Unit',
      estimated_weight_kg: 1,
      moisture_percentage: null,
      oil_percentage: null,
      retail_price_inr: item.unit_price_inr || 75,
      bulk_min_quantity: 1,
      wholesale_benchmark_price_inr: item.unit_price_inr || 75,
      hsn_code: '080112',
      tax_rate_percentage: 0,
      description: item.title,
      specifications: { delivery: '100% Free Doorstep Delivery' },
      image_url: item.image_url || resolveProductImage(item.sku),
      is_active: true
    };

    addToCart(dummyProduct, 1);
  };

  return (
    <section className="w-full bg-white select-none">
      {/* 1. SKY-BLUE HORIZONTAL TRACK ORDER TOAST STRIP (Matches BigHaat UX) */}
      <div className="w-full bg-[#cde4fd] border-y border-[#b5d7f8] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 sm:py-2.5">
            {/* Scrollable horizontal cards */}
            <div className="flex items-center gap-0 overflow-x-auto scrollbar-none divide-x divide-blue-300/70 py-0.5 flex-1 pr-2">
              {orders.map((ord) => (
                <div
                  key={ord.order_number}
                  className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 shrink-0 min-w-[280px] sm:min-w-[340px]"
                >
                  {/* Square White Box with Product Image */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-md p-1 border border-blue-200/90 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={ord.image_url || resolveProductImage()}
                      alt={ord.first_item_title || ord.order_number}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Order ID & Brief Title */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="text-xs sm:text-sm font-black text-stone-900 tracking-tight truncate">
                      {isKannada ? 'ಆರ್ಡರ್ ಐಡಿ:' : 'Order ID:'}
                      <span className="font-mono">#{ord.order_number}</span>
                    </div>
                    {ord.first_item_title && (
                      <div className="text-[11px] text-stone-700 truncate font-medium">
                        {ord.first_item_title}
                        {ord.items_count && ord.items_count > 1 ? ` (+${ord.items_count - 1})` : ''}
                      </div>
                    )}
                  </div>

                  {/* Track Order Pill Button */}
                  <Link
                    href={`/track-order?query=${encodeURIComponent(ord.order_number)}`}
                    className="border border-stone-800 text-stone-900 bg-white/70 hover:bg-stone-900 hover:text-white px-3 sm:px-3.5 py-1.5 rounded-md text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1 active:scale-95"
                  >
                    <span>{isKannada ? 'ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track Order'}</span>
                  </Link>
                </div>
              ))}
            </div>

            {/* Dismiss Strip Button */}
            <button
              onClick={() => setDismissed(true)}
              className="text-stone-500 hover:text-stone-900 p-1.5 rounded-lg hover:bg-blue-200/50 transition shrink-0 ml-2"
              title={isKannada ? 'ಮುಚ್ಚಿ' : 'Dismiss'}
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. RECENTLY ORDERED SECTION (Matches BigHaat UX) */}
      {recentProductsList.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
          {/* Green Pill Badge */}
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-emerald-600 bg-emerald-50 text-emerald-800 text-xs font-extrabold shadow-xs">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isKannada ? 'ಇತ್ತೀಚೆಗೆ ಆರ್ಡರ್ ಮಾಡಿದ್ದು' : 'Recently Ordered'}</span>
            </span>
          </div>

          {/* Horizontal Row of Product Cards */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-2 pt-1">
            {recentProductsList.map((prod, idx) => (
              <div
                key={`${prod.title}-${idx}`}
                className="bg-white rounded-xl border border-stone-200 p-3 shadow-xs hover:shadow-md transition text-center w-36 sm:w-44 shrink-0 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-lg bg-stone-50 p-1 mb-2 flex items-center justify-center overflow-hidden border border-stone-100 group-hover:scale-105 transition-transform">
                    <img
                      src={prod.image_url || resolveProductImage(prod.sku)}
                      alt={prod.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="text-[11px] sm:text-xs font-bold text-stone-800 line-clamp-2 leading-tight uppercase mb-1">
                    {prod.title}
                  </h4>
                </div>

                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
                  {prod.unit_price_inr ? (
                    <span className="text-xs font-black text-[#1c3809]">
                      ₹{prod.unit_price_inr}
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-bold">100% Free Del.</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleBuyAgain(prod)}
                    className="text-[10px] font-extrabold bg-[#edf7e1] text-[#2d5a0b] hover:bg-[#2d5a0b] hover:text-white px-2 py-1 rounded transition border border-[#3b6d11]/30 active:scale-95"
                  >
                    {isKannada ? 'ಮತ್ತೆ ಖರೀದಿಸಿ' : 'Buy Again'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
