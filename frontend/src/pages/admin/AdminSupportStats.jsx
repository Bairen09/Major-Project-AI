// frontend/src/pages/admin/AdminSupportStats.jsx
// Platform-wide ticket stats for superadmin. Reuses Recharts like Analytics.jsx.

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Loader2, Ticket, Users, Clock, AlertTriangle } from 'lucide-react';
import { getAdminSupportStats } from '../../services/support.service';

export default function AdminSupportStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminSupportStats()
      .then(res => setStats(res.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const totalTickets = Object.values(stats?.statusCounts || {}).reduce((a, b) => a + b, 0);
  const openCount = stats?.statusCounts?.OPEN || 0;
  const resolvedCount = (stats?.statusCounts?.RESOLVED || 0) + (stats?.statusCounts?.CLOSED || 0);

  const dailyData = (stats?.last7Days || []).map(d => ({
    date: d._id.slice(5), // MM-DD
    count: d.count,
  }));

  const perStaffData = (stats?.perStaff || []).map(s => ({
    name: s.staffName || 'Unknown',
    tickets: s.total,
  }));

  const summary = [
    {
      icon: Ticket,
      label: 'Total Tickets',
      value: totalTickets,
      color: 'text-[#D4AF37]',
      bg: 'bg-[#D4AF37]/10',
      border: 'border-[#D4AF37]/20',
    },
    {
      icon: AlertTriangle,
      label: 'Open / Unassigned',
      value: `${openCount} / ${stats?.unassignedCount ?? 0}`,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
    },
    {
      icon: Users,
      label: 'Resolved',
      value: resolvedCount,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      icon: Clock,
      label: 'Avg. Resolution',
      value: stats?.avgResolutionHours != null ? `${stats.avgResolutionHours}h` : '—',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Support Stats</h1>
        <p className="text-white/40 text-sm mt-1">Platform-wide ticket analytics</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map(({ icon: Icon, label, value, color, bg, border }) => (
          <div key={label} className={`p-5 rounded-2xl border ${bg} ${border}`}>
            <Icon className={`h-5 w-5 ${color} mb-3`} />
            <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
            <p className="text-xs text-white/40 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Daily tickets chart */}
      {dailyData.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/3 border border-white/8">
          <h2 className="font-bold text-white mb-4">Tickets — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                itemStyle={{ color: '#D4AF37' }}
              />
              <Bar dataKey="count" fill="#D4AF37" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-staff breakdown */}
      {perStaffData.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/3 border border-white/8">
          <h2 className="font-bold text-white mb-4">Tickets by Staff Member</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perStaffData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} width={120} />
              <Tooltip
                contentStyle={{ background: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                itemStyle={{ color: '#D4AF37' }}
              />
              <Bar dataKey="tickets" fill="#D4AF37" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Last 30 days total */}
      <p className="text-xs text-white/30 text-right">
        Total tickets in the last 30 days: <span className="text-white/60 font-bold">{stats?.last30DaysTotal ?? '—'}</span>
      </p>
    </div>
  );
}
