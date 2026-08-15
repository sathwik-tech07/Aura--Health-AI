import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Activity,
  ShieldCheck,
  RotateCcw,
  Square,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { API_BASE_URL } from '../api/config';
import { SUPPORTED_LANGUAGES, getLang } from '../i18n';

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

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export const VoiceWidget: React.FC<VoiceWidgetProps> = ({
  isOpen,
  onClose,
  sessionId: propSessionId,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [timer, setTimer] = useState<number>(0);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponseText, setAiResponseText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<string>(() => getLang());

  const [localSessionId] = useState(() => `voice-${Math.random().toString(36).slice(2, 10)}`);
  const activeSessionId = propSessionId || localSessionId;

  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Sync language with global language
  useEffect(() => {
    const handleGlobalLang = () => setSelectedLang(getLang());
    window.addEventListener('auraLangChange', handleGlobalLang);
    return () => window.removeEventListener('auraLangChange', handleGlobalLang);
  }, []);

  // Call timer hook
  useEffect(() => {
    let interval: any = null;
    if (isOpen && voiceState !== 'error') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, voiceState]);

  // Reset values on open/close
  useEffect(() => {
    if (!isOpen) {
      stopAllAudio();
      setVoiceState('idle');
      setTimer(0);
      setTranscript('');
      setAiResponseText('');
      setErrorMessage('');
      isProcessingRef.current = false;
      return;
    }

    setVoiceState('idle');
    setTimer(0);
    setTranscript('');
    setAiResponseText('Hello! I am Aura, your clinical AI nurse. How can I assist you today? Click the microphone and speak.');
    setErrorMessage('');
  }, [isOpen]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const stopAllAudio = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    } catch {}

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = '';
      audioPlayerRef.current = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleHangUp = () => {
    stopAllAudio();
    setVoiceState('idle');
    onClose();
  };

  const handleStopSpeaking = () => {
    stopAllAudio();
    setVoiceState('idle');
  };

  const playSpeechSynthesisFallback = (text: string, langCode: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || isSpeakerMuted) {
      setVoiceState('idle');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;

    const voices = window.speechSynthesis.getVoices() || [];
    const match = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
    if (match) utterance.voice = match;

    utterance.onstart = () => {
      setVoiceState('speaking');
    };
    utterance.onend = () => {
      setVoiceState('idle');
      isProcessingRef.current = false;
    };
    utterance.onerror = () => {
      setVoiceState('idle');
      isProcessingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  };

  const processSpokenInput = async (spokenText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    setTranscript(spokenText);
    setVoiceState('thinking');
    setErrorMessage('');

    try {
      // 1. Send query to backend voice endpoint
      const response = await fetch(`${API_BASE_URL}/voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: activeSessionId,
          message: spokenText,
          language: selectedLang,
        }),
      });

      const contentType = response.headers.get('content-type') || '';

      if (response.ok && contentType.includes('audio/mpeg')) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Retrieve AI text from header or fallback query
        const rawHeaderResponse = response.headers.get('X-Aura-Response') || 'Clinical triage response generated.';
        setAiResponseText(rawHeaderResponse);

        if (!isSpeakerMuted) {
          stopAllAudio();
          const audio = new Audio(audioUrl);
          audioPlayerRef.current = audio;

          audio.onplay = () => setVoiceState('speaking');
          audio.onended = () => {
            setVoiceState('idle');
            isProcessingRef.current = false;
          };
          audio.onerror = () => {
            console.warn('Audio playback error, fallback to browser speech synthesis');
            playSpeechSynthesisFallback(rawHeaderResponse, selectedLang);
          };

          await audio.play();
        } else {
          setVoiceState('idle');
          isProcessingRef.current = false;
        }
      } else {
        // Voice endpoint returned JSON (e.g. ElevenLabs fallback or text response)
        const data = await response.json();
        const responseText = data.response || data.text || 'I have received your inquiry. Please consult a doctor if symptoms persist.';
        setAiResponseText(responseText);

        if (!isSpeakerMuted) {
          playSpeechSynthesisFallback(responseText, selectedLang);
        } else {
          setVoiceState('idle');
          isProcessingRef.current = false;
        }
      }
    } catch (err: any) {
      console.error('Voice processing error:', err);
      // Try /chat fallback
      try {
        const chatRes = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: activeSessionId,
            message: spokenText,
            language: selectedLang,
          }),
        });
        const chatData = await chatRes.json();
        const reply = chatData.response || 'Please consult our healthcare team.';
        setAiResponseText(reply);
        playSpeechSynthesisFallback(reply, selectedLang);
      } catch {
        setVoiceState('error');
        setErrorMessage('Could not connect to medical voice core. Please check your connection and retry.');
        isProcessingRef.current = false;
      }
    }
  };

  const startListening = () => {
    if (isProcessingRef.current || voiceState === 'thinking') return;

    stopAllAudio();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceState('error');
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'te' ? 'te-IN' : selectedLang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setVoiceState('listening');
        setErrorMessage('');
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Please speak clearly into your microphone.');
        } else {
          setErrorMessage(`Speech recognition error (${event.error}). Please retry.`);
        }
        setVoiceState('error');
        isProcessingRef.current = false;
      };

      recognition.onend = () => {
        if (voiceState === 'listening') {
          setVoiceState('idle');
        }
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results?.[0]?.[0]?.transcript?.trim();
        if (spoken) {
          processSpokenInput(spoken);
        } else {
          setVoiceState('error');
          setErrorMessage('Could not capture audio clearly. Please try again.');
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setVoiceState('error');
      setErrorMessage('Failed to initialize microphone. Please check browser permissions.');
    }
  };

  const handleRetry = () => {
    setErrorMessage('');
    setVoiceState('idle');
    startListening();
  };

  const renderWaveform = () => {
    const isSpeakingState = voiceState === 'speaking';
    const isListeningState = voiceState === 'listening';
    const isThinkingState = voiceState === 'thinking';

    return (
      <div className="flex items-center gap-1.5 h-16 justify-center">
        {Array.from({ length: 16 }).map((_, i) => {
          let barHeight = 6;
          let barColor = 'bg-gray-600/40';

          if (isListeningState) {
            barHeight = ((i % 4) + 1) * 10 + 8;
            barColor = 'bg-rose-400 animate-pulse';
          } else if (isThinkingState) {
            barHeight = 12 + Math.sin(i + timer) * 8;
            barColor = 'bg-yellow-400 animate-bounce';
          } else if (isSpeakingState) {
            barHeight = 14 + Math.sin(i * 0.8 + timer * 2) * 16 + 10;
            barColor = 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]';
          }

          return (
            <motion.div
              key={i}
              animate={{ height: barHeight }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-1.5 rounded-full transition-all duration-300 ${barColor}`}
            />
          );
        })}
      </div>
    );
  };

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
            className="relative w-full max-w-md bg-dark-950/95 border border-cyan-500/25 rounded-3xl p-7 shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col items-center justify-between min-h-[550px] z-10 overflow-hidden"
          >
            {/* Cyber background */}
            <div className="absolute inset-0 cyber-grid opacity-[0.08] pointer-events-none" />

            {/* Header info */}
            <div className="w-full flex justify-between items-center relative z-10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Aura Voice AI Triage V2
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  disabled={voiceState === 'listening' || voiceState === 'thinking'}
                  className="bg-dark-900 text-gray-200 text-xs rounded-lg px-2 py-1 border border-white/10 focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.native}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleHangUp}
                  aria-label="Close voice console"
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Avatar Graphic & State Visualizer */}
            <div className="flex flex-col items-center my-4 relative z-10">
              <div className="relative flex items-center justify-center w-36 h-36 mb-4">
                <AnimatePresence>
                  {voiceState === 'listening' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.8 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 rounded-full border-2 border-rose-500/40"
                    />
                  )}
                  {voiceState === 'speaking' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.8 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                      className="absolute inset-0 rounded-full border-2 border-cyan-500/40"
                    />
                  )}
                  {voiceState === 'thinking' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-2 border-yellow-400/30 border-t-transparent"
                    />
                  )}
                </AnimatePresence>

                {/* Center circle */}
                <div
                  className={`w-28 h-28 rounded-full bg-gradient-to-tr from-dark-900 to-dark-800 border flex items-center justify-center transition-all duration-500
                    ${
                      voiceState === 'listening'
                        ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.35)]'
                        : voiceState === 'thinking'
                        ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.35)]'
                        : voiceState === 'speaking'
                        ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.35)]'
                        : voiceState === 'error'
                        ? 'border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.25)]'
                        : 'border-white/10'
                    }`}
                >
                  {voiceState === 'listening' ? (
                    <Mic className="w-12 h-12 text-rose-400 animate-pulse" />
                  ) : voiceState === 'thinking' ? (
                    <Sparkles className="w-10 h-10 text-yellow-300 animate-spin-slow" />
                  ) : voiceState === 'speaking' ? (
                    <Activity className="w-12 h-12 text-cyan-400 animate-pulse" />
                  ) : voiceState === 'error' ? (
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                  ) : (
                    <Activity className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              </div>

              {/* State label */}
              <h3 className="text-lg font-bold text-white tracking-tight mb-1">
                {voiceState === 'listening'
                  ? 'Listening to Patient...'
                  : voiceState === 'thinking'
                  ? 'Clinical AI Thinking...'
                  : voiceState === 'speaking'
                  ? 'Aura AI Speaking'
                  : voiceState === 'error'
                  ? 'Voice Connection Issue'
                  : 'Aura Health Voice Core'}
              </h3>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                {formatTime(timer)} &middot; {selectedLang.toUpperCase()}
              </p>
            </div>

            {/* Audio Waveform */}
            <div className="w-full relative z-10 my-2">{renderWaveform()}</div>

            {/* Live Transcript / Response Console */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 min-h-[90px] max-h-[120px] overflow-y-auto mb-4 flex flex-col justify-center relative z-10">
              {errorMessage ? (
                <div className="text-center text-xs text-rose-400 flex flex-col items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              ) : voiceState === 'listening' ? (
                <p className="text-center text-xs text-gray-400 italic">
                  Listening... speak clearly about your symptoms or scheduling request.
                </p>
              ) : voiceState === 'thinking' ? (
                <p className="text-center text-xs text-yellow-300 animate-pulse">
                  Analyzing triage context and routing to clinical agent...
                </p>
              ) : (
                <div>
                  {transcript && (
                    <p className="text-xs text-gray-400 mb-1">
                      <span className="font-bold text-gray-500 uppercase text-[9px]">You: </span>
                      {transcript}
                    </p>
                  )}
                  {aiResponseText && (
                    <p className="text-xs text-cyan-200 leading-relaxed">
                      <span className="font-bold text-cyan-400 uppercase text-[9px]">Aura AI: </span>
                      {aiResponseText.length > 160 ? `${aiResponseText.slice(0, 160)}...` : aiResponseText}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Control Panel Buttons */}
            <div className="flex items-center gap-4 mb-2 relative z-10">
              {/* Mic toggle */}
              <button
                onClick={voiceState === 'listening' ? () => recognitionRef.current?.stop() : startListening}
                disabled={voiceState === 'thinking'}
                className={`p-4 rounded-full border transition-all duration-300 disabled:opacity-40
                  ${
                    voiceState === 'listening'
                      ? 'bg-rose-500/25 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse'
                      : 'bg-white/5 border-white/10 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-400'
                  }`}
                title={voiceState === 'listening' ? 'Stop Listening' : 'Start Speaking'}
              >
                {voiceState === 'listening' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Stop Speaking button if AI is active */}
              {voiceState === 'speaking' && (
                <button
                  onClick={handleStopSpeaking}
                  className="p-4 rounded-full bg-yellow-500/20 border border-yellow-500 text-yellow-300 hover:bg-yellow-500/30 transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                  title="Stop AI Speaking"
                >
                  <Square className="w-5 h-5" />
                </button>
              )}

              {/* Retry button on error */}
              {voiceState === 'error' && (
                <button
                  onClick={handleRetry}
                  className="p-4 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  title="Retry Voice Input"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}

              {/* End Call button (Hang up) */}
              <button
                onClick={handleHangUp}
                className="p-5 rounded-full bg-rose-600 hover:bg-rose-500 border border-rose-500/30 text-white transition-all shadow-[0_0_25px_rgba(225,29,72,0.5)]"
                title="End Voice Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              {/* Speaker Mute/Unmute */}
              <button
                onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                className={`p-4 rounded-full border transition-all duration-300
                  ${
                    !isSpeakerMuted
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                      : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
                  }`}
                title={isSpeakerMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {!isSpeakerMuted ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>

            {/* Compliance Footer */}
            <div className="flex items-center gap-1.5 justify-center text-[9px] text-gray-500 relative z-10 border-t border-white/5 w-full pt-3 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>HIPAA Compliant &middot; Multi-Agent Healthcare Core</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
