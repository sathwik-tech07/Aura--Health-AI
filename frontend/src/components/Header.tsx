import React, { useState } from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  Calendar,
  MessageSquare,
  LogOut,
  Activity,
  Menu,
  X,
  ShieldCheck,
  User,
  Mic,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export type PageKey = 'none' | 'dashboard' | 'employer' | 'appointments' | 'conversations' | 'doctors';

interface HeaderProps {
  currentPage: PageKey;
  token: string | null;
  user?: { id: number; name: string; email: string; role: string } | null;
  onPatientLogin: () => void;
  onEmployerLogin: () => void;
  onLogout: () => void;
  onNavigate: (page: PageKey) => void;
  onStartChat: () => void;
  onStartVoice: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  token,
  user,
  onPatientLogin,
  onEmployerLogin,
  onLogout,
  onNavigate,
  onStartChat,
  onStartVoice,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = Boolean(token);
  const isEmployer = user?.role === 'employer' || user?.role === 'admin';

  // 1. PUBLIC MARKETING NAVBAR (Logged Out)
  const publicNavLinks = [
    { label: 'Home', href: '#home', onClick: () => onNavigate('none') },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Voice AI', href: '#voice-demo' },
    { label: 'About', href: '#statistics' },
    { label: 'Contact', href: '#clinic-info' },
  ];

  // 2. PATIENT PORTAL NAVBAR (Logged In Patient)
  const patientNavLinks = [
    { key: 'dashboard' as PageKey, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'doctors' as PageKey, label: 'Doctors', icon: Stethoscope },
    { key: 'appointments' as PageKey, label: 'My Appointments', icon: Calendar },
    { key: 'conversations' as PageKey, label: 'History', icon: MessageSquare },
  ];

  // 3. EMPLOYER PORTAL NAVBAR (Logged In Employer)
  const employerNavLinks = [
    { key: 'employer' as PageKey, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'appointments' as PageKey, label: 'Appointments', icon: Calendar },
    { key: 'doctors' as PageKey, label: 'Doctors', icon: Stethoscope },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 lg:px-12 py-3.5 bg-dark-950/85 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate(isAuthenticated ? (isEmployer ? 'employer' : 'dashboard') : 'none')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center group-hover:border-cyan-400 transition-all">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>Aura<span className="text-cyan-400">Health AI</span></span>
              {isAuthenticated && (
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider ${
                    isEmployer
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {isEmployer ? 'Employer Portal' : 'Patient Portal'}
                </span>
              )}
            </h1>
            <p className="text-[9px] tracking-widest text-gray-400 uppercase">
              {isAuthenticated
                ? isEmployer
                  ? 'Clinic Operations & Management'
                  : 'Personal AI Health Assistant'
                : 'Intelligent Healthcare Platform'}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 shadow-inner">
          {!isAuthenticated ? (
            // PUBLIC MARKETING LINKS
            publicNavLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={item.onClick}
                className="px-3.5 py-1 text-xs font-medium text-gray-300 hover:text-cyan-400 hover:bg-white/5 rounded-full transition"
              >
                {item.label}
              </a>
            ))
          ) : isEmployer ? (
            // EMPLOYER PORTAL LINKS
            employerNavLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })
          ) : (
            // PATIENT PORTAL LINKS
            patientNavLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                    isActive
                      ? 'bg-cyan-500 text-dark-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })
          )}
        </nav>

        {/* Right Tools & Authentication Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Header Language Selector */}
          <LanguageSelector variant="header" />

          {!isAuthenticated ? (
            // PUBLIC ACTIONS: Employer Login & Get Started (Patient)
            <div className="flex items-center gap-2">
              <button
                onClick={onEmployerLogin}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition flex items-center gap-1.5"
              >
                <ShieldCheck size={13} className="text-indigo-400" />
                <span>Employer Login</span>
              </button>

              <button
                onClick={onPatientLogin}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-dark-950 text-xs font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-105 transition"
              >
                <Sparkles size={13} />
                <span>Get Started</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            // AUTHENTICATED ACTIONS: AI Quick Triggers + Profile + Logout
            <div className="flex items-center gap-2">
              {/* Quick AI Triggers for Patients */}
              {!isEmployer && (
                <>
                  <button
                    onClick={onStartChat}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 transition"
                  >
                    <Stethoscope size={13} />
                    <span>AI Check</span>
                  </button>
                  <button
                    onClick={onStartVoice}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 hover:border-blue-400 text-blue-300 text-xs font-semibold hover:bg-blue-500/20 transition"
                  >
                    <Mic size={13} />
                    <span>Voice</span>
                  </button>
                </>
              )}

              {/* User Profile Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                <User size={13} className={isEmployer ? 'text-indigo-400' : 'text-cyan-400'} />
                <span className="font-medium truncate max-w-[110px]">{user?.name?.split(' ')[0] || 'User'}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-xs font-medium transition-all"
                title="Sign out"
              >
                <LogOut size={13} />
                <span className="text-[11px]">Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSelector variant="header" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-2 pb-2">
          {!isAuthenticated ? (
            <>
              {publicNavLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onPatientLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-dark-950 font-extrabold text-sm"
                >
                  Get Started (Patient)
                </button>
                <button
                  onClick={() => {
                    onEmployerLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold text-sm"
                >
                  Employer Login
                </button>
              </div>
            </>
          ) : (
            <>
              {(isEmployer ? employerNavLinks : patientNavLinks).map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onNavigate(item.key);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? isEmployer
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-cyan-500 text-dark-950 font-bold'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm"
                >
                  Logout ({user?.name || 'User'})
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;