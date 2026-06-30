import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Trash2, Check, ExternalLink, X } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../../services/notification.service';

const getIconForType = (type) => {
  switch (type) {
    case 'success': return <CheckCircle className="h-5 w-5 text-green-400" />;
    case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    case 'error': return <XCircle className="h-5 w-5 text-red-400" />;
    default: return <Info className="h-5 w-5 text-blue-400" />;
  }
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      if (res.data && res.data.data) {
        setUnreadCount(res.data.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  const fetchLatest = async () => {
    setLoading(true);
    try {
      const res = await getNotifications(1, 10);
      if (res.data && res.data.data) {
        setNotifications(res.data.data.notifications);
        setTotal(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile]);

  const toggleOpen = () => {
    if (!isOpen) {
      fetchLatest();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (e, id, isRead) => {
    e.stopPropagation();
    if (isRead) return;
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      const notif = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setTotal(prev => prev - 1);
      if (notif && !notif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigate = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead({ stopPropagation: () => {} }, notification._id, false);
    }
    setIsOpen(false);
    
    if (!notification.entityType) return;
    
    switch (notification.entityType) {
      case 'Post':
        navigate('/dashboard/posts');
        break;
      case 'Business':
        navigate('/dashboard/settings');
        break;
      case 'PromptHistory':
        navigate('/dashboard/generate');
        break;
      default:
        break;
    }
  };

  const renderContent = () => (
    <div className="flex flex-col h-full max-h-[85vh] md:max-h-[500px]">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-display font-semibold text-white">
          Unread ({unreadCount})
        </h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="text-xs text-[#D4AF37] hover:text-[#F5D77A] transition flex items-center gap-1 font-medium"
            >
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
          {isMobile && (
            <button onClick={() => setIsOpen(false)} className="p-1 text-white/50 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto apple-scrollbar p-2">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-pulse rounded-full h-8 w-8 border-t-2 border-[#D4AF37] border-solid" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-white/50">
            <Bell className="h-8 w-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((n) => (
              <div 
                key={n._id}
                onClick={() => handleNavigate(n)}
                className={`group relative p-3 rounded-xl transition-all cursor-pointer flex gap-3 ${!n.isRead ? 'bg-[#D4AF37]/5 border border-[#D4AF37]/20' : 'hover:bg-white/5 border border-transparent'}`}
              >
                {!n.isRead && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#D4AF37] rounded-r-full shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                )}
                <div className="flex-shrink-0 mt-0.5">
                  {getIconForType(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className={`text-sm font-medium truncate ${!n.isRead ? 'text-white' : 'text-white/80'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-white/40 whitespace-nowrap pt-0.5">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 line-clamp-2 mt-0.5">
                    {n.message}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 pl-1">
                  <button 
                    onClick={(e) => handleDelete(e, n._id)}
                    className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {!n.isRead && (
                    <button 
                      onClick={(e) => handleMarkAsRead(e, n._id, n.isRead)}
                      className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition"
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/10 flex items-center justify-between bg-black/20">
        <Link 
          to="/dashboard/notifications" 
          onClick={() => setIsOpen(false)}
          className="text-xs font-medium text-white/70 hover:text-white transition flex items-center gap-1.5"
        >
          View all notifications <ExternalLink className="h-3 w-3" />
        </Link>
        {total > 10 && (
          <span className="text-[10px] text-white/40">...and {total - 10} more</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleOpen}
        className="glass relative h-10 w-10 flex items-center justify-center rounded-xl transition hover:bg-white/10 hover:text-white text-white/70 shadow-sm"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-[0_0_10px_rgba(212,175,55,0.4)] border border-black">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Desktop Dropdown */}
      {!isMobile && isOpen && (
        <div className="absolute right-0 mt-3 w-80 glass-strong border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2 fade-in duration-200">
          {renderContent()}
        </div>
      )}

      {/* Mobile Bottom Sheet/Modal */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full sm:max-w-sm bg-[#0A0A0B]/95 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
}
