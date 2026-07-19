import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, HeartHandshake, ShieldAlert, Award } from 'lucide-react';

interface StatItem {
  icon: React.ReactNode;
  label: string;
  targetNum: number;
  suffix: string;
  subText: string;
}

const CountUp: React.FC<{ to: number; duration?: number; suffix?: string }> = ({ to, duration = 2.5, suffix = '' }) => {
  const [count, setCount] = useState<number>(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      // easeOutQuad or easeOutExpo
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easedProgress * to));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, to, duration]);

  return (
    <span ref={ref} className="font-extrabold tracking-tight">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

export const Stats: React.FC = () => {
  const statsList: StatItem[] = [
    {
      icon: <Users className="w-5 h-5 text-cyan-400" />,
      label: "Patients Served",
      targetNum: 10000,
      suffix: "+",
      subText: "Automated triage & chat routing support"
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-blue-400" />,
      label: "Satisfaction Rate",
      targetNum: 98,
      suffix: "%",
      subText: "Positive clinical feedback reports"
    },
    {
      icon: <Award className="w-5 h-5 text-teal-400" />,
      label: "Partner Clinics",
      targetNum: 50,
      suffix: "+",
      subText: "Integrations in regional hospitals"
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-purple-400" />,
      label: "Availability",
      targetNum: 24,
      suffix: "/7",
      subText: "Zero downtime AI service uptime"
    }
  ];

  return (
    <section id="statistics" className="relative py-20 px-6 lg:px-16 bg-dark-950 overflow-hidden border-t border-white/5">
      {/* Subtle background grids */}
      <div className="absolute inset-0 cyber-grid opacity-[0.05]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Stat Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {statsList.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-panel p-8 rounded-3xl border border-white/5 relative flex flex-col justify-between h-52 group hover:border-cyan-500/25 transition-all duration-300"
            >
              {/* Upper row */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">{stat.label}</span>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all duration-300">
                  {stat.icon}
                </div>
              </div>

              {/* Counter Number */}
              <div className="my-3 text-4xl lg:text-5xl text-white">
                <CountUp to={stat.targetNum} suffix={stat.suffix} />
              </div>

              {/* Subtext info */}
              <p className="text-xs text-gray-400 font-normal">{stat.subText}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
