import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, LogIn, UserPlus, AlertCircle, ShieldCheck, HeartPulse } from 'lucide-react';
import { apiClient } from '../api/config';

interface Props {
  open: boolean;
  onClose: () => void;
  onLogin?: (token: string, user?: any) => void;
}

export const LoginModal: React.FC<Props> = ({ open, onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessInfo('');

    try {
      if (isRegister) {
        if (!name.trim()) {
          setError('Please provide your full name.');
          setLoading(false);
          return;
        }

        await apiClient.post('/register', {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });

        setSuccessInfo('Patient account created successfully! You can now sign in below.');
        setIsRegister(false);
        setPassword('');
      } else {
        const res = await apiClient.post('/login', {
          email: email.trim().toLowerCase(),
          password,
        });

        const token = res.data?.token;
        const user = res.data?.user;

        if (token) {
          localStorage.setItem('aura_token', token);
          if (user) {
            localStorage.setItem('aura_user', JSON.stringify(user));
          }
          if (onLogin) {
            onLogin(token, user);
          }
          onClose();
        } else {
          setError('Authentication token missing from response.');
        }
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'Authentication failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          className="relative z-10 w-full max-w-md rounded-3xl bg-dark-900 border border-cyan-500/25 p-7 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Patient Portal
                </span>
                <h2 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
                  {isRegister ? 'Create Patient Account' : 'Sign in to Patient Portal'}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-300">
            Your personal AI-powered healthcare assistant for symptom assessment, voice triage, and doctor scheduling.
          </p>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success message */}
          {successInfo && (
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Sathwik Reddy"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="patient@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-dark-950 font-extrabold text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] transition disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Processing...'
              ) : isRegister ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Patient Account</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Login to Patient Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="pt-4 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccessInfo('');
              }}
              className="text-xs text-cyan-400 hover:underline font-medium"
            >
              {isRegister
                ? 'Already have an account? Sign in here'
                : "New patient? Create your account"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;