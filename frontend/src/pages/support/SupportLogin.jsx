// frontend/src/pages/support/SupportLogin.jsx
// Staff login page at /support/login — completely separate from user login.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { staffLogin } from '../../services/support.service';

export default function SupportLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in as staff
  useEffect(() => {
    if (localStorage.getItem('staffToken')) {
      navigate('/support/inbox');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await staffLogin(form);
      const { token } = res.data.data;
      localStorage.setItem('staffToken', token);
      navigate('/support/inbox');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 mb-4">
            <ShieldCheck className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Support Portal</h1>
          <p className="text-white/50 text-sm mt-2">Sign in with your staff credentials</p>
        </div>

        {/* Form */}
        <form
          id="support-login-form"
          onSubmit={handleSubmit}
          className="space-y-5 p-8 rounded-2xl bg-white/3 border border-white/8"
        >
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-white/70 mb-2 block">Email Address</label>
            <input
              id="support-email-input"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              placeholder="staff@localboost.ai"
              className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/70 mb-2 block">Password</label>
            <div className="relative">
              <input
                id="support-password-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                placeholder="••••••••"
                className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37]/50 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            id="support-login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-white/30 mt-6">
          This portal is for LocalBoost AI support staff only.
        </p>
      </div>
    </div>
  );
}
