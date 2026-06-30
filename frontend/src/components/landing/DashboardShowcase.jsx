import React from 'react';
import { LogoMark } from '../common/Logo';
import { BarChart3, Sparkles, Image as ImageIcon, Calendar, TrendingUp, Users, Bell, MapPin, Hash } from 'lucide-react';
import { 
  DashboardAnalytics, DashboardCalendar,
  HeroBusinessOwner01
} from '../../assets/images';

export default function DashboardShowcase() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="glass mx-auto inline-flex rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">Your command center</div>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">A dashboard you'll actually <span className="text-gradient-gold">open daily</span></h2>
          <p className="mt-4 text-muted-foreground">Posts, schedule, analytics, AI insights — beautifully unified.</p>
        </div>

        <div className="relative mx-auto mt-14 max-w-6xl">
          <div className="absolute -inset-10 -z-10 rounded-[40px] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(212,175,55,0.25),transparent_70%)]" />
          <div className="glass-strong overflow-hidden rounded-[28px] p-3 shadow-[0_60px_140px_-30px_rgba(212,175,55,0.4)]">
            <div className="grid gap-3 rounded-[20px] bg-[#111114]/90 p-4 lg:grid-cols-[220px_1fr]">
              {/* Sidebar */}
              <aside className="glass space-y-1 rounded-2xl p-3">
                <div className="mb-3 flex items-center gap-2 px-2"><LogoMark className="h-7 w-7" /><span className="font-display text-sm font-semibold">LocalBoost</span></div>
                {[
                  { i: <BarChart3 className="h-4 w-4" />, n: "Dashboard", a: true },
                  { i: <Sparkles className="h-4 w-4" />, n: "Generate" },
                  { i: <ImageIcon className="h-4 w-4" />, n: "My Posts" },
                  { i: <Calendar className="h-4 w-4" />, n: "Calendar" },
                  { i: <TrendingUp className="h-4 w-4" />, n: "Analytics" },
                  { i: <Users className="h-4 w-4" />, n: "Audience" },
                ].map(it => (
                  <div key={it.n} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${it.a ? "bg-gradient-to-r from-[#D4AF37]/30 to-transparent text-white" : "text-muted-foreground hover:bg-white/5"}`}>
                    {it.i} {it.n}
                  </div>
                ))}
              </aside>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { l: "Posts Generated", v: "128", c: "+34%" },
                    { l: "Engagement", v: "2.5K", c: "+18%" },
                    { l: "Reach", v: "45.8K", c: "+32%" },
                    { l: "Leads", v: "312", c: "+20%" },
                  ].map(s => (
                    <div key={s.l} className="glass rounded-2xl p-4">
                      <div className="text-[11px] text-muted-foreground">{s.l}</div>
                      <div className="mt-1 font-display text-2xl font-bold">{s.v}</div>
                      <div className="text-[11px] text-[#2E8B57]">{s.c}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
                  <div className="glass rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="text-sm font-semibold">Engagement Trend</div>
                      <div className="text-xs text-[#2E8B57]">↑ 247% vs last 7 days</div>
                    </div>
                    {/* Replaced SVG with image or just keep SVG if image is a full mockup */}
                    <svg viewBox="0 0 400 120" className="mt-4 h-32 w-full relative z-10">
                      <defs>
                        <linearGradient id="ch" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,90 C40,70 80,80 120,60 C160,40 200,50 240,30 C280,20 320,40 360,20 L400,15 L400,120 L0,120 Z" fill="url(#ch)" />
                      <path d="M0,90 C40,70 80,80 120,60 C160,40 200,50 240,30 C280,20 320,40 360,20 L400,15" stroke="#D4AF37" strokeWidth="2.5" fill="none" />
                      {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x, i) => (
                        <rect key={i} x={x - 8} y={90 - (i * 7)} width="6" height={(i * 7) + 20} rx="2" fill="#F5D77A" opacity="0.7" />
                      ))}
                    </svg>
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <div className="text-sm font-semibold">AI Insights</div>
                    <div className="mt-3 space-y-3 text-xs">
                      {[
                        { i: <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />, t: "Post reels on Tue 7-9 PM for +42% reach" },
                        { i: <Hash className="h-3.5 w-3.5 text-[#F5D77A]" />, t: "Try #MumbaiEats — trending nearby" },
                        { i: <TrendingUp className="h-3.5 w-3.5 text-[#2E8B57]" />, t: "Carousels outperform statics by 3.2x" },
                      ].map((x, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg bg-white/5 p-2.5">{x.i}<span className="text-muted-foreground">{x.t}</span></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-semibold">Recent Posts</div>
                    <button className="text-xs text-[#D4AF37]">View all</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[DashboardAnalytics, DashboardCalendar, DashboardAnalytics, HeroBusinessOwner01].map((src, i) => (
                      <div key={i} className="group relative overflow-hidden rounded-xl">
                        <img src={src} alt="" className="h-28 w-full object-cover transition group-hover:scale-105" loading="lazy" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[10px]">
                          <div className="flex items-center justify-between"><span>● Published</span><span className="text-[#2E8B57]">+{(i + 1) * 230}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* floating widgets */}
          <div className="glass-strong absolute -left-4 top-24 hidden w-52 animate-float rounded-2xl p-3 md:block">
            <div className="flex items-center gap-2 text-xs"><Bell className="h-4 w-4 text-[#F5D77A]" /> New comment on Reel</div>
            <p className="mt-1 text-[11px] text-muted-foreground">"Loved the new menu! 🔥"</p>
          </div>
          <div className="glass-strong absolute -right-4 bottom-16 hidden w-56 animate-float-slow rounded-2xl p-3 md:block">
            <div className="flex items-center gap-2 text-xs"><MapPin className="h-4 w-4 text-[#D4AF37]" /> Audience in Pune ↑ 38%</div>
          </div>
        </div>
      </div>
    </section>
  );
}
