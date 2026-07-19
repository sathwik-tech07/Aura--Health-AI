import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  PhoneCall,
  Activity,
  Shield,
  Cpu,
} from 'lucide-react';
import { HeartbeatLine } from './HeartbeatLine';

interface HeroProps {
  onStartChat: () => void;
  onStartVoice: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartChat,
  onStartVoice,
}) => {
  const { scrollY } = useScroll();

  const yBg = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityBg = useTransform(scrollY, [0, 500], [1, 0.4]);
  const scaleBg = useTransform(scrollY, [0, 500], [1.05, 1.15]);

  return (
    <section className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-dark-950">

      {/* Background */}
      <motion.div
        style={{ y: yBg, opacity: opacityBg, scale: scaleBg }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1631217818202-90f4e77aa6ad?auto=format&fit=crop&q=80&w=2000")',
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-dark-950/70 via-dark-950/85 to-dark-950 z-10" />
        <div className="absolute inset-0 radial-glow z-10" />
        <div className="absolute inset-0 cyber-grid opacity-35 z-10" />
      </motion.div>

      {/* Navbar */}
      <header className="relative z-30 w-full px-6 lg:px-16 py-6 flex items-center justify-between">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3">

            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                Aura<span className="text-cyan-400">Health AI</span>
              </h2>

              <p className="text-[11px] uppercase tracking-widest text-cyan-400">
                Multi-Agent Healthcare Platform
              </p>
            </div>

          </div>
        </motion.div>

        <nav className="hidden md:flex items-center gap-8 glass-panel py-2 px-8 rounded-full">

          <a href="#features" className="text-gray-300 hover:text-cyan-400">
            Features
          </a>

          <a href="#voice-demo" className="text-gray-300 hover:text-cyan-400">
            Voice AI
          </a>

          <a href="#statistics" className="text-gray-300 hover:text-cyan-400">
            Statistics
          </a>

          <a href="#testimonials" className="text-gray-300 hover:text-cyan-400">
            Why AuraHealth AI
          </a>

        </nav>

      </header>

      {/* Hero Content */}

      <div className="relative z-20 flex-grow flex items-center px-6 lg:px-16 max-w-7xl mx-auto">

        <div className="max-w-3xl">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6"
          >

            <Cpu className="w-4 h-4 text-cyan-400" />

            <span className="text-xs uppercase tracking-widest text-cyan-300">
              Powered by Multi-Agent AI
            </span>

          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6"
          >

            Aura<span className="text-gradient-neon">Health AI</span>

            <br />

            <span className="text-3xl lg:text-4xl font-semibold text-gray-200">
              Your 24/7 Intelligent Healthcare Assistant
            </span>

          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg text-gray-300 leading-8 mb-10"
          >

            Experience AI-powered healthcare with instant symptom analysis,
            emergency detection, doctor recommendations, appointment booking,
            billing assistance, voice consultation, and hospital support —
            all in one intelligent platform.

          </motion.p>

          <div className="flex flex-wrap gap-5">

            <button
              onClick={onStartChat}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-2xl text-white font-semibold shadow-xl hover:scale-105 transition"
            >
              🩺 Start Consultation
            </button>

            <button
              onClick={onStartVoice}
              className="border border-cyan-500 text-white px-8 py-4 rounded-2xl hover:bg-cyan-500/10 transition"
            >
              🎤 Voice Consultation
            </button>

          </div>

          <div className="flex flex-wrap gap-8 mt-12 text-sm text-gray-400">

            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              24/7 Available
            </div>

            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Multi-Agent AI
            </div>

            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              Voice Enabled
            </div>

            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Emergency Ready
            </div>

          </div>

        </div>

      </div>

      <div className="relative z-20">
        <HeartbeatLine />
      </div>

    </section>
  );
};

