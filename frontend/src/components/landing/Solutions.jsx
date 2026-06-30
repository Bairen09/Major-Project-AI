import React, { useState } from 'react';
import { Search, ArrowRight, Sparkles } from 'lucide-react';

export default function Solutions() {
  const filters = ["Restaurant", "Salon", "Clinic", "Gym", "Cafe", "Real Estate", "Coaching", "Retail", "Beauty", "Hotel"];
  const [active, setActive] = useState("Restaurant");
  
  const ideas = {
    Restaurant: [
      { t: "Weekend Thali Special", d: "Highlight your signature thali with mouth-watering visuals." },
      { t: "Chef's Story Reel", d: "30-sec reel introducing your head chef and signature dish." },
      { t: "Festive Menu Launch", d: "AI-crafted Diwali/Eid menu announcement caption + hashtags." },
    ],
    Salon: [
      { t: "Bridal Makeover Carousel", d: "Before/after carousel showcasing bridal transformations." },
      { t: "Monsoon Hair Care Tips", d: "Educational reel with product recommendations." },
      { t: "First-Visit 20% Off", d: "Lead-gen post optimised for local Instagram + Google." },
    ],
    Clinic: [
      { t: "Doctor Q&A Reel", d: "Trust-building 60-sec reel answering common questions." },
      { t: "Health Checkup Combo", d: "Seasonal package post with WhatsApp CTA." },
      { t: "Patient Story Highlight", d: "Anonymous testimonial post with empathy." },
    ],
    Gym: [{ t: "Transformation Tuesday", d: "Member spotlight + trial CTA." }, { t: "30-Day Challenge", d: "Lead-magnet sign-up post." }, { t: "Trainer Tip of the Week", d: "Quick-form video script." }],
    Cafe: [{ t: "Latte Art Reel", d: "Aesthetic slow-mo pour with trending audio." }, { t: "Work-Friendly Wi-Fi", d: "Target nearby co-working crowd." }, { t: "Weekend Brunch Menu", d: "Carousel + story sticker." }],
    "Real Estate": [{ t: "Property Walkthrough Reel", d: "AI script with voiceover hooks." }, { t: "Locality Spotlight", d: "Educational post about a neighbourhood." }, { t: "EMI Calculator CTA", d: "Lead-gen with WhatsApp form." }],
    Coaching: [{ t: "Crack the Concept Reel", d: "Bite-sized teaching short." }, { t: "Free Demo Class", d: "Sign-up landing post." }, { t: "Topper Testimonial", d: "Authority-building carousel." }],
    Retail: [{ t: "New Arrivals Drop", d: "Trend-driven product showcase." }, { t: "Festive Combo Offer", d: "Banner + caption + hashtags." }, { t: "Customer Reviews Story", d: "Social proof highlights." }],
    Beauty: [{ t: "Skincare Routine Reel", d: "Step-by-step with product tags." }, { t: "Glow-Up Giveaway", d: "Engagement post with rules." }, { t: "Tutorial Carousel", d: "Educational slide deck." }],
    Hotel: [{ t: "Weekend Getaway Reel", d: "Cinematic stay highlights." }, { t: "Honeymoon Package", d: "Lead post with enquire button." }, { t: "Local Experiences", d: "Curate nearby attractions." }],
  };

  return (
    <section id="solutions" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="glass-strong relative overflow-hidden rounded-[32px] p-8 md:p-12">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#F5D77A]/20 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-[#D4AF37]/20 blur-3xl" />

          <div className="grid items-center gap-8 lg:grid-cols-[1fr_2fr]">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Find ideas that<br />fit <span className="text-gradient">your business</span>
            </h2>
            <div className="relative">
              <div className="glass flex items-center gap-2 rounded-2xl p-2">
                <Search className="ml-3 h-5 w-5 text-muted-foreground" />
                <input
                  placeholder="Search content ideas, templates, topics..."
                  className="flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-muted-foreground"
                />
                <button className="btn-cta inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold">
                  Explore Ideas <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Popular Searches:</span>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${active === f ? "bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-white shadow-[0_10px_30px_-10px_rgba(255,107,53,0.5)]" : "glass text-muted-foreground hover:text-white"}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {(ideas[active] || []).map((idea, i) => (
              <div key={idea.t} className="glass group rounded-2xl p-5 transition hover:-translate-y-1 hover:bg-white/10" style={{ animation: `fade-up .5s ease ${i * 0.08}s both` }}>
                <div className="flex items-center gap-2 text-xs text-[#D4AF37]"><Sparkles className="h-3 w-3" /> AI Suggested</div>
                <h4 className="mt-2 font-display text-lg font-semibold">{idea.t}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{idea.d}</p>
                <button className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#F5D77A] transition group-hover:gap-2">Use template <ArrowRight className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
