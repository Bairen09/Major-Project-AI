import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, ArrowLeft } from 'lucide-react';
import { getBusinesses, getCalendar } from '../../services/business.service';
import PostDetailsDrawer from '../../components/dashboard/PostDetailsDrawer';
import PlatformLogo from '../../components/common/PlatformLogo';
import { Link, useNavigate } from 'react-router-dom';

export default function Calendar() {
  const [business, setBusiness] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const { data: { data: businesses } } = await getBusinesses();
      if (businesses && businesses.length > 0) {
        const activeBusiness = businesses[0];
        setBusiness(activeBusiness);
        const res = await getCalendar(activeBusiness._id);
        setEvents(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch calendar", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  // Create grid cells
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventsForDay = (day) => {
    return events.filter(event => {
      const date = new Date(event.scheduledAt);
      return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
    }).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse rounded-full h-12 w-12 border-t-2 border-[#D4AF37] border-solid" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition">
             <ArrowLeft className="h-5 w-5" />
          </button>
          {business?.logo?.url && (
             <img src={business.logo.url} alt="Logo" className="h-10 w-10 rounded-xl object-cover border border-white/10 bg-white/5" />
          )}
          <div>
            <h1 className="font-display text-2xl font-bold">Calendar</h1>
            <p className="text-sm text-muted-foreground mt-1">View and manage your scheduled posts.</p>
          </div>
        </div>
        <Link to="/dashboard/generate" className="btn-cta inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-[0_5px_15px_-5px_rgba(212,175,55,0.4)] transition hover:-translate-y-0.5">
           <Sparkles className="h-4 w-4" /> Schedule Post
        </Link>
      </div>

      <div className="glass rounded-2xl border border-white/5 flex-1 flex flex-col overflow-hidden">
        {/* Calendar Header Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div className="flex items-center gap-2">
             <div className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-bold border border-[#D4AF37]/20 flex items-center gap-2">
               <CalendarIcon className="h-4 w-4" /> Month View
             </div>
           </div>
           
           <div className="flex items-center gap-4">
             <button onClick={prevMonth} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition">
               <ChevronLeft className="h-5 w-5" />
             </button>
             <h2 className="font-display text-xl font-bold min-w-[160px] text-center">
               {monthNames[month]} {year}
             </h2>
             <button onClick={nextMonth} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition">
               <ChevronRight className="h-5 w-5" />
             </button>
             
             <div className="w-px h-6 bg-white/10 mx-2"></div>
             
             <button onClick={goToToday} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition text-white/80">
               Today
             </button>
           </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-white/50 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-[minmax(120px,1fr)] overflow-y-auto apple-scrollbar bg-white/[0.01]">
          {blanks.map(blank => (
            <div key={`blank-${blank}`} className="border-b border-r border-white/5 p-2 bg-white/[0.01]"></div>
          ))}
          
          {days.map(day => {
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
            const dayEvents = getEventsForDay(day);
            
            return (
              <div key={day} className={`border-b border-r border-white/5 p-1 sm:p-2 flex flex-col min-h-[100px] transition-colors hover:bg-white/[0.03] ${isToday ? 'bg-[#D4AF37]/5' : ''}`}>
                <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-[#D4AF37] text-black' : 'text-white/60'}`}>
                  {day}
                </div>
                <div className="flex-1 space-y-1 overflow-y-auto apple-scrollbar pr-1">
                  {dayEvents.map((event, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedPost(event)}
                      className="w-full text-left px-2 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 flex flex-col gap-1 transition-all group"
                    >
                       <div className="flex items-center gap-1.5 text-blue-400">
                         <PlatformLogo platform={event.platform} className="h-3 w-3 flex-shrink-0" />
                         <span className="text-[10px] font-bold">{new Date(event.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                       <span className="text-xs text-white/90 truncate font-medium group-hover:text-white transition-colors">{event.title || 'Untitled Post'}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PostDetailsDrawer 
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
        businessId={business?._id}
        onSuccess={() => {
          setSelectedPost(null);
          fetchCalendarData();
        }}
      />
    </div>
  );
}
