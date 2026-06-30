export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gold-grad-1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5D77A" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#E6C76E" />
        </linearGradient>
        <linearGradient id="gold-grad-2" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FFE89A" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#E6C76E" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer elegant diamond/box */}
      <rect x="5" y="5" width="30" height="30" rx="6" stroke="url(#gold-grad-1)" strokeWidth="1.5" />
      <rect x="7" y="7" width="26" height="26" rx="4" stroke="url(#gold-grad-2)" strokeWidth="0.5" opacity="0.6" />
      
      {/* Monogram L B abstract shapes */}
      {/* Abstract 'L' */}
      <path d="M12 12V26C12 27.1 12.9 28 14 28H20" stroke="url(#gold-grad-1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Abstract 'B' constructed from geometric shapes */}
      <path d="M18 12H23C25.21 12 27 13.79 27 16C27 17.5 26 18.8 24.7 19.5C26.5 20.3 28 22 28 24C28 26.21 26.21 28 24 28H18" stroke="url(#gold-grad-2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 20H24" stroke="url(#gold-grad-2)" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Subtle central sparkle/highlight */}
      <circle cx="28" cy="12" r="1.5" fill="#FFE89A" filter="url(#glow)" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoMark className="h-9 w-9 drop-shadow-[0_4px_20px_rgba(212,175,55,0.4)]" />
      <span className="font-display text-xl font-bold tracking-tight">
        LocalBoost <span className="text-gradient-gold">AI</span>
      </span>
    </div>
  );
}
