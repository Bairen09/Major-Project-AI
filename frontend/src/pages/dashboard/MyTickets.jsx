// frontend/src/pages/dashboard/MyTickets.jsx
// User's ticket management page in the dashboard.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Clock, CheckCircle2, MessageSquare, ChevronRight, Plus } from 'lucide-react';
import { listMyTickets } from '../../services/ticket.service';

const STATUS_STYLES = {
  OPEN: { label: 'Open', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  PENDING_USER: { label: 'Awaiting You', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  RESOLVED: { label: 'Resolved', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  CLOSED: { label: 'Closed', cls: 'bg-white/10 text-white/50 border-white/10' },
};

const FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'PENDING_USER', 'RESOLVED', 'CLOSED'];

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (filter !== 'ALL') params.status = filter;
        const res = await listMyTickets(params);
        setTickets(res.data.data.tickets || []);
        setPagination(res.data.data.pagination || {});
      } catch {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filter, page]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Support Tickets</h1>
          <p className="text-white/50 text-sm mt-1">Track and manage your support requests</p>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('openTicketChat', { detail: 'NEW' }))}
          id="open-new-ticket-btn"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-black font-bold rounded-xl hover:brightness-110 transition-all text-sm"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              filter === f
                ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-pulse rounded-full h-10 w-10 border-t-2 border-[#D4AF37]" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20">
          <Ticket className="h-16 w-16 mx-auto text-white/10 mb-4" />
          <h3 className="text-xl font-bold text-white/50 mb-2">No tickets found</h3>
          <p className="text-white/30 text-sm">Open a new ticket from the support widget at the bottom right.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const style = STATUS_STYLES[ticket.status] || STATUS_STYLES.OPEN;
            return (
              <div
                key={ticket._id}
                className="group p-5 rounded-2xl bg-white/3 border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.cls}`}>
                        {style.label}
                      </span>
                      <span className="text-xs text-white/40">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(ticket.lastActivityAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm">{ticket.header}</h3>
                    <p className="text-white/50 text-xs mt-1 truncate">{ticket.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      // Trigger the widget open with this ticket — simplest: just alert with ID for now
                      // A full implementation would open the widget and call openTicketChat(ticket._id)
                      window.dispatchEvent(new CustomEvent('openTicketChat', { detail: ticket._id }));
                    }}
                    className="shrink-0 h-9 w-9 rounded-xl bg-white/5 hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50 border border-white/10 flex items-center justify-center transition-all"
                  >
                    <ChevronRight className="h-4 w-4 text-white/60 group-hover:text-[#D4AF37] transition-colors" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 disabled:opacity-30 transition-all"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-white/50">
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 disabled:opacity-30 transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
