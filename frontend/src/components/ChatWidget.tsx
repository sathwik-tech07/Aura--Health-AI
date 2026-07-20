import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Stethoscope, Clock } from 'lucide-react';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const TRANSLATIONS = {
  en: {
    title: "Aura Clinical Core",
    status: "AI Triage Assistant",
    typing: "AURA ASSISTANT",
    language: "Language",
    english: "English",
    hindi: "Hindi",
    telugu: "Telugu",
    placeholder: "Type a message or symptom triage detail...",
    footer: "Encrypted clinical portal. For emergency situations, call 911 immediately.",
    welcome: "Hello! I am Aura, your virtual clinical assistant. How can I help you today? Please select one of the core options below or type your inquiry.",
  },
  hi: {
    title: "Aura क्लिनिकल कोर",
    status: "एआई ट्रायेज़ असिस्टेंट",
    typing: "AURA असिस्टेंट",
    language: "भाषा",
    english: "अंग्रेज़ी",
    hindi: "हिन्दी",
    telugu: "तेलुगू",
    placeholder: "एक संदेश या लक्षण विवरण दर्ज करें...",
    footer: "एन्क्रिप्टेड क्लिनिकल पोर्टल। आपात स्थिति में 911 पर कॉल करें।",
    welcome: "नमस्ते! मैं Aura हूँ, आपका वर्चुअल क्लिनिकल असिस्टेंट। मैं आज आपकी कैसे मदद कर सकता हूँ? कृपया नीचे दिए गए मुख्य विकल्पों में से चुनें या अपनी जानकारी टाइप करें।",
  },
  te: {
    title: "Aura క్లినికల్ కోర్",
    status: "AI ట్రైయాజ్ అసిస్టెంట్",
    typing: "AURA అసిస్టెంట్",
    language: "భాష",
    english: "ఇంగ్లీష్",
    hindi: "హిందీ",
    telugu: "తెలుగు",
    placeholder: "సందేశం లేదా లక్షణ వివరాలను టైప్ చేయండి...",
    footer: "ఎన్‌క్రిప్టెడ్ క్లినికల్ పోర్టల్. అత్యవసర పరిస్థితుల్లో వెంటనే 911 ను కాల్ చేయండి.",
    welcome: "హలో! నేను Auraను, మీ వర్చువల్ క్లినికల్ అసిస్టెంట్‌ను. నేను ఈ రోజు మీకు ఎలా సహాయపడగలను? దయచేసి క్రింద మౌలిక ఎంపికలను ఎంచుకోండి లేదా మీ ప్రశ్నను టైప్ చేయండి.",
  },
} as const;

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose, sessionId }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: TRANSLATIONS.en.welcome,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState<keyof typeof TRANSLATIONS>("en");

  const translations = TRANSLATIONS;
  const t = (translations as any)[language] || translations.en;

  const [isTyping, setIsTyping] = useState(false);
  const [localSessionId] = useState(() => `chat-${Math.random().toString(36).slice(2, 10)}`);
  const sessionIdToUse = sessionId || localSessionId;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const presets = [
    { label: "⚕️ Symptom Triage", action: "symptom" },
    { label: "📅 Book Appointment", action: "book" },
    { label: "💊 Prescription Refill", action: "refill" },
    { label: "📍 Clinic Hours & Location", action: "hours" }
  ];
  const handleSend = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const userMsg: Message = {
      sender: 'user',
      text: trimmedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
          const payloadVariants = [
      {
        session_id: sessionIdToUse,
        message: trimmedText,
        language: language,
      },
      {
        sessionId: sessionIdToUse,
        message: trimmedText,
        language: language,
      },
      {
        message: trimmedText, 
        language: language,
      },
    ];
      let response: Response | null = null;
      let data: any = null;
      let responseText = "No response from server.";
      let lastError: string | null = null;

     for (const payload of payloadVariants) {
  response = await fetch("https://aura-health-ai.onrender.com/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    data = await response.json();
    break;
  }

  if (response.status !== 422) {
    lastError = `Chat API error: ${response.status} ${response.statusText}`;
    break;
  }

  const errorBody = await response.text();
  lastError = `Chat API 422: ${errorBody}`;
}
      if (!response?.ok) {
        console.error(lastError);
        responseText = lastError || responseText;
      } else {
        responseText = data?.response || data?.reply || data?.message || data?.text || responseText;
      }

      const aiMsg: Message = {
        sender: "ai",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Unable to connect to the chat backend. Please try again.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePresetClick = (action: string) => {
  let text = "";

  if (action === "symptom") text = "I want to perform a symptom triage check.";
  else if (action === "book") text = "I need to book a new appointment.";
  else if (action === "refill") text = "I need help with a prescription refill.";
  else if (action === "hours") text = "What are the clinic hours and location?";

  handleSend(text);
};

// (removed unused changeLanguage helper)

return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Dark Overlay backdrop */}
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
            className="relative w-full max-w-xl h-[600px] glass-panel rounded-3xl border border-cyan-500/25 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col justify-between overflow-hidden z-10"
          >
            {/* Cyber dashboard lines */}
            <div className="absolute inset-0 cyber-grid opacity-[0.08] pointer-events-none" />

            {/* Modal Header */}
            <div className="px-6 py-4 bg-dark-900/60 border-b border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm tracking-wide">
  {t.title}
</h3>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Online &middot;{t.status}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Pane */}
            <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-4 relative z-10">
              {messages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[80%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    {/* Speaker name */}
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                      {isUser ? 'You' : 'AURA ASSISTANT'}
                    </span>

                    {/* Chat Bubble */}
                    <div
                      className={`px-4.5 py-3 rounded-2xl text-sm leading-relaxed font-normal
                        ${isUser 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-none border border-cyan-400/20' 
                          : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'
                        }`}
                    >
                      {msg.text}
                    </div>

                    {/* Timestamp */}
                    <span className="text-[8px] text-gray-500 mt-1">{msg.timestamp}</span>
                  </div>
                );
              })}

              {/* Typing simulation anim */}
              {isTyping && (
                <div className="flex flex-col max-w-[80%] self-start items-start">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1">
                    {t.typing}
                  </span>
                  <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <div className="p-4 bg-dark-900/60 border-t border-white/5 relative z-10">
              
              {/* Presets suggestions row (Shown when conversation is short) */}
              {messages.length < 5 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetClick(preset.action)}
                      className="text-xs bg-white/5 hover:bg-cyan-500/10 text-gray-300 hover:text-cyan-400 border border-white/5 hover:border-cyan-500/30 px-3.5 py-1.5 rounded-full transition-all duration-300 font-medium"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Text Input Row */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400 font-medium">🌐 {t.language}</span>

                <div className="flex gap-2 items-center">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setLanguage("en")} className={`px-3 py-1 rounded-full text-xs transition ${language === "en" ? "bg-cyan-500 text-white" : "bg-white/5 text-gray-300"}`}>🇬🇧 {t.english}</button>
                    <button type="button" onClick={() => setLanguage("hi")} className={`px-3 py-1 rounded-full text-xs transition ${language === "hi" ? "bg-cyan-500 text-white" : "bg-white/5 text-gray-300"}`}>🇮🇳 {t.hindi}</button>
                    <button type="button" onClick={() => setLanguage("te")} className={`px-3 py-1 rounded-full text-xs transition ${language === "te" ? "bg-cyan-500 text-white" : "bg-white/5 text-gray-300"}`}>🇮🇳 {t.telugu}</button>
                  </div>
                  <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="bg-dark-900 text-gray-200 text-xs rounded-md p-1 border border-white/5">
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="te">తెలుగు</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                    <option value="pt">Português</option>
                    <option value="ru">Русский</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                    <option value="ar">العربية</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="id">Bahasa Indonesia</option>
                  </select>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputValue);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t.placeholder}
                  className="flex-grow bg-white/5 border border-white/5 focus:border-cyan-500/50 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none placeholder-gray-500 transition-all font-light"
                />
                <button
                  type="submit"
                  className="p-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-400/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Disclaimer */}
              <div className="flex items-center gap-1 mt-3 justify-center text-[9px] text-gray-500">
                <Clock className="w-3 h-3 text-cyan-500" />
                <span>{t.footer}</span>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
