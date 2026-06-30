import React from 'react';
import { Check, X } from 'lucide-react';
import { LogoMark } from '../common/Logo';
import { COMPARISON_ROWS } from '../../constants';

export default function Comparison() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-4xl font-bold md:text-5xl">Why local businesses pick <br /><span className="text-gradient">LocalBoost AI</span></h2>
        <div className="glass-strong mt-12 overflow-hidden rounded-3xl">
          <div className="grid grid-cols-3 border-b border-white/10 text-sm">
            <div className="p-5 text-muted-foreground">Compare</div>
            <div className="border-l border-white/10 bg-gradient-to-b from-[#D4AF37]/15 to-transparent p-5">
              <div className="flex items-center gap-2 font-semibold"><LogoMark className="h-5 w-5" /> LocalBoost AI</div>
            </div>
            <div className="border-l border-white/10 p-5 font-semibold text-muted-foreground">Doing it manually</div>
          </div>
          {COMPARISON_ROWS.map((r, i) => (
            <div key={i} className={`grid grid-cols-3 text-sm ${i % 2 ? "bg-white/[0.02]" : ""}`}>
              <div className="p-5 text-muted-foreground">{r[0]}</div>
              <div className="flex items-center gap-2 border-l border-white/10 p-5 font-medium"><Check className="h-4 w-4 text-[#2E8B57]" /> {r[1]}</div>
              <div className="flex items-center gap-2 border-l border-white/10 p-5 text-muted-foreground"><X className="h-4 w-4 text-white/30" /> {r[2]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
