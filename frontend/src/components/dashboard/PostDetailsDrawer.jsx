import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, Trash2, Edit2, Files, CalendarX2, Loader2, Image as ImageIcon } from 'lucide-react';
import { unschedulePost, deletePost, duplicatePost } from '../../services/post.service';
import { Link } from 'react-router-dom';
import PlatformLogo from '../common/PlatformLogo';

export default function PostDetailsDrawer({ isOpen, onClose, post, businessId, onSuccess }) {
  const [loadingAction, setLoadingAction] = useState(null);

  if (!isOpen || !post) return null;

  const handleUnschedule = async () => {
    setLoadingAction('unschedule');
    try {
      await unschedulePost(businessId, post.id || post._id);
      onSuccess();
    } catch (err) {
      alert("Failed to unschedule post.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this scheduled post?")) return;
    setLoadingAction('delete');
    try {
      await deletePost(businessId, post.id || post._id);
      onSuccess();
    } catch (err) {
      alert("Failed to delete post.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDuplicate = async () => {
    setLoadingAction('duplicate');
    try {
      await duplicatePost(businessId, post.id || post._id);
      alert("Post duplicated as a draft in your Saved Posts!");
      onSuccess();
    } catch (err) {
      alert("Failed to duplicate post.");
    } finally {
      setLoadingAction(null);
    }
  };
  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md h-full glass-strong shadow-2xl border-l border-[#D4AF37]/20 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="font-display text-xl font-bold">Post Details</h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 apple-scrollbar">
          
          <div>
            <div className="flex items-center gap-3 mb-4">
               <PlatformLogo platform={post.platform} className="h-8 w-8 rounded-lg" />
               <span className="text-sm font-medium capitalize">{post.platform}</span>
               <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 border border-blue-400/20 ml-auto">
                 Scheduled
               </span>
            </div>
            
            <h3 className="font-bold text-lg mb-2">{post.title || 'Untitled Post'}</h3>
            
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <CalendarIcon className="h-4 w-4" />
              {new Date(post.scheduledAt).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm mt-2">
              <Clock className="h-4 w-4" />
              {new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
            </div>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
             {post.mediaUrls && post.mediaUrls.length > 0 ? (
               <div className="aspect-video bg-black/20 w-full relative">
                 <img src={post.mediaUrls[0]} alt="Post media" className="w-full h-full object-cover" />
               </div>
             ) : (
               <div className="aspect-video bg-black/20 w-full flex flex-col items-center justify-center border-b border-white/5 text-white/20">
                 <ImageIcon className="h-10 w-10 mb-2" />
                 <span className="text-xs">No media attached</span>
               </div>
             )}
             <div className="p-4">
               <p className="text-sm text-white/90 whitespace-pre-wrap">{post.content?.text || post.content}</p>
               {post.hashtags && post.hashtags.length > 0 && (
                 <div className="mt-3 flex flex-wrap gap-1">
                   {post.hashtags.map((tag, i) => (
                     <span key={i} className="text-[#3B82F6] text-xs font-medium">{tag}</span>
                   ))}
                 </div>
               )}
             </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 grid grid-cols-2 gap-3 bg-black/20 backdrop-blur-md">
          <Link 
            to="/dashboard/posts"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition text-white/80"
          >
            <Edit2 className="h-4 w-4" /> Edit in Library
          </Link>
          
          <button 
            onClick={handleDuplicate}
            disabled={loadingAction !== null}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition text-white/80 disabled:opacity-50"
          >
            {loadingAction === 'duplicate' ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Files className="h-4 w-4" /> Duplicate</>}
          </button>
          
          <button 
            onClick={handleUnschedule}
            disabled={loadingAction !== null}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-xs font-bold transition text-orange-400 disabled:opacity-50"
          >
            {loadingAction === 'unschedule' ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CalendarX2 className="h-4 w-4" /> Unschedule</>}
          </button>

          <button 
            onClick={handleDelete}
            disabled={loadingAction !== null}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold transition text-red-500 disabled:opacity-50"
          >
            {loadingAction === 'delete' ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4" /> Delete</>}
          </button>
        </div>

      </div>
    </div>
  );
}
