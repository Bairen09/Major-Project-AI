import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#f0cf65] transition mb-8 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-white tracking-tight mb-4">Get in touch</h1>
            <p className="text-white/60 mb-8">We're here to help your local business grow. Reach out to us for support, sales, or partnership inquiries.</p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Mail className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm text-white/50">Email us</p>
                  <p className="text-white font-medium">hello@localboost.ai</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Phone className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm text-white/50">Call us</p>
                  <p className="text-white font-medium">+91 (800) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <MapPin className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm text-white/50">Visit us</p>
                  <p className="text-white font-medium">Tech Park, Bengaluru, India 560001</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-3xl p-8 border border-white/10">
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Name</label>
                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]/50" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <input type="email" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]/50" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Message</label>
                <textarea rows="4" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]/50 resize-none" placeholder="How can we help?"></textarea>
              </div>
              <button type="submit" className="w-full btn-cta py-3 rounded-xl font-bold">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
