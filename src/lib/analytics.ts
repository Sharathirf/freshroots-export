import posthog from 'posthog-js';
import { isExcludedVisitor } from './analytics-exclusions';

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

let posthogInitialized = false;

function ensurePostHog(): boolean {
  if (typeof window === 'undefined') return false;
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token) return false;

  if (!posthogInitialized) {
    posthog.init(token, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      respect_dnt: true,
      person_profiles: 'identified_only',
    });
    posthogInitialized = true;
  }
  return true;
}

/** Check if the current browser session belongs to an internal admin */
function isAdminDevice(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const path = window.location.pathname || '';
    if (path.startsWith('/admin') || path.startsWith('/api')) return true;
    if (localStorage.getItem('freshroots_admin_device') === 'true') return true;
    if (document.cookie.includes('freshroots_admin_device=true') || document.cookie.includes('admin_session') || document.cookie.includes('freshroots_admin_token')) return true;
    const visitorId = localStorage.getItem('freshroots_visitor_id');
    if (isExcludedVisitor(visitorId)) return true;
  } catch {}
  return false;
}

/**
 * Universal Funnel & User Action Tracker:
 * 1. Internal PostgreSQL Database (`site_events`) for Admin Analytics Dashboard
 * 2. Google Tag / Google Ads (`window.gtag`) for E-Commerce Conversions & ROAS
 * 3. PostHog (when API token configured)
 */
export function track(event: string, properties: AnalyticsProperties = {}) {
  if (typeof window === 'undefined') return;

  // Never track internal staff / admin devices
  if (isAdminDevice()) return;

  const currentPath = window.location.pathname || '/';
  let visitorId = '';
  try {
    visitorId = localStorage.getItem('freshroots_visitor_id') || '';
    if (!visitorId) {
      visitorId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('freshroots_visitor_id', visitorId);
    }
  } catch {}

  // 1. Send to internal database for Admin Dashboard funnel visualization
  try {
    const payload = JSON.stringify({
      event,
      properties,
      path: currentPath,
      visitor_id: visitorId,
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/events', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => undefined);
    }
  } catch {}

  // 2. Forward to Google Tag (gtag.js) for Google Analytics & Google Ads
  try {
    const win = window as any;
    if (typeof win.gtag === 'function') {
      if (event === 'add_to_cart') {
        win.gtag('event', 'add_to_cart', {
          currency: 'INR',
          value: properties.price || 0,
          items: [{
            item_id: properties.sku || properties.product_id,
            item_name: properties.title || properties.name,
            price: properties.price,
            quantity: properties.quantity || 1,
            item_category: properties.category
          }]
        });
      } else if (event === 'begin_checkout') {
        win.gtag('event', 'begin_checkout', {
          currency: 'INR',
          value: properties.value || properties.subtotal || 0,
          items_count: properties.item_count
        });
      } else if (event === 'purchase' || event === 'order_submitted') {
        win.gtag('event', 'purchase', {
          transaction_id: properties.order_id,
          currency: 'INR',
          value: properties.value || properties.amount,
        });
      } else if (event === 'rfq_submitted') {
        win.gtag('event', 'generate_lead', {
          event_category: 'B2B Wholesale Procurement RFQ',
          event_label: properties.product || properties.category,
          value: properties.quantity || 1
        });
      } else if (event === 'cart_viewed') {
        win.gtag('event', 'view_cart', {
          currency: 'INR',
          value: properties.subtotal,
          item_count: properties.item_count
        });
      } else {
        win.gtag('event', event, properties);
      }
    }
  } catch {}

  // 3. Forward to PostHog if configured
  if (ensurePostHog()) {
    try {
      posthog.capture(event, properties);
    } catch {}
  }
}

export function trackPageView(pathname: string) {
  track('$pageview', { path: pathname });
}
