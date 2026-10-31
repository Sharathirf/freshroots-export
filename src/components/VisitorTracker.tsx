'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      let visitorId = localStorage.getItem('freshroots_visitor_id');
      if (!visitorId) {
        visitorId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('freshroots_visitor_id', visitorId);
      }

      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: visitorId,
          path: pathname || window.location.pathname || '/',
          referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
        }),
      }).catch(() => undefined);
    } catch {}
  }, [pathname]);

  return null;
}
