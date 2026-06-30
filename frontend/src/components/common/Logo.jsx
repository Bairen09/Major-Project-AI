export function LogoMark({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id="lb-grad-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#F5D77A" />
        </linearGradient>
      </defs>
      {/* Abstract sleek monogram for L and B intersecting */}
      <path d="M12 8h4v24h-4z" fill="url(#lb-grad-gold)" />
      <path d="M12 32h16v-4H16v-8h10c3 0 6-2 6-6s-3-6-6-6H16v4h10c1 0 2 1 2 2s-1 2-2 2H16v6z" fill="url(#lb-grad-gold)" opacity="0.8" />
      {/* Spark/Accent */}
      <circle cx="32" cy="8" r="3" fill="#F5D77A" />
    </svg>
  );
}

export function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8 drop-shadow-[0_4px_12px_rgba(212,175,55,0.4)]" />
      <span className="font-display text-xl font-bold tracking-tight text-white">
        Local<span className="text-[#D4AF37]">Boost</span>
      </span>
    </div>
  );
}
