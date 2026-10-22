import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sharath Inorahalli | Farm-Gate Agricultural Commodities',
    short_name: 'Sharath Agri',
    description: 'Direct farm-gate coconuts, GI Tiptur ball copra, spices, and pure cold-pressed oils from Karnataka.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b6d11',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      }
    ]
  };
}
