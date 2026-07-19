import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Mic, 
  Calendar, 
  Database, 
  AlertCircle, 
  Languages 
} from 'lucide-react';

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  glowColor: string;
}

export const Features: React.FC = () => {
  const featuresList: FeatureItem[] = [
    {
      icon: <Clock className="w-6 h-6 text-cyan-400" />,
      title: "24/7 Patient Support",
      description: "Automate symptom triage and basic queries at any hour. Minimize clinic call queues and route complex cases instantly.",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
    },
    {
      icon: <Mic className="w-6 h-6 text-blue-400" />,
      title: "Voice AI Assistant",
      description: "Provide conversational voice assistance over traditional phone lines. Responds naturally to medical intent and triage needs.",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
    },
    {
      icon: <Calendar className="w-6 h-6 text-teal-400" />,
      title: "Appointment Scheduling",
      description: "Direct patient calendar syncing. Auto-reschedules appointments, sends prescription reminders, and integrates with EHR/EMR.",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(20,184,166,0.15)]"
    },
    {
      icon: <Database className="w-6 h-6 text-purple-400" />,
      title: "Medical Information",
      description: "Instantly retrieve clinical details, clinic addresses, physician schedules, and FAQs. Backed by verified local hospital content.",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-rose-400" />,
      title: "Emergency Guidance",
      description: "Detect urgent triggers instantly. Directs critical patients to the nearest trauma unit and provides first-responder advice.",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]"
    },
    {
      icon: <Languages className="w-6 h-6 text-emerald-400" />,
      title: "Multilingual Support",
      description: "Break communication barriers. Communicate with patients in over 50+ languages with automated real-time translation.",
      glowColor: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  };

  return (
    <section id="features" className="relative py-24 px-6 lg:px-16 bg-dark-950 overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute right-0 top-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute left-0 bottom-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase mb-4"
          >
            Capabilities Platform
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-6"
          >
            Intelligent Triage & Support Suite
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-400 font-light"
          >
            Leverage safe, compliant, and robust clinical workflows that elevate the patient care standard and streamline administration.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {featuresList.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className={`group relative glass-card p-8 rounded-3xl overflow-hidden flex flex-col justify-between h-[280px] hover:border-cyan-500/30 ${item.glowColor}`}
            >
              {/* Internal glow dot */}
              <span className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/2 opacity-[0.02] group-hover:bg-cyan-500/10 group-hover:opacity-[0.08] transition-all duration-500 blur-2xl" />

              <div>
                {/* Icon wrapper */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 w-fit mb-6 transition-all duration-300">
                  {item.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-cyan-400 transition-colors duration-300">
                  {item.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-gray-400 font-normal leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {item.description}
                </p>
              </div>

              {/* Card Footer Arrow Indicator */}
              <div className="w-full flex justify-end mt-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                  System Active &rarr;
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};
