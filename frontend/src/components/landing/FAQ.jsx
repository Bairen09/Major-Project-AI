import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { FAQ_ITEMS } from '../../constants';

export default function FAQ() {
  const [open, setOpen] = useState(0);
  
  return (
    <section className="relative py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <div className="glass inline-flex rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">FAQ</div>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">Questions, <span className="text-gradient">answered.</span></h2>
          <p className="mt-3 text-muted-foreground">Can't find what you're looking for? Reach our team — we usually reply within an hour.</p>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((it, i) => (
            <div key={i} className="glass-strong rounded-2xl">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                <span className="font-medium">{it.q}</span>
                <span className={`grid h-8 w-8 place-items-center rounded-full bg-white/5 transition ${open === i ? "rotate-180 bg-gradient-to-br from-[#D4AF37] to-[#F5D77A] text-black" : "text-[#D4AF37]"}`}>
                  {open === i ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
              <div className={`grid overflow-hidden transition-all duration-300 ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-muted-foreground">{it.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
