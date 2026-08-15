import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLang, setLang } from '../i18n';

interface Props {
  variant?: 'floating' | 'header';
}

const LanguageSelector: React.FC<Props> = ({ variant = 'floating' }) => {
  const [currentLang, setCurrentLang] = useState<string>(() => getLang());

  useEffect(() => {
    const handleLangChange = () => setCurrentLang(getLang());
    window.addEventListener('auraLangChange', handleLangChange);
    return () => window.removeEventListener('auraLangChange', handleLangChange);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setCurrentLang(newLang);
    setLang(newLang);
  };

  if (variant === 'header') {
    return (
      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1 text-xs text-gray-300">
        <Globe className="w-3.5 h-3.5 text-cyan-400" />
        <select
          value={currentLang}
          onChange={handleChange}
          aria-label="Select platform language"
          className="bg-transparent text-gray-200 text-xs focus:outline-none cursor-pointer pr-1"
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="bg-dark-900 text-white">
              {l.flag} {l.native} ({l.name})
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 flex items-center gap-2 bg-dark-900/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl px-3 py-2 shadow-[0_4px_20px_rgba(6,182,212,0.15)]">
      <Globe className="w-4 h-4 text-cyan-400 animate-spin-slow" />
      <select
        value={currentLang}
        onChange={handleChange}
        aria-label="Select platform language"
        className="bg-transparent text-gray-200 text-xs font-medium focus:outline-none cursor-pointer"
      >
        {SUPPORTED_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-dark-950 text-white">
            {l.flag} {l.native}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
