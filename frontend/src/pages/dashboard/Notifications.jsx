import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Trash2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  const navigate = useNavigate();
  const limit = 20;

  const fetchHistory = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getNotifications(p, limit);
      if (res.data && res.data.data) {
        setNotifications(res.data.data.notifications);
        setTotalPages(res.data.data.pagination.pages);
        setTotal(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

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
        <button 
          onClick={handleMarkAllRead}
          disabled={loading || notifications.length === 0}
          className="btn-glass flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
        >
          <Check className="h-4 w-4" /> Mark all as read
        </button>
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
            {notifications.map((n) => (
              <div 
                key={n._id}
                onClick={() => handleNavigate(n)}
                className={`group relative p-4 sm:p-6 transition-all cursor-pointer flex gap-4 ${!n.isRead ? 'bg-[#D4AF37]/5' : 'hover:bg-white/5'}`}
              >
                {!n.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                )}
                <div className="flex-shrink-0 mt-1">
                  <div className={`p-2 rounded-xl ${!n.isRead ? 'bg-white/10' : 'bg-white/5 group-hover:bg-white/10'} transition`}>
                    {getIconForType(n.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                    <p className={`text-base font-semibold ${!n.isRead ? 'text-white' : 'text-white/80'}`}>
                      {n.title}
                    </p>
                    <span className="text-xs text-white/40 whitespace-nowrap">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-white/60 mt-1 mb-2">
                    {n.message}
                  </p>
                  
                  {n.entityType && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white/70 border border-white/5">
                      {n.entityType}
                    </span>
                  )}
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col sm:flex-row items-center gap-2 self-start ml-2">
                  {!n.isRead && (
                    <button 
                      onClick={(e) => handleMarkAsRead(e, n._id, n.isRead)}
                      className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button 
                    onClick={(e) => handleDelete(e, n._id)}
                    className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
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
