import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Send, Bot, User, ArrowRight, Loader2, BarChart2, Calendar, FileText, Image, PenTool } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getBusinesses } from '../../services/business.service';
import { sendChatMessage } from '../../services/assistant.service';

const SUGGESTIONS = [
  { icon: <BarChart2 size={16} />, text: 'Analyze my analytics', command: '/analyze' },
  { icon: <Calendar size={16} />, text: 'Create next week\'s plan', command: '/calendar' },
  { icon: <PenTool size={16} />, text: 'Improve my latest caption', command: '/caption' },
  { icon: <FileText size={16} />, text: 'Suggest hashtags', command: '/hashtags' },
  { icon: <Sparkles size={16} />, text: 'Festival campaign ideas', command: '/festival' },
  { icon: <Image size={16} />, text: 'Generate campaign ideas', command: '/campaign' },
];

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBiz = async () => {
      try {
        const res = await getBusinesses();
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setActiveBusiness(res.data.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch business context for AI');
      }
    };
    fetchBiz();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text = input) => {
    if (!text.trim() || !activeBusiness) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send last 10 messages max
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await sendChatMessage(activeBusiness._id, apiMessages);
      const assistantContent = res.choices?.[0]?.message?.content || res.message?.content || 'I could not process that request.';
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.',
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Check if a message implies navigation (simplified context buttons)
  const renderQuickActions = (content) => {
    const contentLower = content.toLowerCase();
    const actions = [];
    
    if (contentLower.includes('generate') || contentLower.includes('create a post') || contentLower.includes('caption')) {
      actions.push({ label: 'Open AI Generator', path: '/dashboard/ai-generator', icon: <Sparkles size={14} /> });
    }
    if (contentLower.includes('analytics') || contentLower.includes('performance') || contentLower.includes('engagement')) {
      actions.push({ label: 'View Analytics', path: '/dashboard/analytics', icon: <BarChart2 size={14} /> });
    }
    if (contentLower.includes('calendar') || contentLower.includes('schedule')) {
      actions.push({ label: 'Open Calendar', path: '/dashboard/calendar', icon: <Calendar size={14} /> });
    }
    if (contentLower.includes('saved') || contentLower.includes('drafts')) {
      actions.push({ label: 'Saved Posts', path: '/dashboard/saved-posts', icon: <FileText size={14} /> });
    }

    if (actions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => {
              navigate(action.path);
              setIsOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#D4AF37]/20 text-xs text-[#D4AF37] transition border border-[#D4AF37]/20"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#AA8529] text-black shadow-[0_10px_30px_-10px_rgba(212,175,55,0.6)] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_15px_40px_-10px_rgba(212,175,55,0.8)] ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles size={24} />
      </button>

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-[420px] transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full w-full glass-panel border-l border-white/10 flex flex-col shadow-2xl relative">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Marketing Assistant</h3>
                <p className="text-xs text-white/50">Your Business Growth Copilot</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-5 apple-scrollbar space-y-6 bg-gradient-to-b from-transparent to-black/20">
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
                <div className="space-y-2">
                  <div className="inline-flex h-16 w-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 items-center justify-center text-[#D4AF37] mb-4">
                    <Sparkles size={32} />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Good Evening 👋</h2>
                  <p className="text-sm text-white/50 max-w-[250px] mx-auto">
                    How can I help grow your business today?
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-2 w-full max-w-[320px]">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s.command)}
                      className="flex items-center justify-between p-3 rounded-xl glass-panel hover:bg-white/5 border border-white/5 hover:border-[#D4AF37]/30 transition group text-left"
                    >
                      <div className="flex items-center gap-3 text-sm text-white/70 group-hover:text-white transition">
                        <div className="text-[#D4AF37] opacity-70 group-hover:opacity-100 transition">
                          {s.icon}
                        </div>
                        {s.text}
                      </div>
                      <ArrowRight size={14} className="text-white/30 group-hover:text-[#D4AF37] transition translate-x-0 group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] flex-shrink-0 mt-1">
                        <Bot size={16} />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8529] text-black rounded-tr-sm' 
                        : 'glass-panel bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
                    } ${msg.isError ? '!border-red-500/50 !text-red-400' : ''}`}>
                      
                      {msg.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap font-medium">{msg.content}</p>
                      ) : (
                        <div className="text-sm prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}

                      {msg.role === 'assistant' && renderQuickActions(msg.content)}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] flex-shrink-0 mt-1">
                      <Bot size={16} />
                    </div>
                    <div className="glass-panel bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-black/40">
            <div className="relative flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about marketing..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 resize-none apple-scrollbar"
                rows={Math.min(Math.max(input.split('\n').length, 1), 5)}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 h-9 w-9 rounded-xl bg-[#D4AF37] hover:bg-[#AA8529] disabled:opacity-50 disabled:hover:bg-[#D4AF37] flex items-center justify-center text-black transition"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-white/30">AI can make mistakes. Verify important information.</span>
            </div>
          </div>

        </div>
      </div>
      
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AIAssistant;
