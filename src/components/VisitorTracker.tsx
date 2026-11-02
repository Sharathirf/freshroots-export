'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isExcludedVisitor } from '@/lib/analytics-exclusions';

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const currentPath = pathname || window.location.pathname || '/';

      // 1. Never track any admin or internal route
      if (currentPath.startsWith('/admin') || currentPath.startsWith('/api')) {
        try {
          localStorage.setItem('freshroots_admin_device', 'true');
          document.cookie = 'freshroots_admin_device=true; path=/; max-age=31536000; SameSite=Lax';
        } catch {}
        return;
      }

      // 2. Never track if this device is flagged as an admin device
      const isAdminDevice =
        localStorage.getItem('freshroots_admin_device') === 'true' ||
        document.cookie.includes('freshroots_admin_device=true') ||
        document.cookie.includes('freshroots_admin_token') ||
        document.cookie.includes('freshroots_admin_session') ||
        document.cookie.includes('admin_session');

      if (isAdminDevice) {
        return;
      }

      let visitorId = localStorage.getItem('freshroots_visitor_id');
      if (!visitorId) {
        visitorId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('freshroots_visitor_id', visitorId);
      }

      if (isExcludedVisitor(visitorId)) {
        return;
      }

      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: visitorId,
          path: currentPath,
          referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
        }),
      }).catch(() => undefined);
    } catch {}
  }, [pathname]);

  return null;
}
