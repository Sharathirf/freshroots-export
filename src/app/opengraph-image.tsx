import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'FreshRoots Export | Direct-From-Farm Produce & Agro Commodities';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              fontSize: '40px',
              fontWeight: 900,
              letterSpacing: '-1px',
              color: '#a7f3d0',
            }}
          >
            FreshRoots Export
          </div>
          <div
            style={{
              background: '#047857',
              color: '#d1fae5',
              padding: '6px 16px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            Direct From Farm
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: '54px',
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#ffffff',
              maxWidth: '960px',
            }}
          >
            GI Tiptur Ball Copra, Mature Coconuts &amp; Cold-Pressed Oils
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#a7f3d0',
              fontWeight: 500,
              maxWidth: '900px',
            }}
          >
            Sourced directly from canal-irrigated farms across Mandya &amp; Tiptur, Karnataka. APEDA, FSSAI &amp; DGFT Certified.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '2px solid rgba(255,255,255,0.15)',
            paddingTop: '24px',
          }}
        >
          <div style={{ display: 'flex', gap: '24px', fontSize: '20px', color: '#6ee7b7', fontWeight: 600 }}>
            <span>Free Doorstep Delivery</span>
            <span>•</span>
            <span>Daily APMC Mandi Rates</span>
            <span>•</span>
            <span>FCL Global Export</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#34d399' }}>
            freshrootsexport.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
