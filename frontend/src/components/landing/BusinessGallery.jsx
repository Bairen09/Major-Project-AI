import React from 'react';
import { ChevronLeft, ChevronRight, Heart, MessageCircle, TrendingUp } from 'lucide-react';
import { 
  SolutionRestaurant,
  SolutionHealthcare,
  SolutionRetail,
  AboutTeam
} from '../../assets/images';

export default function BusinessGallery() {
  const cards = [
    { src: SolutionRestaurant, name: "Bombay Bakery", category: "Bakery · Mumbai" },
    { src: SolutionHealthcare, name: "PetCare Clinic", category: "Healthcare · Delhi" },
    { src: SolutionRetail, name: "Mitti Heritage", category: "Retail · Jaipur" },
    { src: AboutTeam, name: "Wellness Yoga", category: "Yoga Studio · Bengaluru" },
  ];

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="glass inline-flex rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">Real Indian businesses</div>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Loved by every kind of <span className="text-gradient">local hero</span></h2>
          </div>
          <div className="hidden gap-2 md:flex">
            <button className="glass grid h-10 w-10 place-items-center rounded-xl hover:bg-white/10"><ChevronLeft className="h-4 w-4" /></button>
            <button className="glass grid h-10 w-10 place-items-center rounded-xl hover:bg-white/10"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
          {cards.map((c, i) => (
            <article key={i} className="group glass-strong relative w-[300px] flex-shrink-0 snap-start overflow-hidden rounded-3xl md:w-[360px]">
              <div className="relative h-[380px] overflow-hidden">
                <img src={c.src} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1C] via-[#0F0A1C]/40 to-transparent" />
                <div className="absolute left-4 top-4 glass rounded-full px-3 py-1 text-[10px] uppercase tracking-wider">{c.category}</div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display text-xl font-semibold">{c.name}</h3>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3 text-[#F5D77A]" /> 12.4K</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" /> 1.2K</span>
                  <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3 text-[#2E8B57]" /> +{(i + 2) * 80}%</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
