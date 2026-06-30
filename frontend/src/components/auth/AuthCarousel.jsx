import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { LogoMark } from '../common/Logo';
import { TESTIMONIALS } from '../../constants';

// Safely import images and fallback
import {
  AuthSlider01, AuthSlider02, AuthSlider03, AuthSlider04, AuthSlider05, AuthSlider06,
  HeroBusinessOwner01, HeroBusinessOwner02, HeroLaptop, HeroAnalytics, 
  SolutionRestaurant, SolutionRetail
} from '../../assets/images';

export default function AuthCarousel() {
  const allImages = [
    AuthSlider01, AuthSlider02, AuthSlider03, AuthSlider04, AuthSlider05, AuthSlider06,
    HeroBusinessOwner01, HeroBusinessOwner02, HeroLaptop, HeroAnalytics, 
    SolutionRestaurant, SolutionRetail
  ].filter(Boolean);

  const images = allImages.slice(0, 6);
  
  const messages = [
    "Grow your business with AI.",
    "Generate high-converting posts in seconds.",
    "Schedule once. Publish everywhere.",
    "Built for Indian local businesses.",
    "AI marketing without agencies."
  ];

  const [idx, setIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [images.length, isHovered]);

  const testIndex = idx % TESTIMONIALS.length;

  return (
    <div 
      className="relative hidden h-full w-full overflow-hidden lg:flex flex-col justify-between p-10 xl:p-14 z-0 bg-[#0A0A0B]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Images with pure CSS Ken Burns & Crossfade */}
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover -z-20 transition-all duration-1000 ease-in-out ${
            i === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
        />
      ))}

      {/* Dark Luxury Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/70 to-[#0A0A0B]/30 -z-10" />
      
      {/* Top section: Logo */}
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <LogoMark className="h-8 w-8" />
        <div>
          <div className="font-display text-lg font-bold text-white">LocalBoost AI</div>
          <div className="text-[10px] uppercase tracking-widest text-[#D4AF37]">AI-Powered Marketing</div>
        </div>
      </Link>

      {/* Center section: Text ONLY */}
      <div className="flex-1 flex flex-col justify-center max-w-xl">
        <div className="glass inline-flex self-start items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-[#F5D77A] uppercase tracking-wider mb-6">
          <Sparkles className="h-3.5 w-3.5" /> Trusted by 500+ Local Businesses
        </div>
        
        <div className="relative h-[100px] xl:h-[130px]">
           {messages.map((m, i) => (
             <h2
               key={i}
               className={`absolute inset-0 font-display text-4xl xl:text-5xl font-bold leading-tight text-white transition-all duration-700 ${
                 i === (idx % messages.length) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
               }`}
             >
               {m}
             </h2>
           ))}
        </div>

        <p className="mt-2 text-base xl:text-lg text-white/80">
          Sign in to your account and continue your journey with the smartest AI co-pilot.
        </p>
      </div>

      {/* Bottom section: Testimonial & Stats Strip */}
      <div className="flex items-end justify-between gap-6 pb-4">
        {/* Testimonial */}
        <div className="relative h-[160px] w-full max-w-[340px]">
          {TESTIMONIALS.map((testimonial, i) => (
            <div
              key={i}
              className={`absolute inset-0 glass-strong rounded-2xl p-5 transition-all duration-700 ${
                i === testIndex ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-4 pointer-events-none z-0'
              }`}
            >
              <div className="text-4xl text-[#D4AF37]/40 leading-none mb-2 font-serif">"</div>
              <p className="text-sm leading-relaxed text-white/90">
                {testimonial.quote}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img src={testimonial.img} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#D4AF37]/40" />
                <div>
                  <div className="text-sm font-semibold text-white">{testimonial.name}</div>
                  <div className="text-xs text-[#F5D77A]">{testimonial.biz}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Strip */}
        <div className="hidden xl:block">
          <div className="glass flex items-center gap-6 rounded-2xl px-6 py-4">
            <div className="text-center">
              <div className="font-display text-xl font-bold text-white">128K+</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Total Reach</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="font-display text-xl font-bold text-white">24.5K</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Engagement</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="font-display text-xl font-bold text-[#2E8B57]">98%</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-[#D4AF37]" : "w-1.5 bg-white/30 hover:bg-white/60"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
