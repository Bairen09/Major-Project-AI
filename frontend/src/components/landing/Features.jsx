import React from 'react';
import { FEATURES } from '../../constants';

export default function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <div>
            <div className="glass inline-flex rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">Powerful AI Features</div>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">Everything you need <br />to <span className="text-gradient">grow smarter</span></h2>
          </div>
          <p className="text-muted-foreground">LocalBoost AI gives you the tools to create, schedule, and analyse content that drives real results — purpose-built for India's local economy.</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="glass-strong group relative overflow-hidden rounded-2xl p-6 transition hover:-translate-y-1">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#D4AF37]/0 blur-3xl transition group-hover:bg-[#D4AF37]/30" />
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#D4AF37]/30 to-[#F5D77A]/20 text-[#F5D77A] [&>svg]:h-5 [&>svg]:w-5">
                {f.i}
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
