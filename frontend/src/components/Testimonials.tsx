import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  hospital: string;
  metric: string;
}

const TESTIMONIALS_DATA: Testimonial[] = [
  {
    quote: "Implementing AuraHealth reduced our patient phone intake queues by 62% in the first month. Our administrative staff can now focus on high-priority bedside patient care instead of calendar scheduling.",
    author: "Dr. Sarah Jenkins",
    role: "Chief Operating Officer",
    hospital: "St. Jude Medical Center",
    metric: "-62% Intake Queues"
  },
  {
    quote: "The EHR integrations were incredibly seamless. As an IT director, security is my primary concern—AuraHealth met our rigorous HIPAA compliance and SHA-256 data encryption guidelines perfectly.",
    author: "Marcus Vance",
    role: "IT Director",
    hospital: "Metro Health Group",
    metric: "100% HIPAA Compliant"
  },
  {
    quote: "The AI symptom triage core detected acute right lower quadrant pain and pre-notified our emergency intake desk. It saved critical minutes in diagnosing a ruptured appendix. A game changer.",
    author: "Dr. Alan Patel",
    role: "Head of Emergency Medicine",
    hospital: "Tri-County General Hospital",
    metric: "Saved Emergency Triage Minutes"
  }
];

export const Testimonials: React.FC = () => {
  const [index, setIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0); // -1 for left, 1 for right
  const timerRef = useRef<number | null>(null);

  const startTimer = () => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      handleNext();
    }, 6000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [index]);

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + TESTIMONIALS_DATA.length) % TESTIMONIALS_DATA.length);
  };

  const handleDotClick = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  // Slider animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <section id="testimonials" className="relative py-24 px-6 lg:px-16 bg-dark-950 overflow-hidden border-t border-white/5">
      <div className="absolute right-1/4 top-1/4 w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase mb-4 block">Case Studies</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Trusted by Healthcare Directors
          </h2>
        </div>

        {/* Carousel Frame */}
        <div 
          className="relative min-h-[380px] md:min-h-[320px] flex items-center"
          onMouseEnter={stopTimer}
          onMouseLeave={startTimer}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full glass-panel p-8 md:p-12 rounded-3xl border border-white/5 relative shadow-2xl flex flex-col justify-between"
            >
              {/* Giant quote icon */}
              <Quote className="absolute top-6 right-8 w-16 h-16 text-cyan-500/10 pointer-events-none" />

              <div>
                {/* Stars and trust metric */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-cyan-400 text-cyan-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20 uppercase tracking-wider">
                    {TESTIMONIALS_DATA[index].metric}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-lg md:text-xl text-gray-200 font-light leading-relaxed mb-8 italic">
                  "{TESTIMONIALS_DATA[index].quote}"
                </p>
              </div>

              {/* Author Metadata */}
              <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-2">
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight">
                    {TESTIMONIALS_DATA[index].author}
                  </h4>
                  <p className="text-xs text-gray-400 font-medium">
                    {TESTIMONIALS_DATA[index].role}, <span className="text-cyan-400">{TESTIMONIALS_DATA[index].hospital}</span>
                  </p>
                </div>

                {/* Custom corporate avatar badge */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-sm tracking-tighter">
                  {TESTIMONIALS_DATA[index].author.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between mt-8 px-4">
          <div className="flex items-center gap-2">
            {TESTIMONIALS_DATA.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-cyan-400' : 'w-2 bg-gray-600'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full bg-white/5 border border-white/5 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-400 transition-all hover:bg-cyan-500/5"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-white/5 border border-white/5 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-400 transition-all hover:bg-cyan-500/5"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
