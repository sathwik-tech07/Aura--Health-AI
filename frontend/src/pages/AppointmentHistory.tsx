import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Stethoscope,
  XCircle,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
  Edit3,
} from 'lucide-react';
import { apiClient } from '../api/config';
import UndoToast from '../components/UndoToast';
import { I18N, getLang } from '../i18n';

interface Appointment {
  id: number;
  patient_name: string;
  phone: string;
  doctor_id: number;
  doctor?: {
    id: number;
    name: string;
    department?: string;
    experience?: number;
    consultation_fee?: number;
    available?: boolean;
  };
  appointment_date: string;
  appointment_time: string;
  symptoms: string;
  status: string;
}

interface Props {
  onBack?: () => void;
  newAppointment?: Appointment | null;
  onBookMore?: () => void;
}

const AppointmentHistory: React.FC<Props> = ({ onBack, newAppointment = null, onBookMore }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [undoInfo, setUndoInfo] = useState<any | null>(null);
  const [lang, setLang] = useState(() => getLang());

  const t = I18N[lang] || I18N.en;

  useEffect(() => {
    const handleLang = () => setLang(getLang());
    window.addEventListener('auraLangChange', handleLang);
    return () => window.removeEventListener('auraLangChange', handleLang);
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      // First attempt patient self-appointment endpoint, fallback to all-appointments for employer
      let res;
      try {
        res = await apiClient.get('/appointments/my');
      } catch (e) {
        res = await apiClient.get('/appointments');
      }
      setAppointments(res.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Unable to load appointment records.');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: number) => {
    const prev = appointments.find((p) => p.id === id);
    if (!prev) return;

    // Optimistic update
    setAppointments((ps) =>
      ps.map((p) => (p.id === id ? { ...p, status: 'cancelled' } : p))
    );
    setUndoInfo({ type: 'cancel', id, prev });

    try {
      await apiClient.patch(`/appointments/${id}`, { status: 'cancelled' });
    } catch (err) {
      console.warn('Backend cancel failed, reverted optimistic state', err);
      // Revert if API fails completely
      setAppointments((ps) => ps.map((p) => (p.id === id ? prev : p)));
    }
  };

  const editAppointment = async (id: number, patch: Partial<Appointment>) => {
    const prev = appointments.find((p) => p.id === id);
    if (!prev) return;

    setAppointments((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setUndoInfo({ type: 'edit', id, prev });

    try {
      await apiClient.patch(`/appointments/${id}`, patch);
    } catch (err) {
      console.warn('Backend reschedule failed', err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchAppointments();
      if (newAppointment) {
        setAppointments((prev) => {
          const exists = prev.some((p) => p.id === newAppointment.id);
          if (exists) return prev;
          return [newAppointment, ...prev];
        });
      }
    };
    load();
  }, []);

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-cyan-400" />
            {t.appointmentHistoryTitle}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            View, reschedule, or cancel your scheduled medical consultations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onBookMore && (
            <button
              onClick={onBookMore}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-dark-950 font-bold text-xs hover:bg-cyan-400 transition"
            >
              + Book New Appointment
            </button>
          )}
          <button
            onClick={fetchAppointments}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="text-center py-16 text-gray-400 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{t.loading}</span>
        </div>
      )}

      {error && (
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 text-rose-300 text-center mb-8">
          <p>{error}</p>
          <button onClick={fetchAppointments} className="mt-2 text-xs text-cyan-400 underline font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && appointments.length === 0 && (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center text-gray-400 space-y-3">
          <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white">{t.noAppointments}</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            You currently have no scheduled clinic appointments.
          </p>
          {onBookMore && (
            <button
              onClick={onBookMore}
              className="mt-4 px-5 py-2.5 rounded-xl bg-cyan-500 text-dark-950 font-bold text-xs"
            >
              Book an Appointment
            </button>
          )}
        </div>
      )}

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((a) => {
          const isCancelled = a.status === 'cancelled';
          const isCompleted = a.status === 'completed';

          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                isCancelled
                  ? 'border-white/5 opacity-70 bg-dark-950/60'
                  : 'border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono uppercase block">
                      ID #{a.id}
                    </span>
                    <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                      <User className="w-4 h-4 text-cyan-400" />
                      {a.patient_name}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isCancelled
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : isCompleted
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {isCancelled ? (
                      <>
                        <XCircle className="w-3 h-3" /> Cancelled
                      </>
                    ) : isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Booked
                      </>
                    )}
                  </span>
                </div>

                {/* Doctor & Schedule */}
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Stethoscope className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>
                      {a.doctor?.name || 'Hospital Specialist'}{' '}
                      <span className="text-xs text-cyan-400 font-normal">
                        ({a.doctor?.department || 'General Medicine'})
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>
                      {a.appointment_date} at {a.appointment_time?.slice(0, 5)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span>{a.phone}</span>
                  </div>

                  {a.symptoms && (
                    <div className="mt-2 bg-white/5 p-3 rounded-xl border border-white/5 text-gray-300 text-xs">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                        Symptoms / Reason:
                      </span>
                      {a.symptoms}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                {!isCancelled ? (
                  <>
                    <button
                      onClick={() => cancelAppointment(a.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                    <EditInline
                      appointment={a}
                      onSave={(patch) => editAppointment(a.id, patch)}
                    />
                  </>
                ) : (
                  <span className="text-xs text-gray-500 italic">Booking cancelled</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Undo Toast */}
      {undoInfo && (
        <UndoToast
          message={
            undoInfo.type === 'cancel'
              ? 'Appointment cancelled'
              : 'Appointment details updated'
          }
          actionLabel="Undo"
          onAction={() => {
            const { id, prev } = undoInfo;
            setAppointments((ps) => ps.map((p) => (p.id === id ? prev : p)));
            apiClient.patch(`/appointments/${id}`, prev).catch(() => {});
            setUndoInfo(null);
          }}
          onClose={() => setUndoInfo(null)}
        />
      )}
    </section>
  );
};

// Inline Edit helper
const EditInline: React.FC<{
  appointment: Appointment;
  onSave: (patch: Partial<Appointment>) => void;
}> = ({ appointment, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(appointment.appointment_date);
  const [time, setTime] = useState(appointment.appointment_time?.slice(0, 5) || '10:00');

  return editing ? (
    <div className="flex flex-wrap gap-1.5 items-center">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="p-1.5 bg-dark-900 border border-white/10 rounded text-xs text-white"
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="p-1.5 bg-dark-900 border border-white/10 rounded text-xs text-white"
      />
      <button
        onClick={() => {
          onSave({ appointment_date: date, appointment_time: `${time}:00` });
          setEditing(false);
        }}
        className="px-2.5 py-1.5 rounded bg-cyan-500 text-dark-950 font-bold text-xs"
      >
        Save
      </button>
      <button
        onClick={() => setEditing(false)}
        className="px-2.5 py-1.5 rounded bg-white/5 text-gray-400 text-xs"
      >
        Close
      </button>
    </div>
  ) : (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold transition"
    >
      <Edit3 className="w-3 h-3" /> Reschedule
    </button>
  );
};

export default AppointmentHistory;
