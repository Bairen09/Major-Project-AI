import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { getAdminAnalytics } from '../../services/admin.service';
import { TrendingUp, Users, Building2, Sparkles, Loader2, Calendar } from 'lucide-react';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAdminAnalytics();
        // Assume API returns { activity: [ { date, users, businesses } ] }
        // The backend `getAnalytics` might be returning dailySignups which we'll map
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center text-white/50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Format data for recharts
  const chartData = data.dailySignups.map(d => {
    const biz = data.dailyBusinesses.find(b => b._id === d._id);
    return {
      date: new Date(d._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      users: d.count,
      businesses: biz ? biz.count : 0
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-xl border border-white/10 shadow-xl">
          <p className="text-sm font-medium text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}: <span className="font-bold text-white">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Platform Analytics</h1>
          <p className="text-white/60 mt-1">Deep dive into 30-day platform growth and usage.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/50 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <Calendar className="h-4 w-4" />
          Last 30 Days
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
           <div className="flex items-center gap-3 mb-3">
             <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400"><Users className="h-4 w-4" /></div>
             <h3 className="text-sm font-medium text-white/60">New Users (30d)</h3>
           </div>
           <span className="font-display text-2xl font-bold">{chartData.reduce((acc, curr) => acc + curr.users, 0)}</span>
         </div>
         <div className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
           <div className="flex items-center gap-3 mb-3">
             <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400"><Building2 className="h-4 w-4" /></div>
             <h3 className="text-sm font-medium text-white/60">New Businesses (30d)</h3>
           </div>
           <span className="font-display text-2xl font-bold">{chartData.reduce((acc, curr) => acc + curr.businesses, 0)}</span>
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Users Growth Chart */}
        <div className="glass rounded-3xl p-6 border border-white/5">
          <h3 className="font-display text-lg font-bold mb-6">User Signups Growth</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="users" name="New Users" stroke="#60A5FA" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#60A5FA', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Business Growth Chart */}
        <div className="glass rounded-3xl p-6 border border-white/5">
          <h3 className="font-display text-lg font-bold mb-6">Business Creation Growth</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="businesses" name="New Businesses" fill="#A78BFA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
}
