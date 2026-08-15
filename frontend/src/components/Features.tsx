import React from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Mic,
  Languages,
  CalendarCheck,
  ShieldCheck,
  FileHeart,
} from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: Cpu,
      title: 'AI Healthcare Assistant',
      description:
        'Get instant, conversational clinical triage and guidance for healthcare questions, priority scoring, and symptoms.',
      badge: 'Clinical Engine',
      color: 'cyan',
    },
    {
      icon: Mic,
      title: 'Voice AI Interaction',
      description:
        'Speak naturally with Aura Health AI and receive complete, fluent spoken voice responses powered by advanced neural speech.',
      badge: 'Natural Speech',
      color: 'blue',
    },
    {
      icon: Languages,
      title: 'Multilingual Support',
      description:
        'Interact with the assistant natively in 18 supported languages including English, Hindi, Telugu, Spanish, French, and German.',
      badge: '18 Languages',
      color: 'indigo',
    },
    {
      icon: CalendarCheck,
      title: 'Appointment Assistance',
      description:
        'Easily discover specialists, view real-time availability, and schedule clinical consultations through the secure patient portal.',
      badge: 'Smart Booking',
      color: 'purple',
    },
    {
      icon: ShieldCheck,
      title: 'Emergency Triage Protocol',
      description:
        'Autonomous multi-intent reasoning flags high-risk red-flag symptoms and provides immediate emergency helpline guidance.',
      badge: '24/7 Safety',
      color: 'rose',
    },
    {
      icon: FileHeart,
      title: 'Secure Patient History',
      description:
        'Maintain a private, encrypted log of your symptoms, triage reports, and clinical consultation history in your account.',
      badge: 'Privacy First',
      color: 'emerald',
    },
  ];

  return (
    <section id="features" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto relative">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold bg-cyan-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/20">
          Core Capabilities
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Intelligent Healthcare Features
        </h2>
        <p className="text-sm sm:text-base text-gray-300">
          Aura Health AI combines clinical intelligence, real-time voice agents, and seamless appointment booking into a unified digital health ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between hover:border-cyan-500/40 hover:bg-white/[0.07] transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-300 transition">
                  {feature.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-white/5 text-xs text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Explore via Patient Portal</span>
                <span>→</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;
