import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Terminal, ArrowRight, ShieldCheck } from 'lucide-react';

interface CTAProps {
  onStartChat: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onStartChat }) => {
  return (
    <section className="relative py-24 px-6 lg:px-16 bg-dark-950 overflow-hidden border-t border-white/5">
      {/* Visual cyber design assets */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-[0.04]" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Holographic Banner Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative glass-panel rounded-3xl p-8 md:p-16 border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden text-center flex flex-col items-center"
        >
          {/* Animated vertical scanline overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-1/2 w-full animate-scanline pointer-events-none" />
          
          {/* Decorative tech corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/40 rounded-br-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 w-fit mb-8 shadow-[0_0_15px_rgba(6,182,212,0.2)] animate-pulse">
            <Cpu className="w-8 h-8 text-cyan-400" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-2xl">
            Transform Your Hospital with <span className="text-gradient-neon font-black">Clinical AI</span>
          </h2>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-300 font-light max-w-xl mb-10 leading-relaxed">
            Deploy secure chat and voice assistants configured to your clinic's hours, physicians, and local EMR logs. Setup in less than 72 hours.
          </p>

          {/* CTA Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center sm:w-auto">
            <motion.button
              onClick={onStartChat}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <span>Test System Core</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.a
              href="mailto:integrations@aurahealth.ai"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="glass-button text-white border-white/10 hover:border-cyan-500/50 py-4 px-8 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Contact Integration Hub</span>
            </motion.a>
          </div>

          {/* Compliance statement */}
          <div className="flex items-center gap-1.5 mt-10 text-[10px] uppercase font-bold tracking-widest text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>SOC2 Type II & HIPAA Certified Cloud Architecture</span>
          </div>

        </motion.div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500">
          <div>&copy; {new Date().getFullYear()} AuraHealth AI Inc. All rights reserved.</div>
          <div className="flex gap-6 font-semibold uppercase tracking-wider">
            <a href="#privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
            <a href="#security" className="hover:text-cyan-400 transition-colors">HIPAA Disclosure</a>
          </div>
        </footer>

      </div>
    </section>
  );
};
