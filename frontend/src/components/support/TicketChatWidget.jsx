// frontend/src/components/support/TicketChatWidget.jsx
// Floating chat widget available inside DashboardLayout.
// Two-step flow: (1) pick header, (2) write description, submit → chat thread.

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, X, ChevronDown, Send, Loader2, CheckCircle2,
} from 'lucide-react';
import {
  getTicketHeaders, createTicket, getTicketById, sendUserMessage, closeTicket
} from '../../services/ticket.service';

const STATUS_COLORS = {
  OPEN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PENDING_USER: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  RESOLVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CLOSED: 'bg-white/10 text-white/50 border-white/10',
};

export default function TicketChatWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('list'); // 'list' | 'new' | 'chat'
  const [headers, setHeaders] = useState([]);
  const [selectedHeader, setSelectedHeader] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && headers.length === 0) {
      getTicketHeaders()
        .then(res => setHeaders(res.data.data.headers || []))
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const handleOpenWidget = async (e) => {
      setOpen(true);
      const ticketId = e.detail;
      if (ticketId === 'NEW') {
        setStep('new');
      } else if (ticketId) {
        await openTicketChat(ticketId);
      }
    };
    window.addEventListener('openTicketChat', handleOpenWidget);
    return () => window.removeEventListener('openTicketChat', handleOpenWidget);
  }, []);

  const handleSubmit = async () => {
    if (!selectedHeader || !description.trim() || description.trim().length < 10) {
      setError('Please select an issue type and provide at least 10 characters of description.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await createTicket({ header: selectedHeader, description: description.trim() });
      const ticket = res.data.data.ticket;
      await openTicketChat(ticket._id);
      setSelectedHeader('');
      setDescription('');
      setStep('chat');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openTicketChat = async (ticketId) => {
    try {
      const res = await getTicketById(ticketId);
      setActiveTicket(res.data.data.ticket);
      setMessages(res.data.data.messages || []);
      setStep('chat');
    } catch {
      setError('Could not load ticket.');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !activeTicket) return;
    setSending(true);
    try {
      const res = await sendUserMessage(activeTicket._id, replyText.trim());
      setMessages(prev => [...prev, res.data.data.message]);
      setReplyText('');
      // Refresh ticket to get updated status
      const updated = await getTicketById(activeTicket._id);
      setActiveTicket(updated.data.data.ticket);
    } catch {
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!activeTicket) return;
    try {
      const res = await closeTicket(activeTicket._id);
      setActiveTicket(res.data.data.ticket);
    } catch {
      setError('Failed to close ticket.');
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        id="ticket-widget-trigger"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#D4AF37] text-black shadow-[0_0_30px_rgba(212,175,55,0.5)] flex items-center justify-center hover:scale-105 transition-transform"
        title="Support"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Widget panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] bg-[#111114] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-[#111114] to-[#181410]">
            <div>
              <h2 className="font-display font-bold text-white text-base">Support</h2>
              <p className="text-xs text-white/50">We typically reply within a few hours</p>
            </div>
            <div className="flex items-center gap-2">
              {step !== 'list' && (
                <button
                  onClick={() => setStep('list')}
                  className="text-xs text-white/50 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                >
                  ← Back
                </button>
              )}
              <button
                id="ticket-widget-close"
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* Step: New ticket form */}
          {step === 'new' && (
            <div className="flex flex-col gap-4 p-5 overflow-y-auto">
              <h3 className="font-bold text-sm text-white">Open a Support Ticket</h3>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
              )}

              {/* Header selector */}
              <div>
                <label className="text-xs font-medium text-white/60 mb-2 block">Issue Type</label>
                <div className="flex flex-wrap gap-2">
                  {headers.map(h => (
                    <button
                      key={h}
                      onClick={() => setSelectedHeader(h)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        selectedHeader === h
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold'
                          : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-white/60 mb-2 block">Describe your issue</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Please describe your issue in detail..."
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 resize-none"
                />
                <p className="text-xs text-white/30 mt-1 text-right">{description.length}/2000</p>
              </div>

              <button
                id="ticket-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          )}

          {/* Step: Chat thread */}
          {step === 'chat' && activeTicket && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Ticket meta */}
              <div className="px-5 py-3 border-b border-white/5 bg-white/2">
                <p className="text-xs font-bold text-white">{activeTicket.header}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[activeTicket.status] || 'text-white/50'}`}>
                    {activeTicket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={msg._id || i}
                    className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.senderType === 'user'
                          ? 'bg-[#D4AF37] text-black rounded-br-sm'
                          : 'bg-white/10 text-white rounded-bl-sm'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply area */}
              {activeTicket.status !== 'CLOSED' ? (
                <div className="p-4 border-t border-white/10 flex gap-3 items-end">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type a message..."
                    rows={2}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); }
                    }}
                    className="flex-1 bg-[#0A0A0B] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 resize-none"
                  />
                  <button
                    onClick={handleReply}
                    disabled={sending || !replyText.trim()}
                    className="h-10 w-10 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-40"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-white/40">
                  <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
                  This ticket is closed.
                </div>
              )}

              {/* Resolve confirmation */}
              {activeTicket.status === 'RESOLVED' && (
                <div className="px-4 pb-4">
                  <button
                    onClick={handleClose}
                    className="w-full py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-bold hover:bg-emerald-500/30 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4 inline mr-2" />
                    Confirm Resolved & Close Ticket
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step: Default list / landing */}
          {step === 'list' && (
            <div className="flex flex-col gap-4 p-5 overflow-y-auto">
              <p className="text-sm text-white/70">Have an issue? Our support team is here to help.</p>
              <button
                id="ticket-new-btn"
                onClick={() => setStep('new')}
                className="w-full py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Open a New Ticket
              </button>
              <p className="text-xs text-center text-white/30">Or <a href="/dashboard/tickets" className="text-[#D4AF37] hover:underline">view your existing tickets</a></p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
