import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Volume2, PhoneOff, Activity, ShieldCheck } from 'lucide-react';
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
interface VoiceWidgetProps { 
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
}

export const VoiceWidget: React.FC<VoiceWidgetProps> = ({ isOpen, onClose, sessionId: propSessionId }) => {
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [timer, setTimer] = useState<number>(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [transcriptIndex, setTranscriptIndex] = useState<number>(0);
  const [liveText, setLiveText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [sessionId] = useState(() => `voice-${Math.random().toString(36).slice(2, 10)}`);
  const [selectedLang, setSelectedLang] = useState<string>('en-US');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Call timer hook
 useEffect(() => {
  if (callState !== "connected") return;

  const interval = setInterval(() => {
    setTimer((prev) => prev + 1);
  }, 1000); 

    return () => clearInterval(interval);
  }, [callState]);

  // Reset values on open
  useEffect(() => {
    if (!isOpen) return;

    setCallState('ringing');
    setTimer(0);
    setTranscriptIndex(0);
    setLiveText('');

    // Ringing state timer
    const ringTimeout = setTimeout(() => {
      setCallState('connected');
    }, 2500);

    return () => clearTimeout(ringTimeout);
  }, [isOpen]);

  // Load available TTS voices for language selection
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices() || [];
      setVoices(v);
    };

    loadVoices();
    // some browsers populate voices asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedLang]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleHangUp = () => {
  // Stop microphone
  recognition?.stop();

  // Stop any speech currently playing
  window.speechSynthesis.cancel();

  // Reset UI
  setIsListening(false);
  setLiveText("");
  setCallState("ended");

  setTimeout(() => {
    onClose();
  }, 800);
};

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognitionInstance = new SpeechRecognition();

  recognitionInstance.lang = selectedLang || 'en-US';
  recognitionInstance.interimResults = false;
  recognitionInstance.maxAlternatives = 1;

  recognitionInstance.start();

  recognitionInstance.onstart = () => {
    setIsListening(true);
  };

  recognitionInstance.onend = () => {
    setIsListening(false);
  };

  recognitionInstance.onresult = async (event: any) => {
    const transcript = event.results[0][0].transcript;

    setLiveText("You: " + transcript);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        session_id: propSessionId || sessionId,
        message: transcript,
        language: selectedLang,
    }),
});

      const data = await response.json();

      setLiveText(data.response);

     window.speechSynthesis.cancel();

const speech = new SpeechSynthesisUtterance(data.response);
speech.lang = selectedLang;
// try to pick a matching voice for the selected language
const match = voices.find(v => v.lang && (v.lang.startsWith(selectedLang) || v.lang.startsWith(selectedLang.split('-')[0])));
if (match) speech.voice = match;

window.speechSynthesis.speak(speech);
    } catch (error) {
      console.error(error);
      setLiveText("Unable to connect to backend.");
    }
  };

    setRecognition(recognitionInstance);
  };

  const handleMicToggle = () => {
    if (isListening) {
      recognition?.stop();
      return;
    }

    startListening();
  };

  // Active voice animation heights
  const speakerType = "ai";
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleHangUp}
            className="absolute inset-0 bg-dark-950/85 backdrop-blur-md"
          />

          {/* Main call console */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-dark-950/90 border border-cyan-500/20 rounded-3xl p-8 shadow-[0_0_60px_rgba(6,182,212,0.2)] flex flex-col items-center justify-between min-h-[520px] z-10 overflow-hidden"
          >
            {/* Cyber grids */}
            <div className="absolute inset-0 cyber-grid opacity-[0.06] pointer-events-none" />

            {/* Header info */}
            <div className="w-full flex justify-between items-center relative z-10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                Live VoIP Triage Core
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-dark-900 text-gray-200 text-xs rounded-md p-1 border border-white/5"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Español (ES)</option>
                  <option value="es-MX">Español (MX)</option>
                  <option value="fr-FR">Français</option>
                  <option value="de-DE">Deutsch</option>
                  <option value="it-IT">Italiano</option>
                  <option value="pt-BR">Português (BR)</option>
                  <option value="ru-RU">Русский</option>
                  <option value="zh-CN">中文 (简体)</option>
                  <option value="zh-TW">中文 (繁體)</option>
                  <option value="ja-JP">日本語</option>
                  <option value="ko-KR">한국어</option>
                  <option value="ar-SA">العربية</option>
                  <option value="hi-IN">हिन्दी</option>
                  <option value="bn-IN">বাংলা</option>
                  <option value="ta-IN">தமிழ்</option>
                  <option value="te-IN">తెలుగు</option>
                  <option value="mr-IN">मराठी</option>
                  <option value="ur-PK">اردو</option>
                  <option value="vi-VN">Tiếng Việt</option>
                  <option value="id-ID">Bahasa Indonesia</option>
                  <option value="th-TH">ไทย</option>
                </select>
                <button 
                  onClick={handleHangUp}
                  className="p-1 rounded-full bg-white/5 border border-white/5 text-gray-500 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Dialer Graphic */}
            <div className="flex flex-col items-center my-6 relative z-10">
              
              {/* Pulsing ring circles */}
              <div className="relative flex items-center justify-center w-36 h-36 mb-6">
                <AnimatePresence>
                  {callState === 'connected' && speakerType === 'ai' && (
                    <>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.8 }}
                        className="absolute inset-0 rounded-full border border-cyan-500/25"
                      />
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.8, delay: 0.6 }}
                        className="absolute inset-0 rounded-full border border-blue-500/10"
                      />
                    </>
                  )}
                </AnimatePresence>

                {/* Main nurse face avatar circle */}
                <div className={`w-28 h-28 rounded-full bg-gradient-to-tr from-dark-900 to-dark-800 border flex items-center justify-center transition-all duration-700
                  ${callState === 'connected'
                    ? 'border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                    : 'border-white/10 animate-pulse'
                  }`}
                >
                  <Activity className={`w-12 h-12 text-cyan-400 ${callState === 'ringing' ? 'animate-pulse' : ''}`} />
                </div>
              </div>

              {/* Call status and timing */}
              <h3 className="text-xl font-bold text-white tracking-tight mb-1">
                {callState === 'ringing' ? 'Ringing Nurse Node...' : 'Aura Voice Core'}
              </h3>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                {callState === 'ringing' ? 'Connecting Securely' : formatTime(timer)}
              </p>
            </div>

            {/* Live Call Transcript Bubble */}
            <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 min-h-[96px] max-h-[120px] overflow-y-auto mb-6 flex flex-col justify-center relative z-10">
              <AnimatePresence mode="wait">
                {callState === 'connected' && liveText && (
                  <motion.div
                    key={transcriptIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block mb-1">
                      {speakerType === 'ai' ? 'AI Nurse' : 'Caller Input'}
                    </span>
                    <p className="text-sm text-gray-200 font-light leading-relaxed">
                      {liveText}
                    </p>
                  </motion.div>
                )}
                {callState === 'ringing' && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-gray-400 italic"
                  >
                    Establishing clinical connection tunnel...
                  </motion.p>
                )}
                {callState === 'ended' && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-rose-400 font-bold"
                  >
                    Call Terminated Securely
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Control Panel Buttons */}
            <div className="flex gap-6 mb-4 relative z-10">
              {/* Microphone control */}
              <button
                onClick={handleMicToggle}
                className={`p-4 rounded-full border transition-all duration-300
                  ${isListening
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                    : 'bg-white/5 border-white/5 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-400'
                  }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* End Call button (Hang up) */}
              <button
                onClick={handleHangUp}
                className="p-5 rounded-full bg-rose-600 hover:bg-rose-500 border border-rose-500/30 text-white transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)]"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              {/* Speaker Toggle button */}
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-4 rounded-full border transition-all duration-300
                  ${isSpeakerOn
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-white/5 border-white/5 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-400'
                  }`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* HIPAA Certification tag */}
            <div className="flex items-center gap-1.5 justify-center text-[9px] text-gray-500 relative z-10 border-t border-white/5 w-full pt-4 mt-2">
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
              <span>FDA Clinical Standard & HIPAA Compliant Endpoints</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
