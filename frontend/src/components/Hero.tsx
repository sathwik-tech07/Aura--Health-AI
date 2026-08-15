import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  PhoneCall,
  Activity,
  Shield,
  ArrowRight,
  Sparkles,
  Globe,
} from 'lucide-react';
import { HeartbeatLine } from './HeartbeatLine';

interface HeroProps {
  onGetStarted: () => void;
  onExploreFeatures: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onGetStarted,
  onExploreFeatures,
}) => {
  const { scrollY } = useScroll();

  const yBg = useTransform(scrollY, [0, 500], [0, 120]);
  const opacityBg = useTransform(scrollY, [0, 500], [1, 0.4]);
  const scaleBg = useTransform(scrollY, [0, 500], [1.05, 1.12]);

  return (
    <section id="home" className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-dark-950 pt-28">
      {/* Background Graphic & Backdrop */}
      <motion.div
        style={{ y: yBg, opacity: opacityBg, scale: scaleBg }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1631217818202-90f4e77aa6ad?auto=format&fit=crop&q=80&w=2000")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950/80 via-dark-950/90 to-dark-950 z-10" />
        <div className="absolute inset-0 radial-glow z-10" />
        <div className="absolute inset-0 cyber-grid opacity-25 z-10" />
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-20 flex-grow flex items-center px-6 lg:px-16 max-w-7xl mx-auto w-full py-12">
        <div className="max-w-3xl space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              Next-Gen Medical Intelligence
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight"
          >
            A Smarter Way to <br />
            <span className="text-gradient-neon">Access Healthcare</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl"
          >
            AI-powered healthcare assistance, appointment support, and multilingual voice interaction — available when you need it.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 rounded-2xl text-dark-950 font-extrabold text-sm shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-105 hover:from-cyan-400 hover:to-blue-500 transition duration-300"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreFeatures}
              className="flex items-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white px-7 py-3.5 rounded-2xl font-bold text-sm transition duration-300 backdrop-blur-md"
            >
              <span>Explore Features</span>
            </button>
          </motion.div>

          {/* Trust Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10 text-xs text-gray-300"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-semibold">24/7 AI Triage</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-semibold">18 Languages</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <PhoneCall className="w-4 h-4" />
              </div>
              <span className="font-semibold">Voice Powered</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-semibold">HIPAA Ready</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Heartbeat Line Bottom Visual */}
      <div className="relative z-20">
        <HeartbeatLine />
      </div>
    </section>
  );
};

export default Hero;
