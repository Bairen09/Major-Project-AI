import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Trash2, Check, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../services/notification.service';

const getIconForType = (type) => {
  switch (type) {
    case 'success': return <CheckCircle className="h-6 w-6 text-green-400" />;
    case 'warning': return <AlertTriangle className="h-6 w-6 text-yellow-400" />;
    case 'error': return <XCircle className="h-6 w-6 text-red-400" />;
    default: return <Info className="h-6 w-6 text-blue-400" />;
  }
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return date.toLocaleDateString();
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();
  const limit = 10;

  const fetchHistory = async (p = 1, status = 'all', searchQuery = '') => {
    setLoading(true);
    try {
      const res = await getNotifications(p, limit, status, searchQuery);
      if (res.data && res.data.data) {
        setNotifications(res.data.data.notifications);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotal(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHistory(page, activeTab, search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [page, activeTab, search]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setExpandedId(null);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
    setExpandedId(null);
  };

  const handleMarkAsRead = async (e, id, isRead) => {
    e.stopPropagation();
    if (isRead) return;
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigate = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead({ stopPropagation: () => {} }, notification._id, false);
    }
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

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">Notifications</h1>
          <p className="text-white/60 mt-1">Stay updated with your business activities.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => handleTabChange('all')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-white/60 hover:text-white'}`}
            >
              All
            </button>
            <button 
              onClick={() => handleTabChange('unread')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'unread' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-white/60 hover:text-white'}`}
            >
              Unread
            </button>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition group-focus-within:text-[#D4AF37]" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search notifications..."
              className="w-full sm:w-64 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:bg-white/10"
            />
          </div>

          <button 
            onClick={handleMarkAllRead}
            disabled={loading || notifications.length === 0}
            className="btn-glass flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 whitespace-nowrap"
          >
            <Check className="h-4 w-4" /> Mark all as read
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
        {loading ? (
          <div className="p-12 flex justify-center">
             <div className="animate-pulse rounded-full h-12 w-12 border-t-2 border-[#D4AF37] border-solid" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center text-white/50">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-display text-white mb-2">You're all caught up!</h3>
            <p className="text-sm">No notifications found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((n) => {
              const isExpanded = expandedId === n._id;
              return (
                <div 
                  key={n._id}
                  onClick={() => {
                    setExpandedId(isExpanded ? null : n._id);
                    if (!n.isRead) handleMarkAsRead({ stopPropagation: () => {} }, n._id, false);
                  }}
                  className={`group relative p-4 sm:p-6 transition-all cursor-pointer flex gap-4 ${!n.isRead ? 'bg-[#1a1612] border-l-4 border-l-[#D4AF37]' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className={`p-2 rounded-xl ${!n.isRead ? 'bg-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-white/5 group-hover:bg-white/10'} transition`}>
                      {getIconForType(n.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                      <p className={`text-base font-bold ${!n.isRead ? 'text-white' : 'text-white/80'}`}>
                        {n.title}
                      </p>
                      <span className={`text-xs whitespace-nowrap ${!n.isRead ? 'text-[#D4AF37]/80 font-bold' : 'text-white/40'}`}>
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                    
                    {/* Collapsed View Message Snippet */}
                    {!isExpanded && (
                       <p className="text-sm text-white/60 mt-1 line-clamp-1">
                         {n.message}
                       </p>
                    )}

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className="mt-4 animate-in slide-in-from-top-2 fade-in duration-200">
                        <p className="text-sm text-white/80 bg-black/40 p-4 rounded-xl border border-white/5 leading-relaxed">
                          {n.message}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-4">
                          {n.entityType && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigate(n);
                              }}
                              className="px-4 py-2 bg-white/10 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] text-white/80 border border-white/10 hover:border-[#D4AF37]/30 text-xs font-bold rounded-lg transition"
                            >
                              View Details
                            </button>
                          )}
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/50 border border-white/5 uppercase tracking-wider">
                            {n.type}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={`${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex flex-col sm:flex-row items-center gap-2 self-start ml-2`}>
                    {!n.isRead && (
                      <button 
                        onClick={(e) => handleMarkAsRead(e, n._id, n.isRead)}
                        className="p-2 text-white/50 hover:text-white hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] rounded-xl transition tooltip"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button 
                      onClick={(e) => handleDelete(e, n._id)}
                      className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition tooltip"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!loading && total > 0 && (
        <div className="flex items-center justify-between glass px-6 py-4 rounded-2xl border border-white/5 mt-6">
          <p className="text-sm text-white/60">
            Showing <span className="text-white font-medium">{(page - 1) * limit + 1}</span> to <span className="text-white font-medium">{Math.min(page * limit, total)}</span> of <span className="text-white font-medium">{total}</span> notifications
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 glass rounded-lg hover:bg-white/10 disabled:opacity-30 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 glass rounded-lg hover:bg-white/10 disabled:opacity-30 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
