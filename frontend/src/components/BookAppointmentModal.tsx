import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { I18N, getLang } from '../i18n';
import type { LangKey } from '../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultDoctor?: string;
  onSuccess?: (appointment?: any) => void;
  sessionId?: string;
}

const BookAppointmentModal: React.FC<Props> = ({ isOpen, onClose, defaultDoctor, onSuccess, sessionId }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [doctor, setDoctor] = useState('');
  const [doctorsList, setDoctorsList] = useState<Array<{id:string,name:string,department?:string,availability?:string}>>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdAppointment, setCreatedAppointment] = useState<any | null>(null);
  const [lang, setLang] = useState<LangKey>(() => getLang());
  useEffect(() => {
    const onChange = () => setLang(getLang());
    window.addEventListener('auraLangChange', onChange);
    return () => window.removeEventListener('auraLangChange', onChange);
  }, []);
  const t = I18N[lang] || I18N.en;

  const API_URL = "https://aura-health-ai.onrender.com"; 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    if (!name.trim()) { setErrorMsg('Please enter your name.'); setLoading(false); return; }
    if (!phone.trim()) { setErrorMsg('Please enter your phone.'); setLoading(false); return; }
    if (!date) { setErrorMsg('Please select a date.'); setLoading(false); return; }
    if (!time) { setErrorMsg('Please select a time.'); setLoading(false); return; }
    if (!symptoms.trim()) { setErrorMsg('Please describe symptoms.'); setLoading(false); return; }

    if (!doctor) { setErrorMsg('Please select a doctor.'); setLoading(false); return; }

    try {
      const payload: any = {
        patient_name: name,
        phone,
        doctor_id: Number(doctor),
        appointment_date: date,
        appointment_time: time,
        symptoms,
      };
      if (sessionId) payload.session_id = sessionId;
      const res = await axios.post(`${API}/book-appointment`, payload);
      setCreatedAppointment(res.data || null);
      setSuccessMsg('Appointment booked successfully.');
      // Clear form inputs (keep createdAppointment for display)
      setName(''); setPhone(''); setDoctor(''); setDate(''); setTime(''); setSymptoms('');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Unable to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  // Load doctors when modal opens
  React.useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoadingDoctors(true);
      try {
        const res = await axios.get(`${API}/doctors`);
        const list = (res.data || []).map((d: any) => ({ id: d.id ?? d.name, name: d.name ?? d.id, department: d.department, availability: d.availability }));
        setDoctorsList(list);
        // preselect defaultDoctor if provided (id or name)
        if (defaultDoctor) {
          const byId = list.find((x:any) => x.id === defaultDoctor);
          const byName = list.find((x:any) => x.name === defaultDoctor);
          if (byId) setDoctor(byId.id);
          else if (byName) setDoctor(byName.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    load();
    // Prefill date/time defaults when modal opens
    const now = new Date();
    const isoDate = now.toISOString().slice(0, 10);
    if (!date) setDate(isoDate);
    // round up to next 30min and add 1 hour buffer
    const mins = now.getMinutes();
    const remainder = mins % 30;
    const addMinutes = 60 + (remainder === 0 ? 0 : 30 - remainder);
    const next = new Date(now.getTime() + addMinutes * 60000);
    const hh = String(next.getHours()).padStart(2, '0');
    const mm = String(next.getMinutes()).padStart(2, '0');
    if (!time) setTime(`${hh}:${mm}`);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="relative w-full max-w-2xl bg-dark-900 border border-white/5 rounded-2xl p-6 z-10"
          >
            <h3 className="text-lg font-bold text-white mb-3">{t.bookTitle}</h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder={t.fullName} className="p-3 bg-white/5 border border-white/5 rounded" />
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phone} className="p-3 bg-white/5 border border-white/5 rounded" />

              {loadingDoctors ? (
                <div className="p-3 bg-white/5 border border-white/5 rounded text-gray-400">Loading doctors...</div>
              ) : (
                <select value={doctor} onChange={(e) => setDoctor(e.target.value)} className="p-3 bg-white/5 border border-white/5 rounded">
                  <option value="">{t.selectDoctor}</option>
                  {doctorsList.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} {d.department ? `— ${d.department}` : ''}</option>
                  ))}
                </select>
              )}

                <div className="flex gap-2">
                <input required type="date" min={new Date().toISOString().slice(0,10)} value={date} onChange={(e) => setDate(e.target.value)} className="p-3 bg-white/5 border border-white/5 rounded w-full" />
                <input required type="time" value={time} onChange={(e) => setTime(e.target.value)} className="p-3 bg-white/5 border border-white/5 rounded w-full" />
              </div>

              <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder={t.symptoms} className="p-3 bg-white/5 border border-white/5 rounded md:col-span-2" />

              <div className="md:col-span-2">
                {createdAppointment ? (
                  <div className="bg-emerald-900/10 border border-emerald-400/10 rounded p-4 flex flex-col gap-3">
                    <div className="text-sm text-emerald-300">{successMsg || t.bookedSuccess}</div>
                    <div className="text-sm text-gray-200">Appointment ID: {createdAppointment.id}</div>
                    <div className="text-sm text-gray-300">Patient: {createdAppointment.patient_name}</div>
                    <div className="text-sm text-gray-300">Doctor: {createdAppointment.doctor?.name}</div>
                    <div className="text-sm text-gray-300">{createdAppointment.appointment_date} · {createdAppointment.appointment_time?.slice(0,5)}</div>
                    <div className="flex gap-2 justify-end mt-2">
                      <button type="button" onClick={() => { if (onSuccess) onSuccess(createdAppointment); setCreatedAppointment(null); }} className="px-4 py-2 rounded bg-cyan-500 text-dark-950 font-bold">View Appointments</button>
                      <button type="button" onClick={() => { setCreatedAppointment(null); onClose(); }} className="px-4 py-2 rounded bg-white/5 border border-white/5">Close</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-emerald-400">{successMsg || errorMsg}</div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-white/5 border border-white/5">Cancel</button>
                      <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-cyan-500 text-dark-950 font-bold">{loading ? t.bookingLoading : t.booking}</button>
                    </div>
                  </div>
                )}
              </div>
            </form>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookAppointmentModal;
