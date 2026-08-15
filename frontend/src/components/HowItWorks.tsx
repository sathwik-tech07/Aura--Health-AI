import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquareText, Cpu, CalendarCheck, ShieldCheck } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: MessageSquareText,
      title: 'Describe Your Health Concern',
      description:
        'Speak naturally or type your symptoms in any of our 18 supported languages. Aura Health AI understands voice and text.',
      color: 'cyan',
    },
    {
      step: '02',
      icon: Cpu,
      title: 'Receive Multi-Agent Triage',
      description:
        'Our clinical reasoning engines evaluate priority, assess risk levels, and determine the exact medical specialty required.',
      color: 'blue',
    },
    {
      step: '03',
      icon: CalendarCheck,
      title: 'Book & Consult Instantly',
      description:
        'Schedule consultations with verified clinic specialists or receive instant preventive care guidelines in your portal.',
      color: 'indigo',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 lg:px-16 max-w-7xl mx-auto relative">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold bg-cyan-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/20">
          Seamless Workflow
        </span>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          How Aura Health AI Works
        </h2>
        <p className="text-sm text-gray-400">
          A streamlined, patient-first approach to medical triage, specialist discovery, and clinical scheduling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between group hover:border-cyan-500/40 transition-all duration-300"
            >
              <div className="absolute top-6 right-6 font-mono text-3xl font-black text-white/10 group-hover:text-cyan-400/20 transition">
                {item.step}
              </div>

              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 flex items-center gap-2 text-xs text-cyan-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Verified Clinical Protocol</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;
