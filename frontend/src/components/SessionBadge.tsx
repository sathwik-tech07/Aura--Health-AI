import React, { useState } from "react";
import { Copy } from 'lucide-react';

const SessionBadge: React.FC<{ sessionId?: string | null }> = ({ sessionId }) => {
  const [copied, setCopied] = useState(false);
  if (!sessionId) return null;

  const storedLang = (typeof window !== 'undefined') ? localStorage.getItem('aura_lang') || 'en' : 'en';
  const labels: any = {
    en: { sessionLabel: 'Session:', copied: 'Copied' },
    hi: { sessionLabel: 'सत्र:', copied: 'कॉपी हो गया' },
    te: { sessionLabel: 'సెషన్:', copied: 'కాపీ అయింది' },
  };
  const t = labels[storedLang] || labels.en;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('copy failed', e);
    }
  };

  return (
    <div className="fixed left-6 bottom-6 z-50">
      <div className="flex items-center gap-2 bg-white/5 text-gray-200 px-3 py-2 rounded-full border border-white/5">
        <div className="text-xs">{t.sessionLabel}</div>
        <div className="text-xs font-mono text-sm px-2 py-0.5 bg-white/3 rounded">{sessionId.slice(0,8)}</div>
        <button onClick={handleCopy} className="p-1 rounded bg-white/5 hover:bg-white/10">
          <Copy className="w-4 h-4" />
        </button>
        <div className="text-xs text-emerald-300">{copied ? t.copied : ''}</div>
      </div>
    </div>
  );
};

export default SessionBadge;
