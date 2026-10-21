import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ArrowRight } from 'lucide-react';

export default function Guides() {
  const guides = [
    { title: "The Ultimate Guide to Restaurant Marketing on Instagram", time: "10 min read", category: "Social Media" },
    { title: "How to Write Prompts that Convert", time: "5 min read", category: "AI Tools" },
    { title: "Scheduling Your Content for Maximum Reach", time: "7 min read", category: "Strategy" },
    { title: "Understanding Local SEO for Retailers", time: "12 min read", category: "SEO" }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#f0cf65] transition mb-8 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-12">
          <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">Growth Guides</h1>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {guides.map((guide, idx) => (
            <div key={idx} className="glass rounded-3xl p-8 border border-white/5 hover:border-[#D4AF37]/30 transition group cursor-pointer flex flex-col justify-between h-full min-h-[200px]">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold mb-4">
                  {guide.category}
                </span>
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{guide.title}</h3>
              </div>
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                <span className="text-sm text-white/40">{guide.time}</span>
                <ArrowRight className="h-5 w-5 text-white/30 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
