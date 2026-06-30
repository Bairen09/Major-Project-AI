import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, Filter, MoreVertical, ShieldAlert, CheckCircle, 
  XCircle, Trash2, Mail, Loader2
} from 'lucide-react';
import { getAdminBusinesses, updateAdminBusinessStatus, deleteAdminBusiness } from '../../services/admin.service';
import AdminBusinessDrawer from './AdminBusinessDrawer';
import { toast } from 'sonner';

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedBusinessForDrawer, setSelectedBusinessForDrawer] = useState(null);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await getAdminBusinesses({ page, limit: 15, search });
      setBusinesses(res.data.data.businesses);
      setTotal(res.data.data.total);
    } catch (err) {
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBusinesses();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);

  const toggleSelectAll = () => {
    if (selectedIds.length === businesses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(businesses.map(b => b._id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (actionType) => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to perform this action on ${selectedIds.length} businesses?`)) return;

    try {
      if (actionType === 'DELETE') {
        await Promise.all(selectedIds.map(id => deleteAdminBusiness(id)));
      } else {
        const isActive = actionType === 'ACTIVE';
        await Promise.all(selectedIds.map(id => updateAdminBusinessStatus(id, isActive)));
      }
      toast.success(`Successfully updated ${selectedIds.length} businesses`);
      setSelectedIds([]);
      fetchBusinesses();
    } catch (err) {
      toast.error('Failed to perform bulk action');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Businesses</h1>
          <p className="text-white/60 mt-1">Manage workspaces, subscriptions, and team limits.</p>
        </div>
        
        <div className="flex items-center gap-3">
           {selectedIds.length > 0 && (
             <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl mr-2">
               <span className="text-xs text-blue-400 font-medium">{selectedIds.length} selected</span>
               <button onClick={() => handleBulkAction('ACTIVE')} className="p-1.5 hover:bg-white/10 rounded-lg text-green-400" title="Activate Selected"><CheckCircle className="h-4 w-4" /></button>
               <button onClick={() => handleBulkAction('SUSPEND')} className="p-1.5 hover:bg-white/10 rounded-lg text-orange-400" title="Suspend Selected"><XCircle className="h-4 w-4" /></button>
               <button onClick={() => handleBulkAction('DELETE')} className="p-1.5 hover:bg-white/10 rounded-lg text-red-400" title="Soft Delete Selected"><Trash2 className="h-4 w-4" /></button>
             </div>
           )}
           
           <div className="relative group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#D4AF37] transition-colors" />
             <input 
               type="text" 
               placeholder="Search business names..." 
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
                <th className="px-6 py-4 font-medium w-12">
                  <input type="checkbox" checked={selectedIds.length === businesses.length && businesses.length > 0} onChange={toggleSelectAll} className="rounded bg-white/10 border-white/20 text-[#D4AF37] focus:ring-[#D4AF37]/20" />
                </th>
                <th className="px-6 py-4 font-medium">Business</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Members</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && businesses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-white/50">
                     <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                     Loading businesses...
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-white/50">No businesses found.</td>
                </tr>
              ) : (
                businesses.map(b => (
                  <tr key={b._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selectedIds.includes(b._id)} onChange={() => toggleSelect(b._id)} className="rounded bg-white/10 border-white/20 text-[#D4AF37] focus:ring-[#D4AF37]/20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-[#D4AF37] overflow-hidden shrink-0 border border-white/10">
                           {b.logo?.url ? <img src={b.logo.url} className="h-full w-full object-cover" alt="" /> : b.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-[#D4AF37] transition-colors">{b.name}</p>
                          <p className="text-xs text-white/50 max-w-[200px] truncate">{b.website || b.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="inline-flex px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider">{b.category}</span>
                    </td>
                    <td className="px-6 py-4 text-white/50 font-medium text-center">
                       {b.members?.length || 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        b.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {b.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedBusinessForDrawer(b)}
                        className="text-xs font-medium text-[#D4AF37] hover:text-[#F5D77A] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {total > 15 && (
          <div className="border-t border-white/5 px-6 py-4 flex items-center justify-between bg-black/20">
            <span className="text-xs text-white/50">
              Showing {(page - 1) * 15 + 1} to {Math.min(page * 15, total)} of {total} businesses
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
                disabled={page * 15 >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AdminBusinessDrawer 
        isOpen={!!selectedBusinessForDrawer} 
        onClose={() => setSelectedBusinessForDrawer(null)} 
        business={selectedBusinessForDrawer}
        onStatusUpdated={fetchBusinesses}
      />
    </div>
  );
}
