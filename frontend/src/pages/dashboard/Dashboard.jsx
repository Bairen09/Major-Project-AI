import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, Bell, ArrowRight, MoreVertical, Calendar,
  FileText, Send, Clock, Megaphone, Plus, Image as ImageIcon, BarChart3, ChevronDown
} from "lucide-react";
import { getDashboardSummary, getCalendar } from "../../services/business.service";
import { useBusiness } from "../../context/BusinessContext";
import CreateBusinessModal from "../../components/dashboard/CreateBusinessModal";
import PlatformLogo from "../../components/common/PlatformLogo";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { activeBusiness: business, refreshBusinesses } = useBusiness();
  const [summaryData, setSummaryData] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    if (!business?._id) return;
    setLoading(true);
    try {
      const [summaryRes, calendarRes] = await Promise.all([
        getDashboardSummary(business._id),
        getCalendar(business._id)
      ]);
      setSummaryData(summaryRes.data.data);
      const upcoming = (calendarRes.data.data || []).slice(0, 3);
      setCalendarEvents(upcoming);
    } catch (err) {
      console.error("Failed to fetch dashboard secondary data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [business?._id]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse rounded-full h-12 w-12 border-t-2 border-[#D4AF37] border-solid" />
      </div>
    );
  }

  if (!business) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />
          <Sparkles className="mx-auto h-16 w-16 text-[#D4AF37] mb-6" />
          <h2 className="font-display text-4xl font-bold text-white tracking-tight mb-4">Welcome to LocalBoost AI</h2>
          <p className="text-white/60 mb-10 max-w-md">You haven't created a business yet. Create your first business to start generating AI-powered marketing content.</p>
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="btn-cta inline-flex items-center gap-2 rounded-xl px-8 py-4 font-bold shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)] transition hover:-translate-y-0.5"
          >
            Create Your First Business <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <CreateBusinessModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setCreateModalOpen(false)} 
          onSuccess={() => {
            setCreateModalOpen(false);
            refreshBusinesses();
          }}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <CreateBusinessModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
        onSuccess={() => {
          setCreateModalOpen(false);
          refreshBusinesses();
        }}
      />
      
      {/* Top Header / Greeting (Sticky with Apple Blur) */}
      <div className="sticky top-0 z-50 -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 -mt-4 pt-4 md:-mt-8 md:pt-8 pb-4 mb-2 bg-[#0A0A0B]/40 backdrop-blur-2xl border-b border-white/5 transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-[1600px] mx-auto">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0]}! <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="mt-1 text-sm text-white/60">Here's what's happening with your business today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard/generate" className="btn-cta inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)] transition hover:-translate-y-0.5">
              <Sparkles className="h-4 w-4" /> Generate Post
            </Link>
          </div>
        </div>
      </div>

      {/* Business Card (Hero) */}
      <div className="relative overflow-hidden glass-strong rounded-2xl border border-white/5 p-6 md:p-8 flex items-center justify-between group">
        <div className="absolute top-0 right-0 bottom-0 w-2/3 bg-gradient-to-l from-[#D4AF37]/5 to-transparent pointer-events-none z-0" />
        
        {/* Cover Image or Decorative City Skyline */}
        {business?.coverImage?.url ? (
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
            <img src={business.coverImage.url} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B] via-[#0A0A0B]/80 to-transparent" />
          </div>
        ) : (
          <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 pointer-events-none z-0">
            <svg className="absolute bottom-0 w-full h-[60%] text-[#D4AF37]" viewBox="0 0 400 100" fill="currentColor" preserveAspectRatio="none">
              <path d="M0,100 L0,80 L20,80 L20,60 L40,60 L40,40 L60,40 L60,70 L80,70 L80,30 L100,30 L100,80 L120,80 L120,20 L140,20 L140,90 L160,90 L160,50 L180,50 L180,80 L200,80 L200,40 L220,40 L220,70 L240,70 L240,10 L260,10 L260,60 L280,60 L280,30 L300,30 L300,80 L320,80 L320,50 L340,50 L340,90 L360,90 L360,40 L380,40 L380,80 L400,80 L400,100 Z" opacity="0.3" />
              <path d="M20,100 L20,90 L30,90 L30,50 L50,50 L50,20 L70,20 L70,80 L90,80 L90,40 L110,40 L110,90 L130,90 L130,30 L150,30 L150,80 L170,80 L170,60 L190,60 L190,90 L210,90 L210,50 L230,50 L230,80 L250,80 L250,20 L270,20 L270,70 L290,70 L290,40 L310,40 L310,80 L330,80 L330,60 L350,60 L350,90 L370,90 L370,50 L390,50 L390,80 L400,80 L400,100 Z" opacity="0.5" />
            </svg>
          </div>
        )}

        <div className="relative z-10 flex items-center gap-6">
          <div className="h-20 w-20 flex-shrink-0 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#D4AF37]/5 overflow-hidden">
            {business?.logo?.url ? (
              <img src={business.logo.url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <MoreVertical className="h-8 w-8 rotate-90" />
            )}
          </div>
          <div>
            <button className="flex items-center gap-2 group/btn transition">
              <h2 className="font-display text-2xl font-bold tracking-tight text-white group-hover/btn:text-[#D4AF37] transition-colors">{business.name}</h2>
              <ChevronDown className="h-5 w-5 text-white/50 group-hover/btn:text-[#D4AF37] transition-colors" />
            </button>
            <div className="mt-1 flex items-center gap-2 text-sm text-white/70">
              <span className="capitalize">{business.category?.replace('_', ' ')}</span>
              <span>•</span>
              <span>{business.location ? `${business.location.city || ''}${business.location.city && business.location.country ? ', ' : ''}${business.location.country || ''}` || "Global" : "Global"}</span>
            </div>
            <p className="mt-3 text-xs text-white/40">Last updated: Today, 10:30 AM</p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {[
          { l: "Total Posts", v: summaryData?.totalPosts || 0, icon: FileText, trend: "↑ 12% vs last 7 days", trendUp: true },
          { l: "Draft Posts", v: summaryData?.draftPosts || 0, icon: Send, trend: "↓ 8% vs last 7 days", trendUp: false },
          { l: "Scheduled Posts", v: summaryData?.scheduledPosts || 0, icon: Clock, trend: "↑ 24% vs last 7 days", trendUp: true },
          { l: "Published Posts", v: summaryData?.publishedPosts || 0, icon: Sparkles, trend: "↑ 15% vs last 7 days", trendUp: true },
          { l: "Active Campaigns", v: summaryData?.activeCampaigns || 0, icon: Megaphone, trend: "No change", trendUp: true },
        ].map(s => (
          <div key={s.l} className="group relative overflow-hidden glass rounded-2xl p-6 transition-all hover:-translate-y-1 hover:glow-gold border border-white/5 hover:border-[#D4AF37]/30">
            {/* Wave Graphic */}
            <div className="absolute bottom-0 right-0 w-32 h-16 opacity-[0.15] text-[#D4AF37] transform translate-y-4 group-hover:-translate-y-0 transition-transform duration-500 pointer-events-none">
               <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full fill-current">
                 <path d="M0,50 Q25,10 50,30 T100,20 L100,50 Z" />
               </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 text-muted-foreground mb-4">
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#D4AF37]/10 transition-colors">
                  <s.icon className="h-4 w-4 group-hover:text-[#D4AF37] transition-colors" />
                </div>
                <span className="text-sm font-medium tracking-wide">{s.l}</span>
              </div>
              <div className="font-display text-4xl font-bold tracking-tight mb-2">{s.v}</div>
              <div className={`text-xs font-medium ${s.trendUp ? "text-green-400" : "text-white/40"}`}>
                {s.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Posts */}
        <div className="glass rounded-2xl p-6 flex flex-col border border-white/5">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Recent Posts</h3>
            <Link to="/dashboard/posts" className="text-sm text-[#D4AF37] hover:underline font-medium">View all</Link>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/5">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#D4AF37]/10 blur-xl rounded-full" />
              <div className="relative glass h-16 w-16 rounded-2xl flex items-center justify-center border border-[#D4AF37]/20 text-[#D4AF37]">
                <FileText className="h-8 w-8" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-[#D4AF37]" />
            </div>
            <h4 className="font-bold text-lg mb-2">No recent posts yet</h4>
            <p className="text-sm text-white/50 max-w-[250px] mb-6 leading-relaxed">
              Generate your first post with AI and it will appear here.
            </p>
            <Link to="/dashboard/generate" className="btn-cta inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-[0_5px_15px_-5px_rgba(212,175,55,0.4)] transition hover:-translate-y-0.5">
              <Sparkles className="h-4 w-4" /> Generate Post
            </Link>
          </div>
        </div>

        {/* Next Scheduled Posts */}
        <div className="glass rounded-2xl p-6 flex flex-col border border-white/5">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Next Scheduled Posts</h3>
            <Link to="/dashboard/calendar" className="text-sm text-[#D4AF37] hover:underline font-medium">View calendar</Link>
          </div>
          
          {calendarEvents.length > 0 ? (
            <div className="flex-1 flex flex-col gap-3">
              {calendarEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <PlatformLogo platform={event.platform} className="h-10 w-10 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white/90 truncate max-w-[200px]">{event.title || 'Untitled Post'}</h4>
                      <div className="text-xs text-white/50 flex items-center gap-1.5 mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.scheduledAt).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 border border-blue-400/20">
                    Scheduled
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/5">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-[#D4AF37]/10 blur-xl rounded-full" />
                <div className="relative glass h-16 w-16 rounded-2xl flex items-center justify-center border border-[#D4AF37]/20 text-[#D4AF37]">
                  <Calendar className="h-8 w-8" />
                </div>
              </div>
              <h4 className="font-bold text-lg mb-2">No upcoming schedule</h4>
              <p className="text-sm text-white/50 max-w-[250px] mb-6 leading-relaxed">
                You haven't scheduled any posts yet.
              </p>
              <Link to="/dashboard/posts" className="glass inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-white/10 transition">
                <Calendar className="h-4 w-4" /> Schedule a Post
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-2">
        <h3 className="font-display text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Sparkles, title: "Generate with AI", subtitle: "Create engaging posts", path: "/dashboard/generate" },
            { icon: FileText, title: "View Saved Posts", subtitle: "Manage your content", path: "/dashboard/posts" },
            { icon: Calendar, title: "Schedule a Post", subtitle: "Plan for later", path: "/dashboard/calendar" },
            { icon: BarChart3, title: "View Analytics", subtitle: "Track performance", path: "/dashboard/analytics" },
          ].map((action, idx) => (
            <Link key={idx} to={action.path} className="group glass rounded-2xl p-5 flex items-center justify-between border border-white/5 hover:border-[#D4AF37]/40 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(212,175,55,0.15)]">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37] transition-colors">
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{action.title}</div>
                  <div className="text-xs text-white/40 mt-0.5">{action.subtitle}</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
