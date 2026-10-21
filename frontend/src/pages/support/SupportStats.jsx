// frontend/src/pages/support/SupportStats.jsx
// Staff's own ticket stats dashboard.

import React, { useState, useEffect } from 'react';
import { BarChart2, Loader2, Ticket, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { getStaffStats } from '../../services/support.service';

const STAT_CARD_STYLES = {
  OPEN: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  IN_PROGRESS: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  PENDING_USER: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  RESOLVED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  CLOSED: { color: 'text-white/50', bg: 'bg-white/5', border: 'border-white/10' },
};

export default function SupportStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStaffStats()
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

  // Variables removed
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">My Stats</h1>
        <p className="text-white/40 text-sm mt-1">Performance overview for your assigned tickets</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
          <Ticket className="h-6 w-6 text-[#D4AF37] mb-3" />
          <p className="text-3xl font-display font-bold text-white">{stats?.ticketsToday ?? '—'}</p>
          <p className="text-sm text-white/50 mt-1">Tickets assigned today</p>
        </div>
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <Clock className="h-6 w-6 text-emerald-400 mb-3" />
          <p className="text-3xl font-display font-bold text-white">
            {stats?.avgResolutionHours != null ? `${stats.avgResolutionHours}h` : '—'}
          </p>
          <p className="text-sm text-white/50 mt-1">Avg. resolution time</p>
        </div>
      </div>

      {/* By status */}
      <div>
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">By Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(STAT_CARD_STYLES).map(([status, style]) => {
            const count = stats?.statusCounts?.[status] || 0;
            return (
              <div key={status} className={`p-4 rounded-xl border ${style.bg} ${style.border}`}>
                <p className={`text-2xl font-display font-bold ${style.color}`}>{count}</p>
                <p className="text-xs text-white/50 mt-1">{status.replace('_', ' ')}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
