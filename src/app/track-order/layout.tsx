import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Track Consignment Order | FreshRoots Export',
  description: 'Track real-time shipment status, dispatch details, and LR numbers for your farm-direct agricultural orders.',
  alternates: {
    canonical: `${getSiteUrl()}/track-order`,
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
