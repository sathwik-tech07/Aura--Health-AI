import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { I18N, getLang } from '../i18n';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface Props { onBack?: () => void; sessionId?: string }

const ConversationHistory: React.FC<Props> = ({ onBack, sessionId: propSessionId }) => {
  const [sessionId, setSessionId] = useState(propSessionId || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState(() => getLang());
  useEffect(() => {
    const onChange = () => setLang(getLang());
    window.addEventListener('auraLangChange', onChange);
    return () => window.removeEventListener('auraLangChange', onChange);
  }, []);
  const t = (I18N as any)[lang] || I18N.en;

  const fetchHistory = async () => {
    if (!sessionId) return;   
    setLoading(true);
    setError('');
    try {
      const API_URL = "https://aura-health-ai.onrender.com"; 
      const res = await axios.get(`${API}/history/${encodeURIComponent(sessionId)}`);
      setMessages(res.data?.messages || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load history');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load when a sessionId prop is provided
  React.useEffect(() => {
    if (propSessionId) {
      setSessionId(propSessionId);
      fetchHistory();
    }
  }, [propSessionId]);

  return (
    <section className="py-12 px-6 lg:px-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white mb-4">Conversation History</h2>
          <button onClick={onBack} className="text-sm text-cyan-400">← Back to Home</button>
        </div>

        <div className="flex gap-2 mb-4">
          <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder={t.enterSessionId} className="p-3 bg-white/5 border border-white/5 rounded flex-grow" />
          <button onClick={fetchHistory} className="px-4 py-2 rounded bg-cyan-500 font-bold">{t.load}</button>
        </div>

        {loading && <div className="text-gray-400">Loading...</div>}
        {error && <div className="text-rose-400">{error} <button onClick={fetchHistory} className="ml-2 text-cyan-400">Retry</button></div>}

        {messages.length === 0 && !loading && !error && (
          <div className="bg-dark-900 border border-white/5 rounded-lg p-6 text-gray-400">No conversations found for this session.</div>
        )}

        <div className="space-y-3 mt-6">
          {messages.map((m, i) => (
            <motion.div key={i} className={`p-3 rounded-lg ${m.sender === 'user' ? 'bg-cyan-500/10 self-end ml-auto max-w-[80%]' : 'bg-white/5 mr-auto max-w-[80%]'}`}>
              <div className="text-xs text-gray-400 uppercase font-bold">{m.sender === 'user' ? 'You' : 'Assistant'}</div>
              <div className="text-sm text-gray-200">{m.text}</div>
              <div className="text-[10px] text-gray-500 mt-1">{m.timestamp}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConversationHistory;
