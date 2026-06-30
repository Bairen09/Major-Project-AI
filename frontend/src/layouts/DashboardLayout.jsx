import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { getBusinesses } from '../services/business.service';
import { useAuth } from '../context/AuthContext';
import { LogoMark } from '../components/common/Logo';
import { BarChart3, Sparkles, Image as ImageIcon, Calendar, TrendingUp, Users, LogOut, Settings, Menu, ChevronLeft, Bell } from 'lucide-react';
import NotificationBell from '../components/dashboard/NotificationBell';
import AIAssistant from '../components/dashboard/AIAssistant';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    if (user) {
      getBusinesses().then(res => {
        if (res.data.data && res.data.data.length > 0) {
          setBusiness(res.data.data[0]);
        }
      }).catch(err => console.error(err));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.platformRole === 'SUPER_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const navItems = [
    { i: <BarChart3 className="h-5 w-5 flex-shrink-0" />, n: "Overview", path: "/dashboard" },
    { i: <Sparkles className="h-5 w-5 flex-shrink-0" />, n: "AI Generator", path: "/dashboard/generate" },
    { i: <ImageIcon className="h-5 w-5 flex-shrink-0" />, n: "Saved Posts", path: "/dashboard/posts" },
    { i: <Calendar className="h-5 w-5 flex-shrink-0" />, n: "Calendar", path: "/dashboard/calendar" },
    { i: <TrendingUp className="h-5 w-5 flex-shrink-0" />, n: "Analytics", path: "/dashboard/analytics" },
    { i: <Bell className="h-5 w-5 flex-shrink-0" />, n: "Notifications", path: "/dashboard/notifications" },
    { i: <Users className="h-5 w-5 flex-shrink-0" />, n: "Team", path: "/dashboard/team" },
    { i: <Settings className="h-5 w-5 flex-shrink-0" />, n: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0B] text-white overflow-hidden relative">
      
      {/* Global background glow for dashboard */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#D4AF37] blur-[160px]" />
      </div>

      {/* Sidebar - Sticky & Collapsible */}
      <aside className={`relative z-20 flex-shrink-0 transition-all duration-300 ease-in-out border-r border-white/5 bg-[#111114]/80 backdrop-blur-xl flex flex-col ${isCollapsed ? 'w-[80px]' : 'w-[260px]'}`}>
        <div className="flex flex-col flex-1 p-4 overflow-y-auto apple-scrollbar">
          
          {/* Header */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-8 mt-2 px-2`}>
            <Link to="/" className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'w-8' : 'w-auto'} hover:opacity-80 transition-opacity`}>
              {business?.logo?.url ? (
                <img src={business.logo.url} alt="Logo" className="h-8 w-8 rounded-lg object-cover flex-shrink-0 bg-white/5 border border-white/10" />
              ) : (
                <LogoMark className="h-8 w-8 flex-shrink-0" />
              )}
              {!isCollapsed && <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap transition-opacity duration-300">{business?.name || "LocalBoost"}</span>}
            </Link>
            {!isCollapsed && (
              <button onClick={() => setIsCollapsed(true)} className="p-1.5 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Toggle button when collapsed */}
          {isCollapsed && (
            <div className="flex justify-center mb-6">
              <button onClick={() => setIsCollapsed(false)} className="p-2 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Nav Items */}
          <nav className="flex-1 space-y-1.5">
            {navItems.map(it => {
              const isActive = location.pathname === it.path;
              return (
                <Link 
                  key={it.n} 
                  to={it.path} 
                  title={isCollapsed ? it.n : ""}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${isActive ? "bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-[#F5D77A]" : "text-muted-foreground hover:bg-white/5 hover:text-white"} ${isCollapsed ? 'justify-center' : ''}`}
                >
                  {it.i} 
                  {!isCollapsed && <span className="whitespace-nowrap transition-opacity duration-300">{it.n}</span>}
                </Link>
              )
            })}
          </nav>
          
          {/* Bottom Section */}
          <div className="pt-4 border-t border-white/5 space-y-4 mt-auto">
            {!isCollapsed && (
              <div className="bg-[#1a1612]/50 p-4 rounded-xl border border-[#D4AF37]/10 transition-opacity duration-300">
                <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Current Plan</p>
                <p className="text-sm font-bold text-white/90">Starter</p>
                <button className="w-full mt-3 rounded-lg bg-[#D4AF37] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#F5D77A] transition-colors">
                  Upgrade Plan
                </button>
              </div>
            )}

            <Link to="/dashboard/profile" className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-2'} pt-2 hover:bg-white/5 p-2 rounded-xl transition-colors cursor-pointer group`}>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20 text-sm font-bold text-[#D4AF37] border border-[#D4AF37]/30 overflow-hidden group-hover:border-[#D4AF37]/50 transition-colors" title={isCollapsed ? user?.name : ""}>
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase()
                )}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col flex-1 overflow-hidden transition-opacity duration-300">
                  <span className="text-sm font-medium text-white/90 truncate group-hover:text-[#D4AF37] transition-colors">{user?.name}</span>
                  <span className="text-xs text-white/50 truncate">{user?.email}</span>
                </div>
              )}
            </Link>

            <button 
              onClick={handleLogout} 
              title={isCollapsed ? "Logout" : ""}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/50 transition hover:bg-red-500/10 hover:text-red-400 ${isCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" /> 
              {!isCollapsed && <span className="whitespace-nowrap transition-opacity duration-300">Logout</span>}
            </button>
          </div>

        </div>
      </aside>

      {/* Main Content Area - Scrollable with Apple Scrollbar */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden apple-scrollbar relative z-10 flex flex-col">
        {/* Global Top Bar (Minimal) */}
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 pt-4 flex justify-end items-center sticky top-0 z-[60] bg-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <NotificationBell />
          </div>
        </div>
        
        <div className="p-4 md:p-8 lg:px-12 w-full max-w-[1600px] mx-auto flex-1 pb-20 mt-[-48px] md:mt-[-56px] z-10">
          <div className="h-12 md:h-14 w-full" /> {/* Spacer for the floating top bar */}
          <Outlet />
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}
