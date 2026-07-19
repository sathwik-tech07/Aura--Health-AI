import React from "react";
import {
  Home,
  Stethoscope,
  Calendar,
  MessageCircle,
  LogIn,
  LogOut,
  Activity,
} from "lucide-react";

type PageKey = "none" | "appointments" | "conversations" | "doctors";

interface HeaderProps {
  token: string | null;
  onLogin: () => void;
  onLogout: () => void;
  onNavigate: (page: PageKey) => void;
}

export default function Header({
  token,
  onLogin,
  onLogout,
  onNavigate,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-8 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Aura<span className="text-cyan-400">Health AI</span>
            </h1>

            <p className="text-xs tracking-widest text-cyan-400 uppercase">
              Multi-Agent Healthcare Platform
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-3 py-2">

          <button
            onClick={() => onNavigate("none")}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition"
          >
            <Home size={16} />
            Home
          </button>

          <button
            onClick={() => onNavigate("doctors")}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition"
          >
            <Stethoscope size={16} />
            Doctors
          </button>

          <button
            onClick={() => onNavigate("appointments")}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition"
          >
            <Calendar size={16} />
            Appointments
          </button>

          <button
            onClick={() => onNavigate("conversations")}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition"
          >
            <MessageCircle size={16} />
            Conversations
          </button>

          <div className="w-px h-6 bg-white/10 mx-1"></div>

          {!token ? (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
            >
              <LogIn size={16} />
              Login
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300"
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}