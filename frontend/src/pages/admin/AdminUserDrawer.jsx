import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Shield, Building2, Calendar, FileText, Sparkles, 
  Bell, HardDrive, CheckCircle, XCircle, Trash2, Loader2, Image as ImageIcon
} from 'lucide-react';
import { getAdminUserDetails, updateAdminUserStatus } from '../../services/admin.service';
import { toast } from 'sonner';

export default function AdminUserDrawer({ isOpen, onClose, user, onStatusUpdated }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const res = await getAdminUserDetails(user._id);
          setDetails(res.data.data);
        } catch (err) {
          toast.error("Failed to load user details");
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleStatusChange = async (status) => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this user?`)) return;
    setActionLoading(true);
    try {
      await updateAdminUserStatus(user._id, status);
      toast.success(`User status updated to ${status}`);
      onStatusUpdated();
      onClose();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]" onClick={onClose} />
      <div className={`fixed right-0 top-0 h-full w-full max-w-lg bg-[#111114] border-l border-white/10 z-[100] transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="font-display text-xl font-bold">User Profile</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto apple-scrollbar p-6 space-y-8">
          
          {/* Header Profile */}
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-2xl bg-[#D4AF37]/10 flex flex-shrink-0 items-center justify-center font-bold text-3xl text-[#D4AF37] border border-[#D4AF37]/20 overflow-hidden">
              {user.avatar?.url ? <img src={user.avatar.url} className="h-full w-full object-cover" alt="" /> : user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              <div className="flex items-center gap-1.5 text-sm text-white/50 mt-1">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </div>
              <div className="flex gap-2 mt-3">
                <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  user.platformRole === 'SUPER_ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-white/5 text-white/50 border-white/10'
                }`}>
                  {user.platformRole}
                </span>
                <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  user.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  user.status === 'SUSPENDED' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {user.status || (user.isActive ? 'ACTIVE' : 'DELETED')}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-white/50">
              <Loader2 className="h-6 w-6 animate-spin mb-4" />
              <span>Loading details...</span>
            </div>
          ) : details ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-white/50 mb-1.5"><FileText className="h-4 w-4" /> <span className="text-xs">Total Posts</span></div>
                  <span className="text-2xl font-bold">{details.stats.posts}</span>
                </div>
                <div className="glass rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-white/50 mb-1.5"><Sparkles className="h-4 w-4" /> <span className="text-xs">AI Prompts</span></div>
                  <span className="text-2xl font-bold">{details.stats.prompts}</span>
                </div>
                <div className="glass rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-white/50 mb-1.5"><Bell className="h-4 w-4" /> <span className="text-xs">Alerts</span></div>
                  <span className="text-2xl font-bold">{details.stats.notifications}</span>
                </div>
                <div className="glass rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-white/50 mb-1.5"><HardDrive className="h-4 w-4" /> <span className="text-xs">Storage</span></div>
                  <span className="text-2xl font-bold">~{((details.stats.posts * 1) + (details.stats.prompts * 0.1)).toFixed(1)} MB</span>
                </div>
              </div>

              {/* Businesses */}
              <div>
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Building2 className="h-4 w-4 text-[#D4AF37]" /> Associated Businesses</h4>
                {details.businesses.length > 0 ? (
                  <div className="space-y-2">
                    {details.businesses.map(b => (
                      <div key={b._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-sm font-medium">{b.name}</span>
                        <span className="text-[10px] text-white/50 bg-white/10 px-2 py-1 rounded-md uppercase tracking-wider">{b.category}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/40 italic p-4 text-center border border-white/5 border-dashed rounded-xl">No businesses associated</p>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Joined</span>
                  <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Last Login</span>
                  <span className="font-medium">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Last Active</span>
                  <span className="font-medium">{user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}</span>
                </div>
              </div>

            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 bg-[#111114]">
          <div className="flex gap-3">
             {user.status === 'SUSPENDED' ? (
               <button 
                 disabled={actionLoading}
                 onClick={() => handleStatusChange('ACTIVE')} 
                 className="flex-1 flex justify-center items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 py-3 rounded-xl font-medium transition-colors border border-green-500/20"
               >
                 <CheckCircle className="h-4 w-4" /> Reactivate User
               </button>
             ) : (
               <button 
                 disabled={actionLoading}
                 onClick={() => handleStatusChange('SUSPENDED')} 
                 className="flex-1 flex justify-center items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 py-3 rounded-xl font-medium transition-colors border border-orange-500/20"
               >
                 <XCircle className="h-4 w-4" /> Suspend Access
               </button>
             )}
             <button 
               disabled={actionLoading}
               onClick={() => handleStatusChange('DELETED')} 
               className="flex-1 flex justify-center items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl font-medium transition-colors border border-red-500/20"
             >
               <Trash2 className="h-4 w-4" /> Delete Account
             </button>
          </div>
        </div>

      </div>
    </>
  );
}
