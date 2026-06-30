import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getAnalytics, 
  getBusinesses 
} from '../../services/business.service';
import { 
  RefreshCcw, BarChart3, Clock, CheckCircle, FileText, 
  Sparkles, Star, Repeat, FileStack, TrendingUp, Calendar, AlertCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { toast } from 'sonner';

export default function Analytics() {
  const [business, setBusiness] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async (busId, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const res = await getAnalytics(busId);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load analytics.');
      toast.error('Failed to load analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { data: businesses } } = await getBusinesses();
        if (businesses && businesses.length > 0) {
          setBusiness(businesses[0]);
          fetchAnalytics(businesses[0]._id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load business context.');
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleRefresh = () => {
    if (business && !refreshing) {
      fetchAnalytics(business._id, true);
    }
  };

  const getInsights = () => {
    if (!data) return [];
    const insights = [];
    const { overview, generation, platforms } = data;

    if (overview.publishedPosts === 0) {
      insights.push("No posts have been published yet.");
    } else {
      insights.push("Great! Your publishing workflow is active.");
    }

    if (overview.draftPosts > overview.publishedPosts) {
      insights.push("Most of your content is still in draft.");
    }

    if (overview.scheduledPosts === 0) {
      insights.push("You have no scheduled posts.");
    }

    if (generation.favoritePrompts > 5) {
      insights.push("You regularly reuse successful prompts.");
    }

    if (platforms && platforms.length > 0 && platforms[0].platform) {
      const p = platforms[0].platform;
      insights.push(`${p.charAt(0).toUpperCase() + p.slice(1)} is your most active platform.`);
    }

    return insights;
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-white/5 rounded-lg"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl"></div>)}
        </div>
        <div className="h-[400px] bg-white/5 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-white/50 mb-6">{error}</p>
        <button 
          onClick={() => business ? fetchAnalytics(business._id) : window.location.reload()}
          className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const hasActivity = data.overview.totalPosts > 0 || data.generation.totalGenerations > 0;
  const insights = getInsights();
  const PIE_COLORS = ['#D4AF37', '#ffffff', '#888888', '#444444'];

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {business?.logo?.url && (
             <img src={business.logo.url} alt="Logo" className="h-12 w-12 rounded-xl object-cover border border-white/10 bg-white/5" />
          )}
          <div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your AI content performance</p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition w-fit disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {!hasActivity ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/5 border border-white/10 rounded-2xl">
          <div className="h-16 w-16 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center mb-6">
            <BarChart3 className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No analytics yet</h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Generate and save your first AI post to unlock performance insights.
          </p>
          <Link 
            to="/dashboard/generate"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] text-black font-bold hover:bg-[#F5D77A] transition shadow-lg shadow-[#D4AF37]/20"
          >
            <Sparkles className="h-5 w-5" />
            Go to AI Generator
          </Link>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <OverviewCard icon={<FileText />} title="Total Posts" value={data.overview.totalPosts} />
            <OverviewCard icon={<FileStack />} title="Draft Posts" value={data.overview.draftPosts} />
            <OverviewCard icon={<Clock />} title="Scheduled" value={data.overview.scheduledPosts} />
            <OverviewCard icon={<CheckCircle />} title="Published" value={data.overview.publishedPosts} />
          </div>

          {/* Activity Chart */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:shadow-lg hover:shadow-black/50 transition duration-300">
            <h2 className="text-lg font-bold text-white mb-6">Posts Activity (Last 30 Days)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.activityLast30Days} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis stroke="#ffffff50" fontSize={12} allowDecimals={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111114', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" name="Generated" dataKey="generated" stroke="#D4AF37" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Saved" dataKey="saved" stroke="#ffffff" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Scheduled" dataKey="scheduled" stroke="#888888" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Platform Distribution */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:shadow-lg hover:shadow-black/50 transition duration-300">
              <h2 className="text-lg font-bold text-white mb-6">Platform Distribution</h2>
              {data.platforms.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-white/40">No platform data</div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.platforms}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="posts"
                          stroke="none"
                        >
                          {data.platforms.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value, name, props) => [value, props.payload.platform]}
                          contentStyle={{ backgroundColor: '#111114', borderColor: '#ffffff20', borderRadius: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full mt-4 space-y-2">
                    {data.platforms.map((p, i) => (
                      <div key={p.platform} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-white/80">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                          <span className="capitalize">{p.platform}</span>
                        </div>
                        <span className="font-medium text-white">{p.posts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Breakdown */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:shadow-lg hover:shadow-black/50 transition duration-300">
              <h2 className="text-lg font-bold text-white mb-6">Status Breakdown</h2>
              <div className="space-y-6">
                {data.statusBreakdown.length === 0 ? (
                  <div className="text-center text-white/40 py-10">No status data</div>
                ) : (
                  data.statusBreakdown.map((s) => (
                    <div key={s.status} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize text-white/80 font-medium">{s.status}</span>
                        <span className="text-white">{s.count} ({s.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#D4AF37] rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${s.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Insights & Quick Actions */}
            <div className="space-y-6">
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:shadow-lg hover:shadow-black/50 transition duration-300">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                  AI Insights
                </h2>
                <div className="space-y-3">
                  {insights.length === 0 ? (
                    <div className="text-white/40 text-sm">Generate posts to get AI insights.</div>
                  ) : (
                    insights.map((insight, idx) => (
                      <div key={idx} className="flex gap-3 text-sm text-white/80 bg-white/5 p-3 rounded-xl border border-white/5">
                        <TrendingUp className="h-4 w-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                        <span>{insight}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-sm uppercase tracking-wider text-white/50 font-bold mb-4">Quick Actions</h2>
                <div className="flex flex-col gap-3">
                  <Link to="/dashboard/generate" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition text-sm font-medium border border-white/5">
                    <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                    Generate New Post
                  </Link>
                  <Link to="/dashboard/posts" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition text-sm font-medium border border-white/5">
                    <FileText className="h-4 w-4 text-[#D4AF37]" />
                    View Saved Posts
                  </Link>
                  <Link to="/dashboard/calendar" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition text-sm font-medium border border-white/5">
                    <Calendar className="h-4 w-4 text-[#D4AF37]" />
                    Open Calendar
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* AI Usage Grid */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12 hover:shadow-lg hover:shadow-black/50 transition duration-300">
            <h2 className="text-lg font-bold text-white mb-6">AI Usage Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <UsageCard icon={<Sparkles />} title="Generations" value={data.generation.totalGenerations} />
              <UsageCard icon={<Star />} title="Favorite Prompts" value={data.generation.favoritePrompts} />
              <UsageCard icon={<Repeat />} title="Reused Prompts" value={data.generation.reusedPrompts} />
              <UsageCard icon={<FileText />} title="Avg Posts / Gen" value={data.generation.averagePostsPerGeneration} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function OverviewCard({ icon, title, value }) {
  return (
    <div className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform duration-300">
          {React.cloneElement(icon, { className: 'h-5 w-5' })}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-display font-bold text-white tracking-tight">{value}</h3>
        <p className="text-sm font-medium text-white/50 uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
}

function UsageCard({ icon, title, value }) {
  return (
    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition">
      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white/80">
        {React.cloneElement(icon, { className: 'h-5 w-5' })}
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none mb-1">{value}</p>
        <p className="text-xs text-white/50 font-medium uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
}
