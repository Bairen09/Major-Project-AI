import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBusinesses } from '../../services/business.service';
import { ArrowLeft, Settings, Building2, Mail, User } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await getBusinesses();
        const businesses = res.data.data;
        if (businesses && businesses.length > 0) {
          setBusiness(businesses[0]);
        }
      } catch (err) {
        console.error("Failed to fetch business", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <div className="h-64 glass rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] pb-32">
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/settings')}
            className="btn-glass flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            <Settings className="h-4 w-4 text-[#D4AF37]" /> Edit Settings
          </button>
        </div>

        {/* Profile Card */}
        <div className="glass-strong rounded-3xl p-8 border border-[#D4AF37]/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-[#D4AF37]/30 bg-[#1a1612] flex items-center justify-center text-4xl font-bold text-[#D4AF37]">
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <div className="inline-flex px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-semibold tracking-wide uppercase">
                {user?.role || 'User'}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-6 w-full text-center md:text-left">
              <div>
                <h1 className="font-display text-3xl font-bold text-white mb-2">{user?.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/50">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
              </div>

              {business && (
                <div className="pt-6 border-t border-white/5">
                  <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Current Business Context</h3>
                  <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-4 rounded-2xl">
                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center text-[#D4AF37]">
                      {business.logo?.url ? (
                        <img src={business.logo.url} alt={business.name} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{business.name || 'Unnamed Business'}</h4>
                      <p className="text-sm text-white/50">{business.industry || 'No industry set'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
