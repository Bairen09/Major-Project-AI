// frontend/src/pages/support/SupportInbox.jsx
// Staff ticket queue — filter by status/assignee, open thread to reply.

import React, { useState, useEffect, useRef } from 'react';
import {
  Inbox, Clock, Send, Loader2, UserCheck, ChevronDown,
} from 'lucide-react';
import {
  listSupportTickets, getSupportTicketById,
  assignTicket, updateTicketStatus, sendStaffMessage,
} from '../../services/support.service';

const STATUS_STYLES = {
  OPEN: { label: 'Open', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  PENDING_USER: { label: 'Pending User', cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  RESOLVED: { label: 'Resolved', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  CLOSED: { label: 'Closed', cls: 'bg-white/10 text-white/50 border-white/10' },
};

const STAFF_NEXT_STATUSES = ['IN_PROGRESS', 'PENDING_USER', 'RESOLVED'];

export default function SupportInbox() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [assignFilter, setAssignFilter] = useState('unassigned');
  const [statusFilter, setStatusFilter] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTickets();
  }, [assignFilter, statusFilter]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = { assignedTo: assignFilter };
      if (statusFilter) params.status = statusFilter;
      const res = await listSupportTickets(params);
      setTickets(res.data.data.tickets || []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const openThread = async (ticketId) => {
    try {
      const res = await getSupportTicketById(ticketId);
      setActiveTicket(res.data.data.ticket);
      setMessages(res.data.data.messages || []);
    } catch {
      setActiveTicket(null);
    }
  };

  const handleAssignToMe = async () => {
    if (!activeTicket) return;
    try {
      await assignTicket(activeTicket._id, null); // null = assign to self (backend default)
      const res = await getSupportTicketById(activeTicket._id);
      setActiveTicket(res.data.data.ticket);
      fetchTickets();
    } catch {}
  };

  const handleStatusChange = async (status) => {
    if (!activeTicket) return;
    try {
      const res = await updateTicketStatus(activeTicket._id, status);
      setActiveTicket(res.data.data.ticket);
      fetchTickets();
    } catch {}
  };

  const handleReply = async () => {
    if (!reply.trim() || !activeTicket) return;
    setSending(true);
    try {
      const res = await sendStaffMessage(activeTicket._id, reply.trim());
      setMessages(prev => [...prev, res.data.data.message]);
      setReply('');
    } catch {}
    setSending(false);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-128px)]">
      {/* Left: Ticket list */}
      <div className="w-80 shrink-0 flex flex-col gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-4">Inbox</h1>
          {/* Filters */}
          <div className="flex flex-col gap-2">
            <select
              value={assignFilter}
              onChange={e => setAssignFilter(e.target.value)}
              className="bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
            >
              <option value="unassigned">Unassigned</option>
              <option value="me">Assigned to Me</option>
              <option value="all">All Tickets</option>
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING_USER">Pending User</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 apple-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10">
              <Inbox className="h-10 w-10 mx-auto text-white/10 mb-2" />
              <p className="text-white/40 text-sm">No tickets</p>
            </div>
          ) : tickets.map(t => {
            const style = STATUS_STYLES[t.status] || STATUS_STYLES.OPEN;
            const isSelected = activeTicket?._id === t._id;
            return (
              <button
                key={t._id}
                onClick={() => openThread(t._id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30'
                    : 'bg-white/3 border-white/8 hover:bg-white/6'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${style.cls}`}>
                    {style.label}
                  </span>
                  <span className="text-xs text-white/30">
                    {new Date(t.lastActivityAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-bold text-white truncate">{t.header}</p>
                <p className="text-xs text-white/40 truncate mt-0.5">{t.userId?.name || 'User'}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Thread */}
      <div className="flex-1 flex flex-col bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        {!activeTicket ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Inbox className="h-12 w-12 mx-auto text-white/10 mb-3" />
              <p className="text-white/40 text-sm">Select a ticket to view the conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="px-6 py-4 border-b border-white/8 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-white">{activeTicket.header}</h2>
                <p className="text-xs text-white/50 mt-1">
                  From: {activeTicket.userId?.name} ({activeTicket.userId?.email})
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Assign to self */}
                {!activeTicket.assignedTo && (
                  <button
                    onClick={handleAssignToMe}
                    className="text-xs px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg hover:bg-[#D4AF37]/20 transition-colors font-medium"
                  >
                    <UserCheck className="h-3.5 w-3.5 inline mr-1" />
                    Assign to Me
                  </button>
                )}
                {/* Status update */}
                {activeTicket.status !== 'CLOSED' && (
                  <select
                    value={activeTicket.status}
                    onChange={e => handleStatusChange(e.target.value)}
                    className="text-xs bg-[#111] border border-white/10 rounded-lg px-2 py-1.5 text-white/70 focus:outline-none"
                  >
                    {STAFF_NEXT_STATUSES.map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 apple-scrollbar">
              {messages.map((msg, i) => (
                <div
                  key={msg._id || i}
                  className={`flex ${msg.senderType === 'staff' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.senderType === 'staff'
                        ? 'bg-[#D4AF37] text-black rounded-br-sm'
                        : 'bg-white/10 text-white rounded-bl-sm'
                    }`}
                  >
                    {msg.message}
                    <p className={`text-xs mt-1 ${msg.senderType === 'staff' ? 'text-black/50' : 'text-white/40'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply */}
            {activeTicket.status !== 'CLOSED' ? (
              <div className="p-4 border-t border-white/8 flex gap-3 items-end">
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={2}
                  placeholder="Type your reply..."
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); }
                  }}
                  className="flex-1 bg-[#0A0A0B] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 resize-none"
                />
                <button
                  onClick={handleReply}
                  disabled={sending || !reply.trim()}
                  className="h-10 w-10 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-40"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-white/40">Ticket is closed.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
