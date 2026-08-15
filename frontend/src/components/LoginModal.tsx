import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, LogIn, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';
import { apiClient } from '../api/config';

interface Props {
  open: boolean;
  onClose: () => void;
  onLogin?: (token: string, user?: any) => void;
}

const LoginModal: React.FC<Props> = ({ open, onClose, onLogin }) => {
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

        setSuccessInfo('Account created successfully! Please sign in with your credentials.');
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
      setError(err?.message || 'Authentication failed. Please check your credentials.');
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
          className="relative z-10 w-full max-w-md rounded-3xl bg-dark-900 border border-cyan-500/25 p-7 shadow-[0_0_50px_rgba(6,182,212,0.2)]"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {isRegister ? 'Create Patient Profile' : 'Sign in to AuraHealth'}
                </h2>
                <p className="text-xs text-gray-400">Secure Medical Portal Access</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successInfo && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successInfo}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Sarah Connor"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="patient@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-2 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccessInfo('');
              }}
              className="text-xs text-cyan-400 hover:underline"
            >
              {isRegister ? 'Already registered? Sign in here' : "Don't have an account? Create one"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;