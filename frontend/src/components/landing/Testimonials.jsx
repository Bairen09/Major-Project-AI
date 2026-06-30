import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Users } from 'lucide-react';
import { TESTIMONIALS } from '../../constants';

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  
  useEffect(() => { 
    const t = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 5000); 
    return () => clearInterval(t); 
  }, []);

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <div className="glass inline-flex rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">Loved by local businesses</div>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Real Stories. Real <span className="text-gradient">Growth.</span></h2>
        </div>

        <div className="mt-12 overflow-hidden">
          <div className="flex gap-6 transition-transform duration-700 ease-out" style={{ transform: `translateX(calc(-${idx * 100}% / 3))` }}>
            {[...TESTIMONIALS, ...TESTIMONIALS].map((it, i) => (
              <div key={i} className="glass-strong w-full flex-shrink-0 rounded-3xl p-6 md:w-[calc(100%/3-1rem)]">
                <div className="flex items-center gap-4">
                  <img src={it.img} alt={it.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-[#D4AF37]/40" loading="lazy" />
                  <div>
                    <div className="font-semibold">{it.name}</div>
                    <div className="text-xs text-muted-foreground">{it.biz}</div>
                    <div className="mt-1 flex">{[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />)}</div>
                  </div>
                </div>
                <p className="mt-5 text-base leading-relaxed text-white/90">"{it.quote}"</p>
                <div className="mt-5 flex items-center gap-4 border-t border-white/5 pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3 text-[#2E8B57]" /> +{180 + i * 40}% reach</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3 text-[#D4AF37]" /> {(i + 1) * 1200} new followers</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} aria-label={`slide ${i + 1}`} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A]" : "w-4 bg-white/15"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
