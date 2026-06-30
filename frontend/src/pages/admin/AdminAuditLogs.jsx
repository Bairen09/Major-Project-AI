import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldAlert, CheckCircle, XCircle, Trash2, Loader2, Activity,
  Filter
} from 'lucide-react';
import { getAdminAuditLogs } from '../../services/admin.service';
import { toast } from 'sonner';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAdminAuditLogs({ page, limit: 20, search });
      setLogs(res.data.data.logs || []);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);

  const getActionColor = (action) => {
    const act = action?.toLowerCase() || '';
    if (act.includes('delete') || act.includes('remove') || act.includes('fail')) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (act.includes('create') || act.includes('add') || act.includes('success')) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (act.includes('update') || act.includes('edit')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    return 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Audit Logs</h1>
          <p className="text-white/60 mt-1">Monitor platform activity and security events.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#D4AF37] transition-colors" />
             <input 
               type="text" 
               placeholder="Search logs..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full md:w-64 rounded-xl bg-white/5 border border-white/10 px-9 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:bg-white/10"
             />
           </div>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1 apple-scrollbar">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider sticky top-0 z-10 backdrop-blur-xl">
              <tr>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Entity / Context</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-white/50">
                     <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                     Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-white/50">No logs found matching your criteria.</td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log._id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {log.user ? (
                        <div className="flex items-center gap-2">
                           <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">{log.user.name?.charAt(0) || '?'}</div>
                           {log.user.name}
                        </div>
                      ) : 'System'}
                    </td>
                    <td className="px-6 py-4 text-white/60 truncate max-w-[300px]">
                      {log.entityType ? `${log.entityType} (${log.entityId})` : log.details || '-'}
                    </td>
                    <td className="px-6 py-4 text-white/50 text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {total > 20 && (
          <div className="border-t border-white/5 px-6 py-4 flex items-center justify-between bg-black/20">
            <span className="text-xs text-white/50">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} logs
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={page * 20 >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
