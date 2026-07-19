import React, { useState, useEffect } from 'react';

const LanguageSelector: React.FC = () => {
  const [lang, setLang] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('aura_lang') || 'en' : 'en'));

  useEffect(() => {
    localStorage.setItem('aura_lang', lang);
    window.dispatchEvent(new Event('auraLangChange'));
  }, [lang]);

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-white/5 text-gray-200 rounded-md p-1 border border-white/5">
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="te">తెలుగు</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
