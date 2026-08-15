import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';

interface CTAProps {
  onGetStarted: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onGetStarted }) => {
  return (
    <section className="py-24 px-6 lg:px-16 max-w-7xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="glass-panel p-10 sm:p-16 rounded-3xl border border-cyan-500/30 text-center relative overflow-hidden space-y-6 shadow-[0_0_60px_rgba(6,182,212,0.15)]"
      >
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Start Your Health Journey</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto leading-tight">
          Ready to Experience the Future of Digital Healthcare?
        </h2>

        <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
          Create your free patient account today to access 24/7 AI consultations, multilingual voice support, and direct doctor appointment booking.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-dark-950 font-extrabold text-sm shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-105 transition duration-300 w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Free Account / Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            100% Free &amp; Secure Registration
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            No Credit Card Required
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            Instant Portal Access
          </span>
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;
