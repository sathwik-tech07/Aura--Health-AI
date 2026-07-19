import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Phone, CheckCircle2, Play, Square } from 'lucide-react';

interface ScriptLine {
  speaker: 'patient' | 'assistant' | 'system';
  text: string;
  duration: number; // ms
}

const DEMO_SCRIPT: ScriptLine[] = [
  { speaker: 'system', text: 'Initiating connection to AURAHEALTH Clinical Core...', duration: 2000 },
  { speaker: 'assistant', text: 'Thank you for calling AuraHealth AI triage. I am your virtual clinic nurse. How can I help you today?', duration: 5000 },
  { speaker: 'patient', text: 'Hello, I have had a dull pain in my lower right abdomen for about 6 hours. I wanted to see if I should go to urgent care.', duration: 6000 },
  { speaker: 'assistant', text: 'I understand. To check if this is urgent, do you also have a fever, nausea, or is the pain worsening when you walk?', duration: 6000 },
  { speaker: 'patient', text: 'Yes, I feel slightly nauseous, and walking definitely makes the pain sharper.', duration: 5000 },
  { speaker: 'assistant', text: 'Thank you. Lower right abdominal pain with nausea and movement sensitivity can be a sign of appendicitis. I strongly advise you to visit the nearest emergency department for an evaluation. Would you like me to send hospital routing to your mobile phone?', duration: 9000 },
  { speaker: 'patient', text: 'Yes, please send it to my number ending in 4421.', duration: 4000 },
  { speaker: 'assistant', text: 'Routing sent. The closest ER is General Hospital, 1.8 miles away. I have pre-alerted their intake desk with your basic symptom logs to speed up your triage. Please travel safely.', duration: 8000 },
  { speaker: 'system', text: 'Triage ticket closed. Medical file transmitted securely (Encrypted SHA-256).', duration: 3000 },
];

export const VoiceDemo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [transcript, setTranscript] = useState<ScriptLine[]>([]);
  const [speakerState, setSpeakerState] = useState<'idle' | 'system' | 'patient' | 'assistant'>('idle');

  useEffect(() => {
    if (!isPlaying) {
      setSpeakerState('idle');
      return;
    }

    setTranscript([DEMO_SCRIPT[currentLineIndex]]);
    setSpeakerState(DEMO_SCRIPT[currentLineIndex].speaker);

    const timer = setTimeout(() => {
      if (currentLineIndex < DEMO_SCRIPT.length - 1) {
        setCurrentLineIndex((prev) => prev + 1);
      } else {
        // Loop script
        setCurrentLineIndex(0);
      }
    }, DEMO_SCRIPT[currentLineIndex].duration);

    return () => clearTimeout(timer);
  }, [currentLineIndex, isPlaying]);

  useEffect(() => {
    if (currentLineIndex === 0) {
      setTranscript([DEMO_SCRIPT[0]]);
    } else {
      setTranscript((prev) => {
        // Keep the last 3 lines for clean visual layout
        const nextList = [...prev, DEMO_SCRIPT[currentLineIndex]];
        if (nextList.length > 3) {
          return nextList.slice(nextList.length - 3);
        }
        return nextList;
      });
    }
  }, [currentLineIndex]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setCurrentLineIndex(0);
    }
  };

  // Generate dynamic wave bars based on speaker
  const renderWaveform = () => {
    let barCount = 18;
    let animClass = 'h-3 bg-cyan-500/20';
    
    if (speakerState === 'assistant') {
      animClass = 'bg-cyan-400 animate-waveform shadow-[0_0_10px_rgba(6,182,212,0.5)]';
    } else if (speakerState === 'patient') {
      animClass = 'bg-blue-400 animate-waveform shadow-[0_0_10px_rgba(59,130,246,0.5)]';
    }

    return (
      <div className="flex items-center gap-1.5 h-20 justify-center">
        {Array.from({ length: barCount }).map((_, i) => {
          // Stagger the animation durations for an organic look
          const delay = (i % 5) * 0.15;
          const height = speakerState === 'assistant' 
            ? Math.sin(i) * 35 + 45 
            : speakerState === 'patient' 
              ? Math.sin(i) * 20 + 25 
              : 8;

          return (
            <motion.div
              key={i}
              animate={{ 
                height: speakerState === 'idle' || speakerState === 'system' ? 8 : height 
              }}
              transition={{
                type: 'spring',
                stiffness: 120,
                damping: 15,
                delay: isPlaying ? delay : 0
              }}
              className={`w-1.5 rounded-full transition-colors duration-500 ${animClass}`}
              style={{ animationDelay: `${delay}s` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <section id="voice-demo" className="relative py-24 px-6 lg:px-16 bg-dark-950 overflow-hidden">
      {/* Visual neon lines backgrounds */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase mb-4 block">Interactive Demo</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-6">
            AI Voice Agent in Action
          </h2>
          <p className="text-lg text-gray-400 font-light">
            Listen or review how our clinical voice core answers routing requests, schedules tests, and executes HIPAA-safe data intakes.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          
          {/* Waveform & Mic (Left) */}
          <div className="lg:col-span-5 glass-panel p-8 rounded-3xl flex flex-col items-center justify-between min-h-[420px] relative border border-white/5 shadow-2xl">
            {/* Holographic grid layer inside card */}
            <div className="absolute inset-0 cyber-grid opacity-[0.15] rounded-3xl pointer-events-none" />
            
            <div className="w-full flex items-center justify-between relative z-10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-cyan-500 animate-pulse' : 'bg-gray-500'}`} />
                Status: {speakerState === 'system' ? 'System Sync' : speakerState === 'assistant' ? 'AI Nurse Speaking' : speakerState === 'patient' ? 'Patient Speaking' : 'Standby'}
              </span>
              <button 
                onClick={togglePlayback}
                className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-gray-300 hover:text-cyan-400 transition-all"
              >
                {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            {/* Microphone Circle Visualizer */}
            <div className="relative my-6 z-10 flex items-center justify-center">
              {/* Pulsing glow boundary rings */}
              <AnimatePresence>
                {isPlaying && speakerState !== 'idle' && (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.8 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                      className="absolute w-36 h-36 rounded-full border border-cyan-500/20"
                    />
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.7, ease: "easeOut" }}
                      className="absolute w-36 h-36 rounded-full border border-blue-500/10"
                    />
                  </>
                )}
              </AnimatePresence>

              {/* Main Glowing Circle */}
              <div className={`w-32 h-32 rounded-full flex items-center justify-center border transition-all duration-700 bg-dark-900/80
                ${speakerState === 'assistant' 
                  ? 'border-cyan-500/80 shadow-[0_0_35px_rgba(6,182,212,0.3)]' 
                  : speakerState === 'patient' 
                    ? 'border-blue-500/80 shadow-[0_0_35px_rgba(59,130,246,0.3)]' 
                    : 'border-white/10'
                }`}
              >
                <Mic className={`w-12 h-12 transition-colors duration-500 
                  ${speakerState === 'assistant' 
                    ? 'text-cyan-400' 
                    : speakerState === 'patient' 
                      ? 'text-blue-400' 
                      : 'text-gray-500'
                  }`} 
                />
              </div>
            </div>

            {/* Waveform Output */}
            <div className="w-full relative z-10">
              {renderWaveform()}
              <div className="text-center text-xs text-gray-500 mt-2 font-medium tracking-wide uppercase">
                Clinical Wave Voice Engine
              </div>
            </div>
          </div>

          {/* Transcript Console (Right) */}
          <div className="lg:col-span-7 glass-panel p-8 rounded-3xl flex flex-col min-h-[420px] justify-between border border-white/5 shadow-2xl relative">
            <div className="absolute inset-0 bg-dark-950/20 rounded-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 relative z-10">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400 animate-bounce" />
                Live Conversation Logs
              </span>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                Active Call
              </span>
            </div>

            {/* Console Scrollable Text */}
            <div className="flex-grow flex flex-col gap-4 overflow-y-auto max-h-[260px] pr-2 relative z-10 justify-end">
              <AnimatePresence initial={false}>
                {transcript.map((line, idx) => {
                  let bubbleClass = "bg-white/5 text-gray-300 self-start border border-white/5";
                  let label = "Patient";
                  let avatarGlow = "bg-blue-500";

                  if (line.speaker === 'assistant') {
                    bubbleClass = "bg-cyan-950/20 text-cyan-100 self-start border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]";
                    label = "Aura Nurse";
                    avatarGlow = "bg-cyan-500";
                  } else if (line.speaker === 'system') {
                    bubbleClass = "bg-dark-900/80 text-cyan-400/80 self-center text-center italic text-xs font-mono py-2 px-4 border border-cyan-500/10";
                    label = "SYS";
                  }

                  if (line.speaker === 'system') {
                    return (
                      <motion.div
                        key={idx + '-' + line.text}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className={`${bubbleClass} max-w-full rounded-xl`}
                      >
                        {line.text}
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={idx + '-' + line.text}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col gap-1 w-full"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        <span className={`w-1.5 h-1.5 rounded-full ${avatarGlow}`} />
                        {label}
                      </div>
                      <div className={`${bubbleClass} px-5 py-3.5 rounded-2xl max-w-[85%] text-sm font-normal leading-relaxed`}>
                        {line.text}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Verification Tag at the bottom of the console */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 relative z-10">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                <span>HIPAA Encrypted Channel</span>
              </div>
              <span>Latency: ~210ms</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
