import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Cog, Rocket } from 'lucide-react';
import AppleCarousel from '../components/common/AppleCarousel';
import { FeatureAIContent, FeatureScheduling, HeroLaptop } from '../assets/images';

export default function HowItWorks() {
  const steps = [
    {
      icon: <UserPlus className="h-6 w-6" />,
      title: "1. Connect Your Profiles",
      description: "Link your Instagram, Facebook, and Google Business profiles securely in just a few clicks."
    },
    {
      icon: <Cog className="h-6 w-6" />,
      title: "2. Define Your Brand",
      description: "Tell us about your business, your target audience, and your preferred tone of voice."
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "3. Generate & Grow",
      description: "Our AI generates localized content. Review, edit if needed, and schedule it out."
    }
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
            How It <span className="text-gradient">Works</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            From sign-up to your first viral post in under 5 minutes.
          </p>
        </div>
      </div>

      {/* Hero Image Slider */}
      <div className="w-full mx-auto px-4 -mt-8 relative z-20 mb-24 max-w-[100vw] overflow-hidden">
        <AppleCarousel images={[FeatureAIContent, FeatureScheduling, HeroLaptop]} />
      </div>

      {/* Steps */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="glass p-8 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-9xl font-bold text-white/5 pointer-events-none group-hover:text-[#D4AF37]/5 transition-colors">
                {idx + 1}
              </div>
              <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] relative z-10">
                {step.icon}
              </div>
              <div className="relative z-10">
                <h3 className="font-display text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/60">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
