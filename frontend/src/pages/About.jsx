import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Heart, Shield } from 'lucide-react';
import AppleCarousel from '../components/common/AppleCarousel';
import { AboutTeam, HeroBusinessOwner01, HeroBusinessOwner02 } from '../assets/images';

export default function About() {
  const values = [
    { title: "Empowering Local", icon: <Target className="h-6 w-6" />, desc: "We believe small businesses are the heartbeat of our communities." },
    { title: "Customer Obsessed", icon: <Heart className="h-6 w-6" />, desc: "Everything we build is designed to save you time and drive real results." },
    { title: "Trust & Transparency", icon: <Shield className="h-6 w-6" />, desc: "No hidden fees, no complicated contracts. Just value." }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] pb-24">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#1a1612] to-[#0A0A0B] pt-24 pb-16 px-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 text-lg font-medium text-white/70 hover:text-white transition-colors mb-10 group">
            <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
            Our <span className="text-gradient">Mission</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            We're building the future of local marketing, making enterprise-grade AI accessible to every small business.
          </p>
        </div>
      </div>

      {/* Hero Image Slider */}
      <div className="w-full mx-auto px-4 -mt-8 relative z-20 mb-24 max-w-[100vw] overflow-hidden">
        <AppleCarousel images={[AboutTeam, HeroBusinessOwner01, HeroBusinessOwner02]} />
      </div>

      {/* Values Section */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Our Core Values</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((val, idx) => (
            <div key={idx} className="glass p-8 rounded-3xl border border-white/5 text-center flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-6">
                {val.icon}
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">{val.title}</h3>
              <p className="text-white/60">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
