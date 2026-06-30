import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PRICING_PLANS } from '../../constants';

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <div className="glass inline-flex rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">Pricing</div>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Plans that pay for themselves <br />in <span className="text-gradient">one new customer</span></h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PRICING_PLANS.map((p) => (
            <div key={p.name} className={`relative overflow-hidden rounded-3xl p-7 ${p.popular ? "glass-strong glow-gold scale-[1.02]" : "glass-strong"}`}>
              {p.popular && (
                <>
                  <div className="absolute inset-y-0 -left-[100%] w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine pointer-events-none" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] px-3 py-1 text-[10px] font-bold text-black uppercase tracking-wider">Most popular</div>
                </>
              )}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="font-display text-5xl font-bold">{p.price}</span>
                <span className="pb-2 text-sm text-muted-foreground">/ month</span>
              </div>
              <Link to="/register" className={`mt-6 block w-full rounded-xl py-3 text-center text-sm font-semibold transition ${p.popular ? "btn-cta" : "glass hover:bg-white/10"}`}>{p.cta}</Link>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map(f => <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2E8B57]" /> {f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
