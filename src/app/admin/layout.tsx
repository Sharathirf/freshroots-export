import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FreshRoots Operations Management',
  description: 'Internal operations management portal for FreshRoots Export.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
