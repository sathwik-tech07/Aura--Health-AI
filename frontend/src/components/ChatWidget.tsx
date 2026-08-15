import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Stethoscope,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { API_BASE_URL } from '../api/config';
import { SUPPORTED_LANGUAGES, getLang } from '../i18n';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  onOpenBookModal?: (doctorName?: string) => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  agent?: string;
  isError?: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  onClose,
  sessionId,
  onOpenBookModal,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am AuraHealth AI V2, your clinical triage & healthcare assistant. How can I help you today? You can describe symptoms, ask about doctor appointments, or check clinic information.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState<string>(() => getLang());
  const [isTyping, setIsTyping] = useState(false);
  const [localSessionId] = useState(() => `chat-${Math.random().toString(36).slice(2, 10)}`);
  const sessionIdToUse = sessionId || localSessionId;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync with global language
  useEffect(() => {
    const handleGlobalLang = () => setLanguage(getLang());
    window.addEventListener('auraLangChange', handleGlobalLang);
    return () => window.removeEventListener('auraLangChange', handleGlobalLang);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const presets = [
    { label: '🩺 Symptom Triage Check', prompt: 'I want to perform a symptom triage check.' },
    { label: '📅 Book an Appointment', prompt: 'I would like to book a doctor consultation.' },
    { label: '💳 Insurance & Fees', prompt: 'What insurance plans and consultation fees apply?' },
    { label: '🚨 Emergency Guidance', prompt: 'What should I do in an emergency?' },
    { label: '🏥 Hospital Hours & Location', prompt: 'Where is the clinic located and what are working hours?' },
  ];

  const handleSend = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || isTyping) return;

    const userMsg: Message = {
      sender: 'user',
      text: trimmedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionIdToUse,
          message: trimmedText,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const responseText = data?.response || 'I have recorded your symptoms. Please consult a clinician.';

      const aiMsg: Message = {
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        sender: 'ai',
        text: 'We could not connect to the healthcare assistant right now. Please verify your internet connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessageContent = (text: string) => {
    const isApptIntent = text.toLowerCase().includes('recommend') && text.toLowerCase().includes('department');
    return (
      <div className="space-y-2 whitespace-pre-wrap text-sm leading-relaxed">
        {text}
        {isApptIntent && onOpenBookModal && (
          <div className="pt-2">
            <button
              onClick={() => onOpenBookModal()}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 text-dark-950 font-bold text-xs hover:bg-cyan-400 transition"
            >
              📅 Schedule Appointment Now
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
          />

          {/* Main Modal Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl h-[650px] max-h-[90vh] glass-panel rounded-3xl border border-cyan-500/25 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col justify-between overflow-hidden z-10"
          >
            {/* Cyber Grid */}
            <div className="absolute inset-0 cyber-grid opacity-[0.08] pointer-events-none" />

            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-dark-900/80 border-b border-white/10 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm tracking-wide flex items-center gap-2">
                    AuraHealth AI Triage Core
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full">
                      V2 Multi-Agent
                    </span>
                  </h3>
                  <span className="text-[10px] text-cyan-400 font-medium tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Online &middot; Session: {sessionIdToUse.slice(0, 10)}...
                  </span>
                </div>
              </div>

              {/* Language Picker & Close Button */}
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-dark-950 text-gray-200 text-xs rounded-lg px-2 py-1 border border-white/10 focus:outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.native}
                    </option>
                  ))}
                </select>
                <button
                  onClick={onClose}
                  aria-label="Close Chat"
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Pane */}
            <div className="flex-grow overflow-y-auto p-5 sm:p-6 flex flex-col gap-4 relative z-10">
              {messages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${
                      isUser ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    {/* Speaker name */}
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1 flex items-center gap-1">
                      {isUser ? 'You' : <><Sparkles className="w-3 h-3 text-cyan-400" /> Aura Health AI</>}
                    </span>

                    {/* Chat Bubble */}
                    <div
                      className={`px-4.5 py-3 rounded-2xl text-sm leading-relaxed font-normal
                        ${
                          isUser
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-none border border-cyan-400/20 shadow-md'
                            : msg.isError
                            ? 'bg-rose-950/40 text-rose-200 rounded-tl-none border border-rose-500/30'
                            : 'bg-white/5 text-gray-100 rounded-tl-none border border-white/10 shadow-lg'
                        }`}
                    >
                      {renderMessageContent(msg.text)}
                    </div>

                    {/* Timestamp */}
                    <span className="text-[8px] text-gray-500 mt-1">{msg.timestamp}</span>
                  </div>
                );
              })}

              {/* Typing simulation anim */}
              {isTyping && (
                <div className="flex flex-col max-w-[80%] self-start items-start">
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-spin-slow" /> Aura AI Routing & Analyzing
                  </span>
                  <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <div className="p-3.5 sm:p-4 bg-dark-900/80 border-t border-white/10 relative z-10">
              {/* Presets suggestions row */}
              {messages.length < 6 && (
                <div className="flex flex-wrap gap-1.5 mb-3 overflow-x-auto max-h-20 pb-1">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(preset.prompt)}
                      disabled={isTyping}
                      className="text-xs bg-white/5 hover:bg-cyan-500/10 text-gray-300 hover:text-cyan-400 border border-white/5 hover:border-cyan-500/30 px-3 py-1 rounded-full transition-all duration-300 font-medium whitespace-nowrap disabled:opacity-40"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Row */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputValue);
                }}
                className="flex gap-2 items-center"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a health symptom, book request, or medical question..."
                  disabled={isTyping}
                  className="flex-grow bg-white/5 border border-white/10 focus:border-cyan-500/50 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none placeholder-gray-500 transition-all font-light disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isTyping || !inputValue.trim()}
                  aria-label="Send message"
                  className="p-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-400/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Disclaimer */}
              <div className="flex items-center gap-1.5 mt-2.5 justify-center text-[10px] text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                <span>AI triage guidance only. In medical emergencies, call 911 / 112 immediately.</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
