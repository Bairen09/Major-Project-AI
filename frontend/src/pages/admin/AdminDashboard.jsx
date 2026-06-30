import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, Server, ImageIcon, FileText, Calendar, Bell, 
  Sparkles, TrendingUp, HardDrive, RefreshCcw
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { getAdminDashboard } from '../../services/admin.service';
import PlatformLogo from '../../components/common/PlatformLogo';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await getAdminDashboard();
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Platform Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="glass rounded-2xl p-6 h-[120px] animate-pulse bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/50">
        <p>Failed to load dashboard.</p>
        <button onClick={fetchDashboard} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white">
          <RefreshCcw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  const { totals, monthly, recent } = data;

  const kpis = [
    { label: "Total Users", value: totals.users, icon: <Users className="h-5 w-5 text-blue-400" />, sub: `${monthly.users} this month` },
    { label: "Active Today", value: totals.activeUsersToday, icon: <TrendingUp className="h-5 w-5 text-green-400" /> },
    { label: "Businesses", value: totals.businesses, icon: <Building2 className="h-5 w-5 text-purple-400" />, sub: `${monthly.businesses} this month` },
    { label: "Avg Team Size", value: monthly.avgTeamSize, icon: <Users className="h-5 w-5 text-indigo-400" /> },
    { label: "Posts Generated", value: totals.posts, icon: <FileText className="h-5 w-5 text-pink-400" /> },
    { label: "AI Requests", value: totals.prompts, icon: <Sparkles className="h-5 w-5 text-[#D4AF37]" />, sub: `${monthly.aiRequests} this month` },
    { label: "Images Gen", value: totals.aiImages, icon: <ImageIcon className="h-5 w-5 text-orange-400" /> },
    { label: "Scheduled", value: totals.scheduledPosts, icon: <Calendar className="h-5 w-5 text-yellow-400" /> },
    { label: "Storage Used", value: monthly.storageUsed, icon: <HardDrive className="h-5 w-5 text-cyan-400" /> },
    { label: "Avg Posts/Biz", value: monthly.avgPostsPerBusiness, icon: <TrendingUp className="h-5 w-5 text-emerald-400" /> },
    { label: "Top Category", value: monthly.topCategories[0] || "None", icon: <Building2 className="h-5 w-5 text-gray-400" /> },
    { label: "Notifications", value: totals.notifications, icon: <Bell className="h-5 w-5 text-red-400" /> }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Platform Overview</h1>
          <p className="text-white/60 mt-1">Monitor LocalBoost AI system performance and growth.</p>
        </div>
        <button onClick={fetchDashboard} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white">
          <RefreshCcw className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group hover:bg-white/[0.03] transition-colors">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              {React.cloneElement(kpi.icon, { className: "h-24 w-24" })}
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                {kpi.icon}
              </div>
              <h3 className="text-sm font-medium text-white/60">{kpi.label}</h3>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold">{kpi.value}</span>
              {kpi.sub && <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mt-1">{kpi.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold">Growth Overview</h3>
                <p className="text-sm text-white/50">Users and Businesses over time (30 Days)</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              {/* Dummy data for chart if actual time series is not in dashboard payload. 
                  (Actual daily series is in /analytics, so we'll mock it or fetch it) */}
              <div className="w-full h-full flex flex-col items-center justify-center text-white/30 border-2 border-dashed border-white/10 rounded-2xl p-6">
                 <TrendingUp className="h-10 w-10 opacity-30 mb-2" />
                 <span className="text-sm mt-4 text-center">Detailed charts available in Analytics tab</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Activity Feed */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col h-full max-h-[600px]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Recent Activity</h3>
              <span className="px-2 py-1 rounded bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">Live</span>
            </div>
            
            <div className="flex-1 overflow-y-auto apple-scrollbar pr-2 space-y-4">
              {recent.businesses.map(b => (
                <div key={b._id} className="flex gap-4 items-start p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-white/90">New business <span className="font-bold text-white">{b.name}</span> created.</p>
                    <p className="text-xs text-white/40">{new Date(b.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              
              {recent.users.map(u => (
                <div key={u._id} className="flex gap-4 items-start p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-white/90">New user <span className="font-bold text-white">{u.name}</span> registered.</p>
                    <p className="text-xs text-white/40">{new Date(u.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}

              {recent.prompts.map(p => (
                <div key={p._id} className="flex gap-4 items-start p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/30">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-white/90">AI Request generated for <span className="capitalize">{p.action?.replace('_', ' ')}</span></p>
                    <p className="text-xs text-white/40">{new Date(p.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
