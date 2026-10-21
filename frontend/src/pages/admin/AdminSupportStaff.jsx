// frontend/src/pages/admin/AdminSupportStaff.jsx
// Superadmin page to create, list, activate/suspend, and delete staff accounts.

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Plus, X, Loader2, CheckCircle2, XCircle, Trash2, UserPlus
} from 'lucide-react';
import {
  createStaffAccount, listStaffAccounts, updateStaffAccountStatus, deleteStaffAccount,
} from '../../services/support.service';

export default function AdminSupportStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'support' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await listStaffAccounts();
      setStaff(res.data.data.staff || []);
    } catch {
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    setCreating(true);
    try {
      await createStaffAccount(form);
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', role: 'support' });
      fetchStaff();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create staff account.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await updateStaffAccountStatus(id, !isActive);
      fetchStaff();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently remove this staff account?')) return;
    try {
      await deleteStaffAccount(id);
      fetchStaff();
    } catch {}
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Support Staff</h1>
          <p className="text-white/40 text-sm mt-1">Manage tech support team members</p>
        </div>
        <button
          id="create-staff-btn"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-black font-bold rounded-xl hover:brightness-110 transition-all text-sm"
        >
          <UserPlus className="h-4 w-4" />
          Add Staff
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111114] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-white text-lg">Create Staff Account</h2>
              <button onClick={() => setShowCreate(false)}>
                <X className="h-5 w-5 text-white/50 hover:text-white" />
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
            )}

            <div className="space-y-4">
              {['name', 'email', 'password'].map(field => (
                <div key={field}>
                  <label className="text-xs font-medium text-white/60 mb-1.5 block capitalize">{field}</label>
                  <input
                    id={`create-staff-${field}`}
                    type={field === 'password' ? 'password' : 'text'}
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={field === 'email' ? 'staff@email.com' : ''}
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-white/60 mb-1.5 block">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="support">Support</option>
                  <option value="lead_support">Lead Support</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                id="create-staff-submit"
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {creating ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-20">
          <ShieldCheck className="h-16 w-16 mx-auto text-white/10 mb-4" />
          <p className="text-white/40 text-sm">No staff accounts yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/2">
                <th className="text-left px-5 py-3.5 font-medium text-white/50">Name</th>
                <th className="text-left px-5 py-3.5 font-medium text-white/50">Email</th>
                <th className="text-left px-5 py-3.5 font-medium text-white/50">Role</th>
                <th className="text-left px-5 py-3.5 font-medium text-white/50">Status</th>
                <th className="text-left px-5 py-3.5 font-medium text-white/50">Assigned</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {staff.map((s, i) => (
                <tr key={s._id} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/1' : ''} hover:bg-white/3 transition-colors`}>
                  <td className="px-5 py-3.5 font-medium text-white">{s.name}</td>
                  <td className="px-5 py-3.5 text-white/60">{s.email}</td>
                  <td className="px-5 py-3.5 text-white/60 capitalize">{s.role.replace('_', ' ')}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${
                      s.isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {s.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-white/60">{s.assignedTicketCount ?? 0}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleToggleActive(s._id, s.isActive)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                          s.isActive
                            ? 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10'
                            : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {s.isActive ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="text-red-400/60 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
