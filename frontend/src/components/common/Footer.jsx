import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Instagram, Facebook, Twitter, Linkedin, Youtube, Mail } from 'lucide-react';

export default function Footer() {
  const cols = [
    { t: "Product", l: [
      { name: "Features", path: "/features" },
      { name: "Pricing", path: "/pricing" },
      { name: "Integrations", path: "/integrations" },
      { name: "Updates", path: "/blogs" }
    ]},
    { t: "Company", l: [
      { name: "About", path: "/about" },
      { name: "Careers", path: "/careers" },
      { name: "Blog", path: "/blogs" },
      { name: "Contact", path: "/contact" }
    ]},
    { t: "Resources", l: [
      { name: "Help Center", path: "/help-center" },
      { name: "Guides", path: "/guides" },
      { name: "API Docs", path: "/api-docs" }
    ]},
    { t: "Legal", l: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Refund Policy", path: "/refund" }
    ]},
  ];
  
  return (
    <footer className="relative border-t border-white/5 pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4 pb-8">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
        <div className="mt-8 grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-[#D4AF37] blur-xl opacity-20" />
              <Link to="/" className="hover:opacity-80 transition-opacity block">
                <Logo />
              </Link>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">AI marketing platform built for local Indian businesses. Create. Schedule. Grow.</p>
            <div className="mt-6 flex gap-2">
              {[Instagram, Facebook, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social Link" className="glass grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition hover:text-white hover:bg-white/10">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {cols.map(c => (
              <div key={c.t}>
                <h4 className="font-display text-sm font-semibold text-white">{c.t}</h4>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {c.l.map(link => (
                    <li key={link.name}>
                      <Link to={link.path} className="transition hover:text-white">{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-white">Stay in the loop</h4>
            <p className="mt-2 text-sm text-muted-foreground">Monthly growth tips for local businesses.</p>
            <form className="glass mt-4 flex items-center gap-2 rounded-xl p-1.5" onSubmit={e => e.preventDefault()}>
              <Mail className="ml-2 h-4 w-4 text-muted-foreground" />
              <input placeholder="you@business.in" className="flex-1 bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-muted-foreground" />
              <button type="submit" className="btn-cta rounded-lg px-4 py-2 text-xs font-semibold">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} LocalBoost AI. Made with ♥ in India.</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
