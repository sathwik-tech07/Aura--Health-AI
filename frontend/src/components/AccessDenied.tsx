import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Home, LayoutDashboard, Building2 } from 'lucide-react';

interface AccessDeniedProps {
  role?: string;
  attemptedPage?: 'employer' | 'patient';
  onGoHome: () => void;
  onGoPatientDashboard: () => void;
  onGoEmployerDashboard?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  role = 'patient',
  attemptedPage = 'employer',
  onGoHome,
  onGoPatientDashboard,
  onGoEmployerDashboard,
}) => {
  const isEmployerAttemptingPatient = attemptedPage === 'patient' || role === 'employer';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full glass-panel p-8 rounded-3xl border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.15)] text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 font-mono">
            HTTP 403 Forbidden
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {isEmployerAttemptingPatient
              ? 'Patient Portal Restricted'
              : 'Employer Access Restricted'}
          </h2>
          <p className="text-xs text-gray-300 leading-relaxed">
            {isEmployerAttemptingPatient
              ? 'Your account has verified Employer & Clinic Staff privileges. Patient self-care features are accessed via Patient accounts.'
              : 'Your account is registered as a Patient. Administrative and clinic operations require verified Employer credentials.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          {isEmployerAttemptingPatient && onGoEmployerDashboard ? (
            <button
              onClick={onGoEmployerDashboard}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
            >
              <Building2 className="w-4 h-4" />
              Employer Portal
            </button>
          ) : (
            <button
              onClick={onGoPatientDashboard}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold text-xs shadow-md transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              Patient Dashboard
            </button>
          )}

          <button
            onClick={onGoHome}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-medium text-xs transition"
          >
            <Home className="w-4 h-4" />
            Return Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessDenied;
