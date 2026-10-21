import React, { useState } from 'react';
import { X, UserPlus, Mail, Lock, Shield, Loader2 } from 'lucide-react';
import { createAdminUser } from '../../services/admin.service';
import { toast } from 'sonner';

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    platformRole: 'BLOGGER'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAdminUser(formData);
      toast.success('User created successfully');
      setFormData({ name: '', email: '', password: '', platformRole: 'BLOGGER' });
      onUserCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#111114] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg">
              <UserPlus className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Create New User</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative group">
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#D4AF37] transition-colors" />
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe" 
                className="w-full rounded-xl bg-black/40 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white outline-none transition focus:border-[#D4AF37]/50 focus:bg-white/5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#D4AF37] transition-colors" />
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com" 
                className="w-full rounded-xl bg-black/40 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white outline-none transition focus:border-[#D4AF37]/50 focus:bg-white/5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
              Temporary Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#D4AF37] transition-colors" />
              <input 
                type="password" 
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters" 
                className="w-full rounded-xl bg-black/40 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white outline-none transition focus:border-[#D4AF37]/50 focus:bg-white/5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
              Platform Role
            </label>
            <div className="relative group">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-[#D4AF37] transition-colors" />
              <select 
                name="platformRole"
                required
                value={formData.platformRole}
                onChange={handleChange}
                className="w-full rounded-xl bg-black/40 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white outline-none transition focus:border-[#D4AF37]/50 focus:bg-white/5 appearance-none"
              >
                <option value="USER">Standard User</option>
                <option value="BLOGGER">Platform Blogger</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
            <button 
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#D4AF37] hover:bg-[#F5D77A] text-black px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
