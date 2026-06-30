import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import AppleCarousel from '../components/common/AppleCarousel';
import { HeroAnalytics, FeatureAnalytics } from '../assets/images';

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      desc: "Perfect for single locations",
      features: ["Up to 3 social profiles", "15 AI posts per month", "Basic analytics", "Standard support"],
      popular: false
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      desc: "For growing businesses",
      features: ["Up to 10 social profiles", "Unlimited AI posts", "Advanced analytics & reporting", "Priority support", "Custom brand voice"],
      popular: true
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
            Simple, Transparent <span className="text-gradient">Pricing</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Choose the perfect plan for your business needs. No hidden fees.
          </p>
        </div>
      </div>

      {/* Hero Image Slider */}
      <div className="w-full mx-auto px-4 -mt-8 relative z-20 mb-24 max-w-[100vw] overflow-hidden">
        <AppleCarousel images={[HeroAnalytics, FeatureAnalytics]} />
      </div>

      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        {plans.map((plan, idx) => (
          <div key={idx} className={`glass p-8 rounded-3xl border ${plan.popular ? 'border-[#D4AF37]' : 'border-white/5'} relative`}>
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider rounded-full">
                Most Popular
              </div>
            )}
            <h3 className="font-display text-2xl font-bold text-white mb-2">{plan.name}</h3>
            <p className="text-white/60 mb-6">{plan.desc}</p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-bold text-white">{plan.price}</span>
              <span className="text-white/50">{plan.period}</span>
            </div>
            
            <button className={`w-full py-3 rounded-xl font-bold mb-8 transition-colors ${plan.popular ? 'bg-[#D4AF37] text-black hover:bg-[#F5D77A]' : 'bg-white/5 text-white hover:bg-white/10'}`}>
              Get Started
            </button>

            <ul className="space-y-4">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-white/80">
                  <CheckCircle2 className={`h-5 w-5 ${plan.popular ? 'text-[#D4AF37]' : 'text-white/30'}`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="glass p-6 rounded-2xl border border-white/5">
            <h4 className="font-bold text-white mb-2">Can I cancel anytime?</h4>
            <p className="text-white/60">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
          </div>
          <div className="glass p-6 rounded-2xl border border-white/5">
            <h4 className="font-bold text-white mb-2">Do I need a credit card for the free trial?</h4>
            <p className="text-white/60">No, you can start using LocalBoost AI completely free for 14 days without entering any payment information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
