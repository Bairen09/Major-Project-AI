import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoMark } from '../components/common/Logo';
import { 
  BarChart3, Users, Building2, TrendingUp, ScrollText, 
  Server, LogOut, Menu, ChevronLeft, ChevronRight, Search, BookOpen, Plus, CreditCard
} from 'lucide-react';
import UserProfileDropdown from '../components/dashboard/UserProfileDropdown';
import NotificationBell from '../components/dashboard/NotificationBell';
import CommonFAQ from '../components/common/CommonFAQ';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Double check authorization
  if (user.platformRole !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const navItems = [
    { i: <BarChart3 className="h-5 w-5 flex-shrink-0" />, n: "Dashboard", path: "/admin/dashboard" },
    { i: <Users className="h-5 w-5 flex-shrink-0" />, n: "Users", path: "/admin/users" },
    { i: <Building2 className="h-5 w-5 flex-shrink-0" />, n: "Businesses", path: "/admin/businesses" },
    { i: <CreditCard className="h-5 w-5 flex-shrink-0" />, n: "Subscriptions", path: "/admin/subscriptions" },
    { i: <BookOpen className="h-5 w-5 flex-shrink-0" />, n: "View Blogs", path: "/admin/blogs" },
    { i: <Plus className="h-5 w-5 flex-shrink-0" />, n: "Create Blog", path: "/admin/blogs/new" },
    { i: <TrendingUp className="h-5 w-5 flex-shrink-0" />, n: "Analytics", path: "/admin/analytics" },
    { i: <ScrollText className="h-5 w-5 flex-shrink-0" />, n: "Audit Logs", path: "/admin/audit-logs" },
    { i: <Server className="h-5 w-5 flex-shrink-0" />, n: "Platform", path: "/admin/platform" },
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
          
          {/* Header - Logo */}
          <div className={`flex items-center justify-center mb-6 mt-2 px-2`}>
            <Link to="/" className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'w-8' : 'w-full'} hover:opacity-80 transition-opacity`}>
              <LogoMark className="h-8 w-8 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex flex-col transition-opacity duration-300">
                  <span className="font-display text-base font-bold tracking-tight text-white whitespace-nowrap leading-tight">LocalBoost AI</span>
                  <span className="text-[10px] text-[#D4AF37] font-medium tracking-widest uppercase">Platform Console</span>
                </div>
              )}
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1.5 mt-2">
            {navItems.map(it => {
              const isActive = location.pathname.startsWith(it.path);
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
          
          {/* Bottom Section - Collapse */}
          <div className="pt-4 border-t border-white/5 space-y-4 mt-auto">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              title={isCollapsed ? "Expand" : "Collapse"}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/50 transition hover:bg-white/10 hover:text-white ${isCollapsed ? 'justify-center' : ''}`}
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5 flex-shrink-0 text-white" /> : (
                <>
                  <ChevronLeft className="h-5 w-5 flex-shrink-0" /> 
                  <span className="whitespace-nowrap transition-opacity duration-300">Collapse Menu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden apple-scrollbar relative z-10 flex flex-col">
        
        {/* Top Navbar */}
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-[60] bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5">
          {/* Global Search */}
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition group-focus-within:text-[#D4AF37]" />
              <input
                type="text"
                placeholder="Search Users, Businesses, Posts..."
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-11 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:bg-white/10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-white/10 text-white/50 border border-white/5">⌘</kbd>
                <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-white/10 text-white/50 border border-white/5">K</kbd>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pl-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
               </span>
               Production
             </div>
             <NotificationBell />
             <UserProfileDropdown />
          </div>
        </div>
        
        <div className="p-4 md:p-8 lg:px-12 w-full max-w-[1600px] mx-auto flex-1 flex flex-col">
          <div className="flex-1">
             <Outlet />
          </div>

          <CommonFAQ />
          
          {/* Footer */}
          <footer className="w-full py-8 mt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-white/40">
             <div>LocalBoost AI • Version 1.0 • Production</div>
             <div>© 2026</div>
          </footer>
        </div>
      </main>

    </div>
  );
}
