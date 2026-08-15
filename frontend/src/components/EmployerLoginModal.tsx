import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/config';

interface EmployerLoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: any) => void;
}

export const EmployerLoginModal: React.FC<EmployerLoginModalProps> = ({
  open,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiClient.post('/login', {
        email: email.trim(),
        password: password.trim(),
      });

      const data = res.data;
      const user = data.user;

      // Verify that this user is actually an employer/admin
      if (user.role !== 'employer' && user.role !== 'admin' && user.role !== 'staff') {
        setError(
          'Access Denied: This account is registered as a Patient. Please use the Patient Portal login.'
        );
        setLoading(false);
        return;
      }

      localStorage.setItem('aura_token', data.token);
      localStorage.setItem('aura_user', JSON.stringify(user));
      onLoginSuccess(data.token, user);
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Invalid employer email or password.';
      setError(msg);
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
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md glass-panel p-8 rounded-3xl border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)] z-10 space-y-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="space-y-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-widest">
              Administrative Access
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Employer &amp; Clinic Portal
            </h2>
            <p className="text-xs text-gray-300">
              Secure access for clinic administrators, healthcare staff, and hospital operators.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employer@aurahealthai.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:scale-[1.02] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating Staff...</span>
              ) : (
                <>
                  <span>Sign In to Employer Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note - NO public registration */}
          <div className="pt-2 text-center text-[11px] text-gray-400 border-t border-white/5">
            <span>Hospital administration accounts are provisioned securely by clinic IT.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EmployerLoginModal;
