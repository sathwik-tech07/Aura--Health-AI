import React, { useState } from 'react';
import {
  Home,
  LayoutDashboard,
  Stethoscope,
  Calendar,
  MessageSquare,
  LogIn,
  LogOut,
  Activity,
  Menu,
  X,
  ShieldCheck,
  User,
  Mic,
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export type PageKey = 'none' | 'dashboard' | 'employer' | 'appointments' | 'conversations' | 'doctors';

interface HeaderProps {
  currentPage: PageKey;
  token: string | null;
  user?: { id: number; name: string; email: string; role: string } | null;
  onLogin: () => void;
  onLogout: () => void;
  onNavigate: (page: PageKey) => void;
  onStartChat: () => void;
  onStartVoice: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  token,
  user,
  onLogin,
  onLogout,
  onNavigate,
  onStartChat,
  onStartVoice,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isEmployer = user?.role === 'employer' || user?.role === 'admin';

  // Role-specific navigation tabs
  const navItems = [
    { key: 'none' as PageKey, label: 'Home', icon: Home },
    ...(isEmployer
      ? [{ key: 'employer' as PageKey, label: 'Employer Portal', icon: ShieldCheck }]
      : [{ key: 'dashboard' as PageKey, label: 'Patient Portal', icon: LayoutDashboard }]),
    { key: 'doctors' as PageKey, label: 'Doctors', icon: Stethoscope },
    { key: 'appointments' as PageKey, label: 'Appointments', icon: Calendar },
    { key: 'conversations' as PageKey, label: 'History', icon: MessageSquare },
  ];

  const handleNav = (key: PageKey) => {
    onNavigate(key);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 lg:px-12 py-4 bg-dark-950/80 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => handleNav('none')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center group-hover:border-cyan-400 transition-all">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Aura<span className="text-cyan-400">Health AI</span></span>
              {isEmployer && (
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.5 rounded-full font-mono uppercase">
                  Employer
                </span>
              )}
            </h1>
            <p className="text-[9px] tracking-widest text-gray-400 uppercase">
              {isEmployer ? 'Employer Healthcare Operations' : 'Intelligent Clinical Platform'}
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-3 py-1.5 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? item.key === 'employer'
                      ? 'bg-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                      : 'bg-cyan-500 text-dark-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Tools: AI Actions, Language & User Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Quick AI Trigger */}
          <button
            onClick={onStartChat}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 transition"
          >
            <Stethoscope size={13} />
            <span>AI Check</span>
          </button>

          {/* Quick Voice Trigger */}
          <button
            onClick={onStartVoice}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 hover:border-blue-400 text-blue-300 text-xs font-semibold hover:bg-blue-500/20 transition"
          >
            <Mic size={13} />
            <span>Voice</span>
          </button>

          {/* Header Language Picker */}
          <LanguageSelector variant="header" />

          {!token ? (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-500 text-dark-950 text-xs font-bold hover:bg-cyan-400 shadow-md transition"
            >
              <LogIn size={14} />
              Login
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                <User size={13} className={isEmployer ? 'text-indigo-400' : 'text-cyan-400'} />
                <span className="font-medium truncate max-w-[120px]">{user?.name?.split(' ')[0] || 'User'}</span>
              </div>
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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? item.key === 'employer'
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

          <div className="pt-2 border-t border-white/5 flex gap-2">
            <button
              onClick={() => {
                onStartChat();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold"
            >
              AI Triage Check
            </button>
            <button
              onClick={() => {
                onStartVoice();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold"
            >
              Voice Call
            </button>
          </div>

          <div className="pt-2">
            {!token ? (
              <button
                onClick={() => {
                  onLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-500 text-dark-950 font-bold text-sm"
              >
                Login to Portal
              </button>
            ) : (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm"
              >
                Logout ({user?.name || 'User'})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;