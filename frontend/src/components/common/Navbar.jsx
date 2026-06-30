import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Layers, X } from 'lucide-react';
import { Logo } from './Logo';
import { NAV_LINKS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto mt-4 max-w-7xl px-4">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-4 py-3 md:px-6">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map(l => {
              const path = `/${l.toLowerCase().replace(/\s+/g, "-")}`;
              const isActive = location.pathname === path;
              return (
                <Link key={l} to={path} className={`text-sm transition-colors hover:text-white ${isActive ? 'text-white font-semibold' : 'text-muted-foreground'}`}>
                  {l}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {!user ? (
              <>
                <Link to="/login" className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition hover:text-white">Login</Link>
                <Link to="/register" className="btn-cta group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold">
                  Start Free Trial <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition hover:text-white">Dashboard</Link>
                <button onClick={logout} className="btn-cta group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold">
                  Logout <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </button>
              </>
            )}
          </div>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-6 w-6 text-white" /> : <Layers className="h-6 w-6 text-white" />}
          </button>
        </div>
        {open && (
          <div className="glass-strong mt-2 flex flex-col gap-2 rounded-2xl p-4 md:hidden">
            {NAV_LINKS.map(l => {
              const path = `/${l.toLowerCase().replace(/\s+/g, "-")}`;
              const isActive = location.pathname === path;
              return (
                <Link key={l} to={path} className={`rounded-lg px-3 py-2 hover:bg-white/5 ${isActive ? 'text-[#D4AF37] font-semibold bg-white/5' : 'text-white'}`} onClick={() => setOpen(false)}>
                  {l}
                </Link>
              );
            })}
            {!user ? (
              <Link to="/register" className="btn-cta mt-2 rounded-xl px-5 py-3 text-sm font-semibold text-center" onClick={() => setOpen(false)}>
                Start Free Trial
              </Link>
            ) : (
              <button onClick={() => { logout(); setOpen(false); }} className="btn-cta mt-2 rounded-xl px-5 py-3 text-sm font-semibold text-center">
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
