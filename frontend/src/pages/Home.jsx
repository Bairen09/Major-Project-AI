import React from 'react';
import Hero from '../components/landing/Hero';
import TrustedBy from '../components/landing/TrustedBy';
import Wave from '../components/landing/Wave';
import Workflow from '../components/landing/Workflow';
import Solutions from '../components/landing/Solutions';
import Features from '../components/landing/Features';
import DashboardShowcase from '../components/landing/DashboardShowcase';
import BusinessGallery from '../components/landing/BusinessGallery';
import Testimonials from '../components/landing/Testimonials';
import Comparison from '../components/landing/Comparison';
import Pricing from '../components/landing/Pricing';
import FAQ from '../components/landing/FAQ';
import CTA from '../components/landing/CTA';

/* ─────────────────── BACKGROUND DECOR ─────────────────── */
function BgDecor() {
  const particles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: `${Math.random() * 5}s`,
    duration: `${Math.random() * 10 + 15}s`
  }));

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Animated Gradient Mesh */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen animate-gradient bg-[radial-gradient(ellipse_at_top_left,rgba(212,175,55,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(245,215,122,0.08),transparent_50%),radial-gradient(ellipse_at_center,rgba(46,139,87,0.03),transparent_40%)]" />
      
      {/* Floating Golden Particles */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-[#F5D77A] blur-[1px] animate-float-slow"
            style={{
              top: p.top, left: p.left, width: p.size, height: p.size,
              opacity: Math.random() * 0.5 + 0.1,
              animationDelay: p.delay, animationDuration: p.duration
            }}
          />
        ))}
      </div>
      
      {/* Core Glowing Orbs */}
      <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-[#D4AF37] opacity-[0.08] blur-[140px] animate-pulse-glow" />
      <div className="absolute top-[20%] -right-40 h-[600px] w-[600px] rounded-full bg-[#F5D77A] opacity-[0.05] blur-[160px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-0 right-[10%] h-[420px] w-[420px] rounded-full bg-[#D4AF37] opacity-[0.05] blur-[140px] animate-pulse-glow" style={{ animationDelay: "4s" }} />
      <div className="absolute inset-0 noise opacity-50" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <BgDecor />
      <Hero />
      <TrustedBy />
      <Wave />
      <Workflow />
      <Solutions />
      <Features />
      <DashboardShowcase />
      <BusinessGallery />
      <Testimonials />
      <Comparison />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  );
}
