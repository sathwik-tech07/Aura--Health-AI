import React from 'react';

interface HeartbeatLineProps {
  className?: string;
}

export const HeartbeatLine: React.FC<HeartbeatLineProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full overflow-hidden h-20 pointer-events-none ${className}`}>
      <svg
        className="w-full h-full opacity-40"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
      >
        <path
          className="ecg-line stroke-[2.5] fill-none"
          stroke="url(#ecgGradient)"
          d="M 0,50 
             L 250,50 
             L 270,30 L 280,85 L 295,5 L 310,95 L 320,40 L 335,50 
             L 650,50 
             L 670,30 L 680,85 L 695,5 L 710,95 L 720,40 L 735,50 
             L 1050,50 
             L 1070,30 L 1080,85 L 1095,5 L 1110,95 L 1120,40 L 1135,50 
             L 1440,50"
        />
        <defs>
          <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.1" />
            <stop offset="15%" stopColor="#1e3a8a" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
            <stop offset="85%" stopColor="#14b8a6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
