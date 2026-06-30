import React from 'react';
import { WORKFLOW_STEPS } from '../../constants';

export default function Workflow() {
  return (
    <section id="how-it-works" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="glass inline-flex rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">How it works</div>
        <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold md:text-5xl">From Idea to Impact <br />in <span className="text-gradient-gold">3 Simple Steps</span></h2>

        <div className="relative mt-16">
          {/* glowing curved connector */}
          <svg className="absolute inset-x-0 top-12 hidden h-32 w-full md:block" viewBox="0 0 1200 120" fill="none" preserveAspectRatio="none">
            <path d="M120 60 C 360 -20, 500 140, 600 60 S 900 -20, 1080 60" stroke="url(#conn)" strokeWidth="2.5" className="animate-flow" />
            <defs>
              <linearGradient id="conn" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#F5D77A" />
              </linearGradient>
            </defs>
          </svg>

          <div className="grid gap-6 md:grid-cols-3">
            {WORKFLOW_STEPS.map((s, i) => (
              <div key={s.n} className="glass-strong group relative overflow-hidden rounded-3xl p-7 transition hover:-translate-y-1 hover:glow-gold">
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F5D77A] text-[#111114] shadow-[0_10px_30px_-10px_rgba(212,175,55,0.6)]">
                    {s.i}
                  </div>
                  <span className="font-display text-4xl font-bold text-white/10">{s.n}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                {i < 2 && (
                  <div className="absolute -right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 rotate-45 rounded-lg bg-gradient-to-br from-[#D4AF37]/30 to-transparent md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
