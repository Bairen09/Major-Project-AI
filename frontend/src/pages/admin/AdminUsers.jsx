import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, MoreVertical, ShieldAlert, CheckCircle, 
  XCircle, Trash2, Mail, Loader2
} from 'lucide-react';
import { getAdminUsers, updateAdminUserStatus } from '../../services/admin.service';
import AdminUserDrawer from './AdminUserDrawer';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedUserForDrawer, setSelectedUserForDrawer] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({ page, limit: 15, search, status: statusFilter });
      setUsers(res.data.data.users);
      setTotal(res.data.data.total);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search, statusFilter]);

  const toggleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => u._id));
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (status) => {
    if (selectedUserIds.length === 0) return;
    if (!confirm(`Are you sure you want to change status to ${status} for ${selectedUserIds.length} users?`)) return;

    try {
      await Promise.all(selectedUserIds.map(id => updateAdminUserStatus(id, status)));
      toast.success(`Successfully updated ${selectedUserIds.length} users`);
      setSelectedUserIds([]);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to perform bulk action');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-white/60 mt-1">Manage platform users, roles, and access.</p>
        </div>
        
        <div className="flex items-center gap-3">
           {selectedUserIds.length > 0 && (
             <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl mr-2">
               <span className="text-xs text-blue-400 font-medium">{selectedUserIds.length} selected</span>
               <button onClick={() => handleBulkAction('ACTIVE')} className="p-1.5 hover:bg-white/10 rounded-lg text-green-400" title="Activate Selected"><CheckCircle className="h-4 w-4" /></button>
               <button onClick={() => handleBulkAction('SUSPENDED')} className="p-1.5 hover:bg-white/10 rounded-lg text-orange-400" title="Suspend Selected"><XCircle className="h-4 w-4" /></button>
               <button onClick={() => handleBulkAction('DELETED')} className="p-1.5 hover:bg-white/10 rounded-lg text-red-400" title="Delete Selected"><Trash2 className="h-4 w-4" /></button>
             </div>
           )}
           
           <div className="relative group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#D4AF37] transition-colors" />
             <input 
               type="text" 
               placeholder="Search by name or email..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full md:w-64 rounded-xl bg-white/5 border border-white/10 px-9 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:bg-white/10"
             />
           </div>

           <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50 focus:bg-white/10 appearance-none"
           >
             <option value="">All Statuses</option>
             <option value="ACTIVE">Active</option>
             <option value="SUSPENDED">Suspended</option>
             <option value="DELETED">Deleted</option>
           </select>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1 apple-scrollbar">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider sticky top-0 z-10 backdrop-blur-xl">
              <tr>
                <th className="px-6 py-4 font-medium w-12">
                  <input type="checkbox" checked={selectedUserIds.length === users.length && users.length > 0} onChange={toggleSelectAll} className="rounded bg-white/10 border-white/20 text-[#D4AF37] focus:ring-[#D4AF37]/20" />
                </th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-white/50">
                     <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                     Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-white/50">No users found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selectedUserIds.includes(user._id)} onChange={() => toggleSelectUser(user._id)} className="rounded bg-white/10 border-white/20 text-[#D4AF37] focus:ring-[#D4AF37]/20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-[#D4AF37] overflow-hidden shrink-0 border border-white/10">
                           {user.avatar?.url ? <img src={user.avatar.url} className="h-full w-full object-cover" alt="" /> : user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-[#D4AF37] transition-colors">{user.name}</p>
                          <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" /> {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        user.platformRole === 'SUPER_ADMIN' 
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                          : 'bg-white/5 text-white/50 border-white/10'
                      }`}>
                        {user.platformRole}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        user.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        user.status === 'SUSPENDED' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {user.status || (user.isActive ? 'ACTIVE' : 'DELETED')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedUserForDrawer(user)}
                        className="text-xs font-medium text-[#D4AF37] hover:text-[#F5D77A] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View Profile
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
              Showing {(page - 1) * 15 + 1} to {Math.min(page * 15, total)} of {total} users
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

      <AdminUserDrawer 
        isOpen={!!selectedUserForDrawer} 
        onClose={() => setSelectedUserForDrawer(null)} 
        user={selectedUserForDrawer}
        onStatusUpdated={fetchUsers}
      />
    </div>
  );
}
