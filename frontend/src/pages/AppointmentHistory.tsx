import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import UndoToast from '../components/UndoToast';
import { I18N, getLang } from '../i18n';

interface Appointment {
  id: number;
  patient_name: string;
  phone: string;
  doctor: {
    id: number;
    name: string;
    department?: string;
    experience?: number;
    consultation_fee?: number;
    available?: boolean;
  };
  appointment_date: string;
  appointment_time: string;
  symptoms?: string;
  status?: string;
}

interface Props { onBack?: () => void; newAppointment?: Appointment | null }

const AppointmentHistory: React.FC<Props> = ({ onBack, newAppointment = null }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [undoInfo, setUndoInfo] = useState<any | null>(null);
  const [lang, setLang] = useState(() => getLang());
  useEffect(() => {
    const onChange = () => setLang(getLang());
    window.addEventListener('auraLangChange', onChange);
    return () => window.removeEventListener('auraLangChange', onChange);
  }, []);
  const t = (I18N as any)[lang] || I18N.en;

  const API = 'http://127.0.0.1:8000';

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/appointments`);
      setAppointments(res.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Unable to load appointments');
    } finally {
      setLoading(false);
    }
  };
 
  const cancelAppointment = async (id: number) => {
    // optimistic update with undo
    const prev = appointments.find((p) => p.id === id);
    if (!prev) return;
    setAppointments((ps) => ps.map((p) => p.id === id ? { ...p, status: 'cancelled' } : p));
    setUndoInfo({ type: 'cancel', id, prev });
    try {
      await axios.patch(`${API}/appointments/${id}`, { status: 'cancelled' });
      // success — keep cancelled
    } catch (err) {
      console.warn('Cancel request failed, kept optimistic state', err);
    }
  };

  const editAppointment = async (id: number, patch: Partial<Appointment>) => {
    const prev = appointments.find((p) => p.id === id);
    if (!prev) return;
    setAppointments((ps) => ps.map((p) => p.id === id ? { ...p, ...patch } : p));
    setUndoInfo({ type: 'edit', id, prev });
    try {
      await axios.patch(`${API}/appointments/${id}`, patch);
    } catch (err) {
      console.warn('Edit request failed, kept optimistic update', err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchAppointments();
      // optimistic prepend if provided
      if (newAppointment) {
        setAppointments((prev) => {
          const exists = prev.some((p) => p.id === newAppointment.id);
          if (exists) return prev;
          return [newAppointment as any, ...prev];
        });
      }
    };
    load();
  }, []);

  return (
    <section className="py-12 px-6 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white mb-6">{t.appointmentHistoryTitle}</h2>
          <button onClick={onBack} className="text-sm text-cyan-400">← Back to Home</button>
        </div>
        {loading && <div className="text-gray-400">{t.loading}</div>}
        {error && <div className="text-rose-400 mb-4">{error} <button onClick={() => fetchAppointments()} className="ml-2 text-cyan-400">Retry</button></div>}
        {appointments.length === 0 && !loading && !error && (
          <div className="bg-dark-900 border border-white/5 rounded-lg p-6 text-gray-400">{t.noAppointments}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((a) => (
            <motion.div key={a.id} className="bg-dark-900 border border-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">{a.patient_name}</h3>
                <span className="text-xs text-gray-400">{a.status || 'Scheduled'}</span>
              </div>
              <div className="text-sm text-gray-300 mb-2">Doctor: {a.doctor?.name} {a.doctor?.department ? `· ${a.doctor.department}` : ''}</div>
              <div className="text-sm text-gray-300">{a.appointment_date} · {a.appointment_time?.slice(0,5)}</div>
              <div className="text-sm text-gray-400 mt-2">{a.symptoms}</div>
              <div className="mt-3 flex gap-2 justify-end">
                {a.status !== 'cancelled' && (
                  <button onClick={() => cancelAppointment(a.id)} className="px-3 py-2 rounded bg-rose-500 text-white text-sm">Cancel</button>
                )}
                <EditInline a={a} onSave={(patch) => editAppointment(a.id, patch)} />
              </div>
            </motion.div>
          ))}
        </div>
        {undoInfo && (
          <UndoToast
            message={undoInfo.type === 'cancel' ? 'Appointment cancelled' : 'Appointment updated'}
            actionLabel="Undo"
            onAction={() => {
              // revert locally and attempt to PATCH back
              const { id, prev } = undoInfo;
              setAppointments((ps) => ps.map((p) => p.id === id ? prev : p));
              axios.patch(`${API}/appointments/${id}`, prev).catch(() => {});
              setUndoInfo(null);
            }}
            onClose={() => setUndoInfo(null)}
          />
        )}
      </div>
    </section>
  );
};

export default AppointmentHistory;

// Inline edit helper component
const EditInline: React.FC<{ a: Appointment; onSave: (patch: Partial<Appointment>) => void }> = ({ a, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(a.appointment_date);
  const [time, setTime] = useState(a.appointment_time?.slice(0,5) || '');

  return editing ? (
    <div className="flex gap-2 items-center">
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 bg-white/5 rounded" />
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="p-2 bg-white/5 rounded" />
      <button onClick={() => { onSave({ appointment_date: date, appointment_time: time + ':00' }); setEditing(false); }} className="px-3 py-1 rounded bg-cyan-500 text-dark-900 text-sm">Save</button>
      <button onClick={() => setEditing(false)} className="px-3 py-1 rounded bg-white/5 text-sm">Cancel</button>
    </div>
  ) : (
    <button onClick={() => setEditing(true)} className="px-3 py-2 rounded bg-white/5 text-sm">Edit</button>
  );
};
