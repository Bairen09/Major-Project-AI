import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full hover:bg-white/10 p-1 pr-3 transition-colors border border-transparent hover:border-white/10"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/20 text-sm font-bold text-[#D4AF37] border border-[#D4AF37]/30 overflow-hidden">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user?.name?.charAt(0)?.toUpperCase()
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-white/70" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#111114] shadow-xl backdrop-blur-xl z-50 p-2 py-2">
          <div className="px-3 py-2 border-b border-white/10 mb-2">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-white/50 truncate">{user?.email}</p>
          </div>
          
          <Link 
            to={user?.platformRole === 'SUPER_ADMIN' ? '/admin/platform' : '/dashboard/profile'}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full"
            onClick={() => setIsOpen(false)}
          >
            <User className="h-4 w-4" />
            Profile Settings
          </Link>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full mt-1 font-medium"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
