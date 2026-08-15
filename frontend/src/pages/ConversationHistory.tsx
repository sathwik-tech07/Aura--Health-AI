import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Sparkles,
  User,
  Clock,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { apiClient } from '../api/config';
import { I18N, getLang } from '../i18n';

interface ConversationItem {
  id?: number;
  session_id?: string;
  user_message: string;
  ai_response: string;
  timestamp?: string;
}

interface Props {
  onBack?: () => void;
  sessionId?: string;
  onStartNewChat?: () => void;
}

const ConversationHistory: React.FC<Props> = ({
  onBack,
  sessionId: propSessionId,
  onStartNewChat,
}) => {
  const [sessionId, setSessionId] = useState(propSessionId || '');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState(() => getLang());

  const t = I18N[lang] || I18N.en;

  useEffect(() => {
    const handleLang = () => setLang(getLang());
    window.addEventListener('auraLangChange', handleLang);
    return () => window.removeEventListener('auraLangChange', handleLang);
  }, []);

  const fetchHistory = async (targetSession?: string) => {
    const sid = (targetSession || sessionId || '').trim();
    if (!sid) return;

    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get(`/history/${encodeURIComponent(sid)}`);
      let list: ConversationItem[] = [];

      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data?.messages && Array.isArray(res.data.messages)) {
        list = res.data.messages;
      }

      setConversations(list);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Unable to load conversation records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propSessionId) {
      setSessionId(propSessionId);
      fetchHistory(propSessionId);
    }
  }, [propSessionId]);

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-cyan-400" />
            Clinical Triage History
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Review previous AI consultation logs, risk assessments, and clinical summaries.
          </p>
        </div>

        {onStartNewChat && (
          <button
            onClick={onStartNewChat}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-dark-950 font-bold text-xs hover:bg-cyan-400 transition"
          >
            + Start New Consultation
          </button>
        )}
      </div>

      {/* Session Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 mb-6 flex gap-2">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Enter session ID (e.g. s-12345678)"
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <button
          onClick={() => fetchHistory()}
          disabled={loading || !sessionId.trim()}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold text-xs disabled:opacity-50 transition"
        >
          {loading ? 'Loading...' : 'Load History'}
        </button>
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="text-center py-16 text-gray-400 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{t.loading}</span>
        </div>
      )}

      {error && (
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 text-rose-300 text-center mb-6">
          <p>{error}</p>
          <button onClick={() => fetchHistory()} className="mt-2 text-xs text-cyan-400 underline font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && conversations.length === 0 && (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center text-gray-400 space-y-3">
          <MessageSquare className="w-10 h-10 text-gray-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No conversation records found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Either this session ID has no saved messages or you haven't started a chat yet.
          </p>
        </div>
      )}

      {/* Conversation Thread */}
      <div className="space-y-6">
        {conversations.map((item, index) => (
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* User Message */}
            <div className="flex flex-col max-w-[85%] ml-auto items-end">
              <span className="text-[10px] text-gray-400 uppercase font-bold mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-cyan-400" /> Patient
              </span>
              <div className="px-4.5 py-3 rounded-2xl rounded-tr-none bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm leading-relaxed shadow-md">
                {item.user_message}
              </div>
            </div>

            {/* AI Assistant Message */}
            <div className="flex flex-col max-w-[90%] mr-auto items-start">
              <span className="text-[10px] text-gray-400 uppercase font-bold mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Aura Health AI Core
              </span>
              <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-dark-900 border border-white/10 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap shadow-lg">
                {item.ai_response}
              </div>
              {item.timestamp && (
                <span className="text-[9px] text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {item.timestamp.replace('T', ' ').slice(0, 19)}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ConversationHistory;
