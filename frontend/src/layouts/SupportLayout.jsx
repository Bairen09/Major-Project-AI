// frontend/src/layouts/SupportLayout.jsx
// Minimal layout for support staff portal — mirrors BloggerLayout pattern.

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox, BarChart2, LogOut, ShieldCheck } from 'lucide-react';
import { staffGetMe } from '../services/support.service';

export default function SupportLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    staffGetMe()
      .then(res => setStaff(res.data.data.staff))
      .catch(() => {
        localStorage.removeItem('staffToken');
        navigate('/support/login');
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    navigate('/support/login');
  };

  const navLinks = [
    { to: '/support/inbox', icon: Inbox, label: 'Inbox' },
    { to: '/support/stats', icon: BarChart2, label: 'My Stats' },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#111114] border-r border-white/8 flex flex-col">
        {/* Logo area */}
        <div className="px-6 py-5 border-b border-white/8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#D4AF37]" />
            <span className="font-display font-bold text-white text-base">Support Portal</span>
          </div>
          {staff && (
            <p className="text-xs text-white/40 mt-1 truncate">{staff.name}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(to)
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/8">
          <button
            id="support-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 h-screen overflow-y-auto apple-scrollbar">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
