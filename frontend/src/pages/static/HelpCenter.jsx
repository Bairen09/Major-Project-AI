import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LifeBuoy, Search, Book, MessageCircle, PlayCircle } from 'lucide-react';

export default function HelpCenter() {
  const categories = [
    { name: "Getting Started", icon: PlayCircle, desc: "Setting up your workspace and connecting accounts." },
    { name: "Content Generation", icon: Book, desc: "How to get the best results from the AI." },
    { name: "Billing & Plans", icon: LifeBuoy, desc: "Manage your subscription and invoices." },
    { name: "Troubleshooting", icon: MessageCircle, desc: "Common issues and how to resolve them." }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#f0cf65] transition mb-8 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">How can we help?</h1>
          <div className="relative max-w-xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input 
              type="text" 
              placeholder="Search for articles, guides, or tutorials..." 
              className="w-full glass rounded-full pl-12 pr-6 py-4 text-white outline-none border border-white/10 focus:border-[#D4AF37]/50"
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="glass rounded-2xl p-6 border border-white/5 hover:border-[#D4AF37]/30 transition cursor-pointer flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                <cat.icon className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{cat.name}</h3>
                <p className="text-sm text-white/50">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
