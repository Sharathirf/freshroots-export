import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FreshRoots Export | Farm-Gate Agricultural Commodities',
    short_name: 'FreshRoots Export',
    description: 'Direct farm-gate coconuts, GI Tiptur ball copra, spices, and pure cold-pressed oils from Karnataka.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b6d11',
    icons: [
      {
      src: '/pwa-192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/pwa-512.png',
      sizes: '512x512',
      type: 'image/png'
      }
    ]
  };
}
