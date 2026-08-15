import React from 'react';
import { Activity, Shield, Mail, Phone, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onLoginClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onLoginClick }) => {
  return (
    <footer className="bg-dark-950 border-t border-white/10 pt-16 pb-12 px-6 lg:px-16 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
        {/* Brand Col */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              Aura<span className="text-cyan-400">Health AI</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Next-generation healthcare intelligence platform providing AI clinical triage, multilingual voice consultation, and secure specialist scheduling.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <Shield className="w-3.5 h-3.5" />
            HIPAA-Ready Security
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Navigation
          </h4>
          <ul className="space-y-2">
            <li><a href="#about" className="hover:text-cyan-400 transition">About Aura Health</a></li>
            <li><a href="#features" className="hover:text-cyan-400 transition">Features &amp; AI Engine</a></li>
            <li><a href="#how-it-works" className="hover:text-cyan-400 transition">How It Works</a></li>
            <li><a href="#clinic-info" className="hover:text-cyan-400 transition">Clinic Campus &amp; Hours</a></li>
            <li>
              <button onClick={onLoginClick} className="hover:text-cyan-400 transition text-left">
                Patient / Employer Portal Login
              </button>
            </li>
          </ul>
        </div>

        {/* Clinical Services */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Specialist Coverage
          </h4>
          <ul className="space-y-2">
            <li>General Medicine &amp; OPD</li>
            <li>Cardiology &amp; Heart Care</li>
            <li>Orthopedics &amp; Joint Health</li>
            <li>Neurology &amp; Brain Health</li>
            <li>Pediatrics &amp; Child Care</li>
            <li>Dermatology &amp; ENT</li>
          </ul>
        </div>

        {/* Contact & Hours */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Clinic Information
          </h4>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Plot 42, Healthtech Corridor, Cyber City, Hyderabad, 500081</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>+91-9876543210 (24/7 AI Triage)</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>support@aurahealthai.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-[11px]">
        <p>© 2026 Aura Health AI Inc. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for accessible, intelligent healthcare worldwide.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
