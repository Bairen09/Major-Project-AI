import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, BarChart, Calendar } from 'lucide-react';
import AppleCarousel from '../components/common/AppleCarousel';
import { HeroBusinessOwner01, FeatureAIContent, FeatureAnalytics, FeatureScheduling } from '../assets/images';

export default function Features() {
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
            Powerful Features for <br/><span className="text-gradient">Local Businesses</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Everything you need to automate your social media, engage with your audience, and grow your local presence.
          </p>
        </div>
      </div>

      {/* Hero Image Slider */}
      <div className="w-full mx-auto px-4 -mt-8 relative z-20 mb-24 max-w-[100vw] overflow-hidden">
        <AppleCarousel images={[HeroBusinessOwner01, FeatureAIContent, FeatureAnalytics, FeatureScheduling]} />
      </div>

      {/* Feature Sections */}
      <div className="max-w-7xl mx-auto px-4 space-y-32">
        
        {/* Feature 1 */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="font-display text-3xl font-bold text-white">AI Content Generation</h2>
            <p className="text-lg text-white/60">
              Generate weeks of highly engaging, localized social media content in seconds. Our AI understands your business context and matches your unique brand voice perfectly.
            </p>
          </div>
          <div className="flex-1">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden glass p-2 border border-white/5 relative group cursor-pointer">
              <img src={FeatureAIContent} alt="AI Content" className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <Calendar className="h-6 w-6" />
            </div>
            <h2 className="font-display text-3xl font-bold text-white">Automated Scheduling</h2>
            <p className="text-lg text-white/60">
              Never worry about missing a post again. Schedule your content calendar in advance and let our system publish it at the optimal times for maximum engagement.
            </p>
          </div>
          <div className="flex-1">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden glass p-2 border border-white/5 relative group cursor-pointer">
              <img src={FeatureScheduling} alt="Scheduling" className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <BarChart className="h-6 w-6" />
            </div>
            <h2 className="font-display text-3xl font-bold text-white">Deep Analytics</h2>
            <p className="text-lg text-white/60">
              Track your growth with beautiful, easy-to-understand analytics. See which posts perform best, understand your audience demographics, and optimize your strategy.
            </p>
          </div>
          <div className="flex-1">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden glass p-2 border border-white/5 relative group cursor-pointer">
              <img src={FeatureAnalytics} alt="Analytics" className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
