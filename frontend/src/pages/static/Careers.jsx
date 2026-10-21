import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, ArrowRight } from 'lucide-react';

export default function Careers() {
  const jobs = [
    { title: "Senior AI Engineer", dept: "Engineering", location: "Bengaluru / Remote" },
    { title: "Product Designer", dept: "Design", location: "Remote" },
    { title: "Growth Marketing Lead", dept: "Marketing", location: "Bengaluru" }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#f0cf65] transition mb-8 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#D4AF37]/20 mb-6">
            <Briefcase className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">Join our mission</h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">We're building the future of marketing for local businesses. Help us democratize AI for main street.</p>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">Open Positions</h2>
          {jobs.map((job, idx) => (
            <div key={idx} className="glass rounded-2xl p-6 border border-white/5 hover:border-[#D4AF37]/30 transition group flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition">{job.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-white/50">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{job.dept}</span>
                  <span>{job.location}</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition text-white/50">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
