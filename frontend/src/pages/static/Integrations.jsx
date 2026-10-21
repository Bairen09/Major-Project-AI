import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';

export default function Integrations() {
  const integrations = [
    { name: "Instagram", desc: "Auto-publish posts and reels directly to your Instagram Business account.", icon: Instagram },
    { name: "Facebook", desc: "Schedule and manage content across all your Facebook Pages.", icon: Facebook },
    { name: "Twitter / X", desc: "Engage with your audience in real-time with automated tweet scheduling.", icon: Twitter },
    { name: "LinkedIn", desc: "Build professional authority with B2B content on your Company Page.", icon: Linkedin }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#f0cf65] transition mb-8 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#D4AF37]/20 mb-6">
            <LinkIcon className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">Connect your stack</h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">LocalBoost AI integrates seamlessly with the platforms where your customers spend their time. Build once, publish everywhere.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {integrations.map((app, idx) => (
            <div key={idx} className="glass rounded-3xl p-8 border border-white/5 hover:border-[#D4AF37]/30 transition group">
              <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <app.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{app.name}</h3>
              <p className="text-white/60 leading-relaxed">{app.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
