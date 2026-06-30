import React, { useState, useEffect } from 'react';
import { 
  X, Building2, MapPin, Globe, FileText, Sparkles, Users, Calendar, 
  CheckCircle, XCircle, Trash2, Loader2 
} from 'lucide-react';
import { getAdminBusinessDetails, updateAdminBusinessStatus, deleteAdminBusiness } from '../../services/admin.service';
import { toast } from 'sonner';

export default function AdminBusinessDrawer({ isOpen, onClose, business, onStatusUpdated }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && business) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const res = await getAdminBusinessDetails(business._id);
          setDetails(res.data.data);
        } catch (err) {
          toast.error("Failed to load business details");
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, business]);

  if (!isOpen || !business) return null;

  const handleStatusChange = async (isActive) => {
    if (!confirm(`Are you sure you want to ${isActive ? 'activate' : 'suspend'} this business?`)) return;
    setActionLoading(true);
    try {
      await updateAdminBusinessStatus(business._id, isActive);
      toast.success(`Business is now ${isActive ? 'active' : 'suspended'}`);
      onStatusUpdated();
      onClose();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!confirm(`Are you sure you want to delete this business? This action is semi-permanent.`)) return;
    setActionLoading(true);
    try {
      await deleteAdminBusiness(business._id);
      toast.success('Business soft deleted');
      onStatusUpdated();
      onClose();
    } catch (err) {
      toast.error('Failed to delete business');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]" onClick={onClose} />
      <div className={`fixed right-0 top-0 h-full w-full max-w-lg bg-[#111114] border-l border-white/10 z-[100] transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="font-display text-xl font-bold flex items-center gap-2"><Building2 className="text-[#D4AF37] h-5 w-5" /> Workspace</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto apple-scrollbar p-6 space-y-8">
          
          {/* Header Profile */}
          <div className="relative mb-8">
             {business.coverImage?.url ? (
                <div className="h-32 w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                   <img src={business.coverImage.url} className="w-full h-full object-cover opacity-50" alt="Cover" />
                </div>
             ) : (
                <div className="h-32 w-full rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10" />
             )}
             
             <div className="absolute -bottom-6 left-6 flex items-end gap-4">
                <div className="h-20 w-20 rounded-2xl bg-black flex flex-shrink-0 items-center justify-center font-bold text-3xl text-[#D4AF37] border-2 border-[#111114] overflow-hidden shadow-2xl">
                  {business.logo?.url ? <img src={business.logo.url} className="h-full w-full object-cover" alt="" /> : business.name.charAt(0).toUpperCase()}
                </div>
                <div className="mb-1">
                   <h3 className="text-xl font-bold text-white leading-tight">{business.name}</h3>
                   <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/70 border border-white/20 mt-1">
                     {business.category}
                   </span>
                </div>
             </div>
          </div>

          <div className="pt-2 flex flex-col gap-2 text-sm text-white/60">
             {business.location && (
               <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {business.location}</div>
             )}
             {business.website && (
               <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> <a href={business.website} target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:underline">{business.website}</a></div>
             )}
             {business.description && (
               <p className="mt-2 text-white/80">{business.description}</p>
             )}
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
                  <div className="flex items-center gap-2 text-white/50 mb-1.5"><FileText className="h-4 w-4" /> <span className="text-xs">Generated Posts</span></div>
                  <span className="text-2xl font-bold">{details.analytics.totalPosts}</span>
                </div>
                <div className="glass rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-white/50 mb-1.5"><Sparkles className="h-4 w-4" /> <span className="text-xs">AI Prompts</span></div>
                  <span className="text-2xl font-bold">{details.analytics.totalPrompts}</span>
                </div>
              </div>

              {/* Members */}
              <div>
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-blue-400" /> Team Members ({details.business.team.length})</h4>
                <div className="space-y-2">
                  {details.business.team.map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-500/30">
                          {member.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-medium">{member.user?.name}</span>
                           <span className="text-xs text-white/50">{member.user?.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-white/50 bg-white/10 px-2 py-1 rounded-md uppercase tracking-wider">{member.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Created On</span>
                  <span className="font-medium">{new Date(business.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-white/50">Status</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    business.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                  }`}>
                    {business.isActive ? 'ACTIVE' : 'SUSPENDED'}
                  </span>
                </div>
              </div>

            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 bg-[#111114]">
          <div className="flex gap-3">
             {!business.isActive ? (
               <button 
                 disabled={actionLoading}
                 onClick={() => handleStatusChange(true)} 
                 className="flex-1 flex justify-center items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 py-3 rounded-xl font-medium transition-colors border border-green-500/20"
               >
                 <CheckCircle className="h-4 w-4" /> Activate
               </button>
             ) : (
               <button 
                 disabled={actionLoading}
                 onClick={() => handleStatusChange(false)} 
                 className="flex-1 flex justify-center items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 py-3 rounded-xl font-medium transition-colors border border-orange-500/20"
               >
                 <XCircle className="h-4 w-4" /> Suspend
               </button>
             )}
             <button 
               disabled={actionLoading}
               onClick={handleSoftDelete} 
               className="flex-1 flex justify-center items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl font-medium transition-colors border border-red-500/20"
             >
               <Trash2 className="h-4 w-4" /> Soft Delete
             </button>
          </div>
        </div>

      </div>
    </>
  );
}
