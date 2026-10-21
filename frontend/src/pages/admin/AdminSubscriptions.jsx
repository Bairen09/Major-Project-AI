import React, { useState, useEffect } from 'react';
import { getAdminSubscriptions, getAdminSubscriptionStats, updateAdminSubscriptionPlan } from '../../services/admin.service';
import { Loader2, CreditCard, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSubscriptions() {
  const [stats, setStats] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStats = async () => {
    try {
      const res = await getAdminSubscriptionStats();
      setStats(res.data.data);
    } catch (err) {
      toast.error('Failed to load subscription stats');
    }
  };

  const fetchSubscriptions = async (p = 1) => {
    try {
      const res = await getAdminSubscriptions({ page: p });
      setSubscriptions(res.data.data.subscriptions);
      setTotalPages(res.data.data.pagination.totalPages);
    } catch (err) {
      toast.error('Failed to load subscriptions');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchSubscriptions(page)]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handlePlanChange = async (id, newPlan) => {
    try {
      await updateAdminSubscriptionPlan(id, { planKey: newPlan });
      toast.success('Subscription plan updated');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update plan');
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex h-full items-center justify-center text-white/50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">Subscriptions</h1>
        <p className="text-white/60 mt-1">Manage user plans, limits, and quotas.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400"><CheckCircle className="h-4 w-4" /></div>
              <h3 className="text-sm font-medium text-white/60">Active Clients</h3>
            </div>
            <span className="font-display text-2xl font-bold">{stats.perStatus?.ACTIVE || 0}</span>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"><AlertTriangle className="h-4 w-4" /></div>
               <h3 className="text-sm font-medium text-white/60">Expiring in 7 Days</h3>
             </div>
             <span className="font-display text-2xl font-bold">{stats.expiringWithin7Days || 0}</span>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400"><ShieldAlert className="h-4 w-4" /></div>
               <h3 className="text-sm font-medium text-white/60">Expired but Active</h3>
             </div>
             <span className="font-display text-2xl font-bold">{stats.expiredButStillActive || 0}</span>
             <p className="text-[10px] text-white/40 mt-1">Should be 0 if cron is working</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400"><CreditCard className="h-4 w-4" /></div>
               <h3 className="text-sm font-medium text-white/60">Pro / Agency Plans</h3>
             </div>
             <span className="font-display text-2xl font-bold">
                {(stats.perPlan?.PRO || 0) + (stats.perPlan?.AGENCY || 0)}
             </span>
          </div>
        </div>
      )}

      <div className="glass rounded-3xl border border-white/5 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/50 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Owner</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Expires At</th>
                  <th className="px-6 py-4 font-medium">Daily Quota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {subscriptions.map(sub => (
                  <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{sub.ownerId?.name || 'Unknown'}</div>
                      <div className="text-xs text-white/40">{sub.ownerId?.email || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={sub.planKey} 
                        onChange={(e) => handlePlanChange(sub._id, e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="FREE">FREE</option>
                        <option value="STARTER">STARTER</option>
                        <option value="PRO">PRO</option>
                        <option value="AGENCY">AGENCY</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        sub.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        sub.status === 'EXPIRED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-white/10 text-white/60 border-white/20'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white/80">{sub.postsUsedToday} used today</div>
                    </td>
                  </tr>
                ))}
                {subscriptions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-white/40">
                      No subscriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
         </div>
         {totalPages > 1 && (
            <div className="p-4 border-t border-white/5 flex items-center justify-between">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-xl bg-white/5 text-sm font-medium hover:bg-white/10 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-white/50">Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-xl bg-white/5 text-sm font-medium hover:bg-white/10 disabled:opacity-50"
              >
                Next
              </button>
            </div>
         )}
      </div>
    </div>
  );
}
