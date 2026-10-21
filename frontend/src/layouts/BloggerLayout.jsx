import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoMark } from '../components/common/Logo';
import { BookOpen, Settings, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import UserProfileDropdown from '../components/dashboard/UserProfileDropdown';
import NotificationBell from '../components/dashboard/NotificationBell';
import CommonFAQ from '../components/common/CommonFAQ';

export default function BloggerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // We mock a business object representing the LocalBoost platform
    // So any child component expecting context has the base info.
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.platformRole !== 'BLOGGER') {
    return <Navigate to="/dashboard" replace />;
  }

  const navItems = [
    { i: <BookOpen className="h-5 w-5 flex-shrink-0" />, n: "Platform Blogs", path: "/blogger/blogs" },
    { i: <Plus className="h-5 w-5 flex-shrink-0" />, n: "Create Blog", path: "/blogger/new" },
    { i: <Settings className="h-5 w-5 flex-shrink-0" />, n: "Settings", path: "/blogger/settings" },
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
              {!isCollapsed && <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap transition-opacity duration-300">LocalBoost Platform</span>}
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1.5 mt-2">
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
          
          {/* Bottom Section - Collapse */}
          <div className="pt-4 border-t border-white/5 space-y-4 mt-auto">
            {!isCollapsed && (
              <div className="bg-[#1a1612]/50 p-4 rounded-xl border border-[#D4AF37]/10 transition-opacity duration-300">
                <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Role</p>
                <p className="text-sm font-bold text-[#D4AF37]">Platform Blogger</p>
              </div>
            )}

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
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 pt-4 flex justify-end items-center sticky top-0 z-[60] bg-transparent pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-4">
            <NotificationBell />
            <UserProfileDropdown />
          </div>
        </div>
        
        <div className="p-4 md:p-8 lg:px-12 w-full max-w-[1600px] mx-auto flex-1 pb-20 mt-[-48px] md:mt-[-56px] z-10 flex flex-col">
          <div className="h-12 md:h-14 w-full" /> 
          <div className="flex-1">
            <Outlet />
          </div>
          <CommonFAQ />
        </div>
      </main>
    </div>
  );
}
