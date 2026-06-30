import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Coffee, Stethoscope, ShoppingBag, Scissors } from 'lucide-react';
import AppleCarousel from '../components/common/AppleCarousel';
import { SolutionRestaurant, SolutionHealthcare, SolutionRetail } from '../assets/images';

export default function Solutions() {
  const industries = [
    { name: "Restaurants & Cafes", icon: <Coffee className="h-6 w-6" />, desc: "Promote daily specials, events, and reviews seamlessly." },
    { name: "Healthcare Clinics", icon: <Stethoscope className="h-6 w-6" />, desc: "Build trust with educational content and professional updates." },
    { name: "Retail Stores", icon: <ShoppingBag className="h-6 w-6" />, desc: "Showcase new inventory, sales, and seasonal collections." },
    { name: "Salons & Spas", icon: <Scissors className="h-6 w-6" />, desc: "Share before/after photos and highlight your services." }
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
            Tailored <span className="text-gradient">Solutions</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Our AI adapts to your specific industry to generate content that resonates with your customers.
          </p>
        </div>
      </div>

      {/* Hero Image Slider */}
      <div className="w-full mx-auto px-4 -mt-8 relative z-20 mb-24 max-w-[100vw] overflow-hidden">
        <AppleCarousel images={[SolutionRestaurant, SolutionHealthcare, SolutionRetail]} />
      </div>

      {/* Industry Cards */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {industries.map((ind, idx) => (
          <div key={idx} className="glass p-8 rounded-3xl border border-white/5 flex items-start gap-6 hover:bg-white/5 transition-colors cursor-default">
            <div className="h-14 w-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
              {ind.icon}
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-white mb-2">{ind.name}</h3>
              <p className="text-white/60">{ind.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
