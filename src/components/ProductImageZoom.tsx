'use client';

import React, { useState } from 'react';

interface ProductImageZoomProps {
  src: string;
  alt: string;
  gradeBadge?: string;
  additionalImages?: string[];
}

export default function ProductImageZoom({ src, alt, gradeBadge, additionalImages = [] }: ProductImageZoomProps) {
  const [activeImage, setActiveImage] = useState<string>(src);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });

  const allImages = Array.from(new Set([src, ...additionalImages].filter(Boolean)));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      display: 'block',
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  return (
    <div className="space-y-3">
      {/* Main Zoom Container */}
      <div
        className="relative aspect-square w-full rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 cursor-crosshair select-none group shadow-sm"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Base Image */}
        <img
          src={activeImage}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-200"
          style={zoomStyle.display === 'block' ? zoomStyle : undefined}
        />

        {/* Grade Badge */}
        {gradeBadge && (
          <span className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm text-stone-900 text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-sm border border-stone-100">
            {gradeBadge}
          </span>
        )}

        {/* Hover hint */}
        <div className="absolute bottom-3 right-3 z-10 bg-stone-950/70 text-white text-[11px] font-medium px-2.5 py-1 rounded-md backdrop-blur-sm opacity-90 group-hover:opacity-0 transition pointer-events-none">
          Hover to zoom
        </div>
      </div>

      {/* Thumbnails row if multiple images exist */}
      {allImages.length > 1 && (
        <div className="flex gap-2.5 pt-1 overflow-x-auto">
          {allImages.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImage(imgUrl)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                activeImage === imgUrl ? 'border-[#3b6d11] ring-2 ring-lime-400/40 shadow-sm' : 'border-stone-200 hover:border-stone-400 opacity-75 hover:opacity-100'
              }`}
            >
              <img src={imgUrl} alt={`${alt} view ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
