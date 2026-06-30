import React from 'react';

export default function Wave({ flip = false }) {
  return (
    <div className={`pointer-events-none ${flip ? "rotate-180" : ""}`}>
      <svg viewBox="0 0 1440 100" className="w-full" preserveAspectRatio="none">
        <path d="M0,40 C320,100 720,0 1080,50 C1280,80 1380,60 1440,40 L1440,100 L0,100 Z" fill="url(#wave-grad)" opacity="0.15" />
        <defs>
          <linearGradient id="wave-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#F5D77A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
