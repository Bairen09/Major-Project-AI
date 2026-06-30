import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Globe, Loader2, Image as ImageIcon } from 'lucide-react';
import { schedulePost } from '../../services/post.service';
import PlatformLogo from '../common/PlatformLogo';

export default function ScheduleModal({ isOpen, onClose, post, businessId, onSuccess }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when opened with a new post
  useEffect(() => {
    if (isOpen && post) {
      if (post.scheduledAt) {
        const d = new Date(post.scheduledAt);
        setDate(d.toISOString().split('T')[0]);
        setTime(d.toTimeString().slice(0, 5));
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split('T')[0]);
        setTime('10:00');
      }
      setError('');
    }
  }, [isOpen, post]);

  if (!isOpen || !post) return null;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleSchedule = async () => {
    if (!date || !time) {
      setError("Please select both date and time.");
      return;
    }

    const scheduledDate = new Date(`${date}T${time}:00`);
    if (scheduledDate <= new Date()) {
      setError("Scheduled time must be in the future.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await schedulePost(businessId, post._id, { scheduledAt: scheduledDate.toISOString() });
      onSuccess(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative glass-strong w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-[#D4AF37]/20 animate-in zoom-in-95 fade-in duration-300 flex flex-col md:flex-row">
        
        {/* Left Side: Form */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold">Schedule Post</h2>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition md:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/80">Select Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 py-3 text-sm outline-none transition focus:border-[#D4AF37]/50 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/80">Select Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                <input 
                  type="time" 
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 py-3 text-sm outline-none transition focus:border-[#D4AF37]/50 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/80">Timezone</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                <input 
                  type="text" 
                  value={timezone}
                  disabled
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 py-3 text-sm text-white/50 cursor-not-allowed"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/80">Platform</label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                <PlatformLogo platform={post.platform} className="h-6 w-6" />
                <span className="text-sm capitalize font-medium">{post.platform}</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex justify-between items-center mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 text-white/50 text-xs">
               <Calendar className="h-4 w-4" />
               {date && time ? new Date(`${date}T${time}:00`).toLocaleString() : 'Select date and time'}
            </div>
          </div>
        </div>

        {/* Right Side: Preview */}
        <div className="flex-1 bg-[#1A1A1A] p-6 sm:p-8 flex flex-col relative border-l border-white/5">
           <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition hidden md:block z-10">
              <X className="h-5 w-5" />
           </button>
           
           <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-medium text-white/60">Post Preview</span>
              <div className="flex items-center gap-1.5">
                  <PlatformLogo platform={post.platform} className="h-4 w-4" />
                  <span className="text-xs font-medium capitalize text-white/80">{post.platform}</span>
              </div>
           </div>

           <div className="flex-1 bg-[#262626] rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
              {post.generatedImage ? (
                <div className="aspect-video bg-black/20 w-full relative group">
                  <img src={post.generatedImage.url} alt="Generated marketing image" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider border border-[#D4AF37]/20 flex items-center gap-1">
                    AI Generated
                  </div>
                </div>
              ) : post.media && post.media.length > 0 ? (
                <div className="aspect-video bg-black/20 w-full relative group">
                  <img src={post.media[0].url} alt="Post media" className="w-full h-full object-cover" />
                  {post.media.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white">
                      +{post.media.length - 1} more
                    </div>
                  )}
                </div>
              ) : post.mediaUrls && post.mediaUrls.length > 0 ? (
                <div className="aspect-video bg-black/20 w-full relative group">
                  <img src={post.mediaUrls[0]} alt="Post media" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-black/20 w-full flex flex-col items-center justify-center border-b border-white/5 text-white/20">
                  <ImageIcon className="h-10 w-10 mb-2" />
                  <span className="text-xs">No media attached</span>
                </div>
              )}
              
              <div className="p-4 flex flex-col flex-1">
                <p className="text-sm text-white/90 whitespace-pre-wrap flex-1">
                  {post.content?.text || post.content}
                </p>
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {post.hashtags.map((tag, i) => (
                      <span key={i} className="text-[#3B82F6] text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
           </div>
           
           <div className="flex items-center justify-between mt-4 text-[10px] text-white/40">
             <span>Characters: {(post.content?.text || post.content).length}</span>
             <span>Hashtags: {post.hashtags?.length || 0}</span>
           </div>

           {/* Mobile Footer Actions */}
           <div className="flex md:hidden justify-end gap-3 mt-8 pt-6 border-t border-white/5">
              <button onClick={onClose} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition flex-1">
                Cancel
              </button>
              <button 
                onClick={handleSchedule}
                disabled={loading}
                className="btn-cta flex-1 flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-[0_5px_15px_-5px_rgba(212,175,55,0.4)] transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Schedule'}
              </button>
           </div>
           
           {/* Desktop Footer Actions */}
           <div className="hidden md:flex justify-end gap-3 mt-8">
              <button onClick={onClose} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition">
                Cancel
              </button>
              <button 
                onClick={handleSchedule}
                disabled={loading}
                className="btn-cta inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold shadow-[0_5px_15px_-5px_rgba(212,175,55,0.4)] transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Schedule Post'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
