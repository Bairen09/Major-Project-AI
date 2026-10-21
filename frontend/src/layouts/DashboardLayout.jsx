import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import { LogoMark } from '../components/common/Logo';
import { BarChart3, Sparkles, Image as ImageIcon, Calendar, TrendingUp, Users, LogOut, Settings, Menu, ChevronLeft, ChevronRight, Bell, BookOpen, Plus, LifeBuoy, ChevronDown, Check } from 'lucide-react';
import NotificationBell from '../components/dashboard/NotificationBell';
import UserProfileDropdown from '../components/dashboard/UserProfileDropdown';
import AIAssistant from '../components/dashboard/AIAssistant';
import CommonFAQ from '../components/common/CommonFAQ';
import TicketChatWidget from '../components/support/TicketChatWidget';
import CreateBusinessModal from '../components/dashboard/CreateBusinessModal';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { businesses, activeBusiness, changeActiveBusiness, refreshBusinesses } = useBusiness();
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  if (user.platformRole === 'BLOGGER') {
    return <Navigate to="/blogger" replace />;
  }

  const navItems = [
    { i: <BarChart3 className="h-5 w-5 flex-shrink-0" />, n: "Overview", path: "/dashboard" },
    { i: <Sparkles className="h-5 w-5 flex-shrink-0" />, n: "AI Generator", path: "/dashboard/generate" },
    { i: <ImageIcon className="h-5 w-5 flex-shrink-0" />, n: "Saved Posts", path: "/dashboard/posts" },
    { i: <Calendar className="h-5 w-5 flex-shrink-0" />, n: "Calendar", path: "/dashboard/calendar" },
    { i: <BookOpen className="h-5 w-5 flex-shrink-0" />, n: "View Blogs", path: "/dashboard/blogs" },
    { i: <Plus className="h-5 w-5 flex-shrink-0" />, n: "Create Blog", path: "/dashboard/blogs/new" },
    { i: <TrendingUp className="h-5 w-5 flex-shrink-0" />, n: "Analytics", path: "/dashboard/analytics" },
    { i: <Bell className="h-5 w-5 flex-shrink-0" />, n: "Notifications", path: "/dashboard/notifications" },
    { i: <Users className="h-5 w-5 flex-shrink-0" />, n: "Team", path: "/dashboard/team" },
    { i: <LifeBuoy className="h-5 w-5 flex-shrink-0" />, n: "Support Tickets", path: "/dashboard/tickets" },
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
          
          {/* Header - Business Switcher */}
          <div className="relative mb-6 mt-2 px-2 z-50">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsBusinessDropdownOpen(!isBusinessDropdownOpen);
              }}
              className={`flex items-center gap-3 w-full hover:opacity-80 transition-all p-2 rounded-xl border border-transparent ${isBusinessDropdownOpen ? 'bg-white/10 border-white/10' : 'hover:bg-white/5'} ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {activeBusiness?.logo?.url ? (
                  <img src={activeBusiness.logo.url} alt="Logo" className="h-8 w-8 rounded-lg object-cover flex-shrink-0 bg-white/5 border border-white/10" />
                ) : (
                  <LogoMark className="h-8 w-8 flex-shrink-0" />
                )}
                {!isCollapsed && <span className="font-display text-base font-bold tracking-tight text-white truncate text-left transition-opacity duration-300">{activeBusiness?.name || "LocalBoost"}</span>}
              </div>
              {!isCollapsed && <ChevronDown className={`h-4 w-4 text-white/50 transition-transform ${isBusinessDropdownOpen ? 'rotate-180' : ''}`} />}
            </button>
            
            {isBusinessDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsBusinessDropdownOpen(false)} />
                <div className={`absolute top-full mt-2 z-50 bg-[#1A1A1E] border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden flex flex-col max-h-[400px] w-[240px] ${isCollapsed ? 'left-full ml-4' : 'left-0'}`}>
                  <div className="px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Switch Business</div>
                  <div className="overflow-y-auto apple-scrollbar flex-1">
                    {businesses.map(b => (
                      <button
                        key={b._id}
                        onClick={() => {
                          changeActiveBusiness(b._id);
                          setIsBusinessDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {b.logo?.url ? (
                            <img src={b.logo.url} alt="" className="h-6 w-6 rounded-md object-cover flex-shrink-0" />
                          ) : (
                            <div className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold">{b.name?.charAt(0)}</span>
                            </div>
                          )}
                          <span className={`text-sm truncate ${activeBusiness?._id === b._id ? 'text-white font-medium' : 'text-white/70 group-hover:text-white'}`}>{b.name}</span>
                        </div>
                        {activeBusiness?._id === b._id && <Check className="h-4 w-4 text-[#D4AF37] flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-white/10 mt-1 p-2">
                    <button 
                      onClick={() => {
                        setIsBusinessDropdownOpen(false);
                        setIsCreateModalOpen(true);
                      }}
                      className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
                    >
                      <div className="h-6 w-6 rounded-md bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/20 transition-colors">
                        <Plus className="h-4 w-4 text-[#D4AF37]" />
                      </div>
                      <span className="font-medium">Create Business</span>
                    </button>
                  </div>
                </div>
              </>
            )}
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
          
          {/* Bottom Section - Plan & Collapse */}
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

      {/* Main Content Area - Scrollable with Apple Scrollbar */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden apple-scrollbar relative z-10 flex flex-col">
        {/* Global Top Bar (Minimal) */}
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 pt-4 flex justify-end items-center sticky top-0 z-[60] bg-transparent pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-4">
            <NotificationBell />
            <UserProfileDropdown />
          </div>
        </div>
        
        <div className="p-4 md:p-8 lg:px-12 w-full max-w-[1600px] mx-auto flex-1 pb-20 mt-[-48px] md:mt-[-56px] z-10 flex flex-col">
          <div className="h-12 md:h-14 w-full" /> {/* Spacer for the floating top bar */}
          <div className="flex-1">
            <Outlet />
          </div>
          <CommonFAQ />
        </div>
      </main>

      <AIAssistant />
      <TicketChatWidget />
      <CreateBusinessModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refreshBusinesses();
        }}
      />
    </div>
  );
}
