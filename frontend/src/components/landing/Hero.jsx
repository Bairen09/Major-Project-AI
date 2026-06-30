import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Play, Check, ChevronLeft, ChevronRight, Instagram, Facebook, TrendingUp } from 'lucide-react';
import { HeroBusinessOwner01, HeroBusinessOwner02, HeroAnalytics, HeroLaptop } from '../../assets/images';

export default function Hero() {
  const heroImages = [
    { src: HeroBusinessOwner01, alt: "Indian local business owner using LocalBoost AI" },
    { src: HeroBusinessOwner02, alt: "Cafe owner using LocalBoost AI" },
    { src: HeroAnalytics, alt: "Boutique owner using LocalBoost AI" },
    { src: HeroLaptop, alt: "Gym owner using LocalBoost AI" }
  ];
  const [currentHero, setCurrentHero] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prevHero = () => setCurrentHero((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  const nextHero = () => setCurrentHero((prev) => (prev + 1) % heroImages.length);

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-8">
        <div className="animate-fade-up">
          <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
            #1 AI Marketing Platform for Local Businesses
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            AI That Creates.<br />
            You <span className="text-gradient-gold">Grow</span> <span className="text-gradient">Local.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Generate high-performing social media content, attract more customers, and grow your business — all in one powerful platform built for India.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/register" className="btn-cta group inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-semibold">
              Start Free Trial <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <button className="glass inline-flex items-center gap-2 rounded-2xl px-6 py-4 text-base font-medium transition hover:bg-white/10">
              <Play className="h-4 w-4 text-[#F5D77A]" /> Watch Demo
            </button>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["No Credit Card", "7-Day Free Trial", "Cancel Anytime"].map(t => (
              <span key={t} className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-[#2E8B57]" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="relative">
          <div className="absolute -inset-10 -z-10 rounded-[40px] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(212,175,55,0.25),transparent_70%)]" />
          <div className="glass-strong relative overflow-hidden rounded-[28px] p-2 shadow-[0_40px_120px_-20px_rgba(212,175,55,0.35)] group">
            <div className="relative h-[460px] w-full overflow-hidden rounded-[22px] md:h-[560px]">
              {heroImages.map((img, i) => (
                <img
                  key={i}
                  src={img.src}
                  alt={img.alt}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === currentHero ? "opacity-100" : "opacity-0"}`}
                  width={1024}
                  height={1280}
                />
              ))}
              {/* Slider Controls */}
              <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={prevHero} className="glass grid h-10 w-10 place-items-center rounded-full hover:bg-white/20">
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button onClick={nextHero} className="glass grid h-10 w-10 place-items-center rounded-full hover:bg-white/20">
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </div>
              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {heroImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentHero(i)}
                    className={`h-2 rounded-full transition-all ${i === currentHero ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`}
                  />
                ))}
              </div>
            </div>

            {/* Floating AI generated post card */}
            <div className="absolute left-6 top-12 w-[260px] animate-float">
              <div className="glass-strong rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> AI Generated Post
                </div>
                <p className="mt-2 text-sm leading-snug">Fresh ingredients, authentic taste! Visit us today and enjoy 20% OFF on all orders.</p>
                <p className="mt-1 text-xs text-[#D4AF37]">#LocalEats #GoodFood</p>
                <div className="mt-3 flex items-center justify-between">
                  <button className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px]">Schedule Post</button>
                  <div className="flex gap-1.5">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-[#D4AF37] to-[#F5D77A]"><Instagram className="h-3 w-3 text-white" /></span>
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-white/10"><Facebook className="h-3 w-3 text-white" /></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform stack */}
            <div className="absolute right-4 top-12 flex w-[210px] flex-col gap-2 animate-float-slow">
              {[
                { i: <Instagram className="h-4 w-4" />, n: "Instagram", c: "from-[#D4AF37] to-[#F5D77A]" },
                { i: <Facebook className="h-4 w-4" />, n: "Facebook", c: "from-white/10 to-transparent" },
                { i: <TrendingUp className="h-4 w-4" />, n: "Google Business", c: "from-white/10 to-transparent" },
              ].map(p => (
                <div key={p.n} className="glass-strong flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <span className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${p.c} text-white`}>{p.i}</span>
                  <div>
                    <div className="text-xs font-semibold">{p.n}</div>
                    <div className="text-[10px] text-[#2E8B57]">● Post ready</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating engagement chip */}
            <div className="absolute bottom-6 left-6 animate-float">
              <div className="glass-strong flex items-center gap-3 rounded-2xl px-4 py-3">
                <TrendingUp className="h-5 w-5 text-[#2E8B57]" />
                <div>
                  <div className="text-[10px] text-muted-foreground">Engagement</div>
                  <div className="text-sm font-bold text-[#2E8B57]">↑ 247%</div>
                </div>
              </div>
            </div>

            <button aria-label="Next" className="btn-cta absolute right-6 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
