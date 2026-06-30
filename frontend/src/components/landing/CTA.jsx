import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Instagram, Facebook, Globe, Send } from 'lucide-react';
import { LogoMark } from '../common/Logo';
import { TESTIMONIALS } from '../../constants';

export default function CTA() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="glass-strong relative overflow-hidden rounded-[36px] p-10 md:p-16">
          <div className="absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-[#D4AF37]/40 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#F5D77A]/40 blur-[120px]" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="font-display text-4xl font-bold leading-tight md:text-6xl">Ready to grow your <br /><span className="text-gradient">local business?</span></h2>
              <p className="mt-4 max-w-lg text-muted-foreground">Join 2,500+ businesses already growing with the power of AI — built right here for India.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register" className="btn-cta inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-semibold">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
                <button className="glass rounded-2xl px-6 py-4 text-base font-medium hover:bg-white/10">Talk to sales</button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">No credit card · 7-day free trial</p>
            </div>

            {/* orbit illustration */}
            <div className="relative mx-auto aspect-square w-full max-w-sm">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-8 rounded-full border border-white/10" />
              <div className="absolute inset-16 rounded-full border border-white/10" />
              <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl bg-gradient-to-br from-[#D4AF37] to-[#F5D77A] shadow-[0_20px_60px_-10px_rgba(255,107,53,0.6)]">
                <LogoMark className="h-12 w-12 text-[#111114]" />
              </div>
              {[
                { i: <Instagram className="h-4 w-4" />, pos: "top-2 left-1/2 -translate-x-1/2" },
                { i: <Facebook className="h-4 w-4" />, pos: "right-2 top-1/2 -translate-y-1/2" },
                { i: <Globe className="h-4 w-4" />, pos: "bottom-2 left-1/2 -translate-x-1/2" },
                { i: <Send className="h-4 w-4" />, pos: "left-2 top-1/2 -translate-y-1/2" },
              ].map((x, i) => (
                <div key={i} className={`absolute ${x.pos} glass-strong grid h-12 w-12 animate-float place-items-center rounded-2xl`}>{x.i}</div>
              ))}
              {TESTIMONIALS.map((t, i) => (
                <img key={i} src={t.img} className={`absolute h-10 w-10 rounded-full object-cover ring-2 ring-white/20 ${["top-10 left-6", "top-12 right-6", "bottom-8 left-10", "bottom-10 right-8"][i]}`} alt="" loading="lazy" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
