import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: "What is LocalBoost AI?",
    a: "LocalBoost AI is an intelligent platform designed to help local businesses automate their marketing, generate high-quality content, and reach more customers effortlessly."
  },
  {
    q: "How does the AI generation work?",
    a: "Our platform uses state-of-the-art language and image models to instantly create engaging social media posts tailored specifically to your business's niche and tone."
  },
  {
    q: "Can I manage multiple businesses?",
    a: "Yes! If your account is provisioned for it, you can easily switch between multiple workspaces and manage different brands from a single dashboard."
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We employ enterprise-grade security and encryption to ensure that your business details, generated content, and user data remain completely private and secure."
  }
];

export default function CommonFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="w-full mt-auto pt-16 pb-8 z-10">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 pt-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-white/60 text-sm mt-2">Have a question? We're here to help.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className={`glass rounded-xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-[#D4AF37]/30 bg-white/5' : 'border-white/5 hover:border-white/10'}`}
              >
                <button 
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className={`font-semibold text-sm ${isOpen ? 'text-[#D4AF37]' : 'text-white/80'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#D4AF37]' : ''}`} />
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-sm text-white/60 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
