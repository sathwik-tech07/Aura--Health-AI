import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Phone, Stethoscope, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/config';
import { I18N, getLang } from '../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultDoctor?: string;
  onSuccess?: (appointment?: any) => void;
  sessionId?: string;
}

const BookAppointmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultDoctor,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [doctor, setDoctor] = useState('');
  const [doctorsList, setDoctorsList] = useState<
    Array<{ id: number; name: string; department?: string; available?: boolean; consultation_fee?: number }>
  >([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdAppointment, setCreatedAppointment] = useState<any | null>(null);
  const [lang, setLang] = useState(() => getLang());

  useEffect(() => {
    const handleLang = () => setLang(getLang());
    window.addEventListener('auraLangChange', handleLang);
    return () => window.removeEventListener('auraLangChange', handleLang);
  }, []);

  const t = I18N[lang] || I18N.en;

  // Load doctors list when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const loadDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await apiClient.get('/doctors');
        const list = res.data || [];
        setDoctorsList(list);

        if (defaultDoctor) {
          const match = list.find(
            (d: any) => String(d.id) === String(defaultDoctor) || d.name === defaultDoctor
          );
          if (match) setDoctor(String(match.id));
        } else if (list.length > 0 && !doctor) {
          setDoctor(String(list[0].id));
        }
      } catch (err) {
        console.error('Failed to load doctors in modal:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();

    // Default to tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().slice(0, 10));
    setTime('10:00');
  }, [isOpen, defaultDoctor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg(t.enterName);
      return;
    }
    if (!phone.trim()) {
      setErrorMsg(t.enterPhone);
      return;
    }
    if (!doctor) {
      setErrorMsg('Please select a doctor.');
      return;
    }
    if (!date) {
      setErrorMsg(t.enterDate);
      return;
    }
    if (!time) {
      setErrorMsg(t.enterTime);
      return;
    }
    if (!symptoms.trim()) {
      setErrorMsg(t.enterSymptoms);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        patient_name: name.trim(),
        phone: phone.trim(),
        doctor_id: Number(doctor),
        appointment_date: date,
        appointment_time: time.length === 5 ? `${time}:00` : time,
        symptoms: symptoms.trim(),
      };

      const res = await apiClient.post('/book-appointment', payload);
      setCreatedAppointment(res.data || null);

      // Clear inputs
      setName('');
      setPhone('');
      setSymptoms('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to book appointment.');
    } finally {
      setLoading(false);
    }
  };

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
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-xl bg-dark-900 border border-cyan-500/25 rounded-3xl p-6 sm:p-8 z-10 shadow-[0_0_50px_rgba(6,182,212,0.2)] max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{t.bookTitle}</h3>
                  <p className="text-xs text-cyan-400">AuraHealth Certified Clinical Specialist</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success View */}
            {createdAppointment ? (
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">{t.bookedSuccess}</h4>
                <div className="bg-dark-950 p-4 rounded-xl text-xs text-left space-y-2 text-gray-300 border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Appointment ID:</span>
                    <span className="font-mono text-cyan-400">#{createdAppointment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Patient:</span>
                    <span className="font-semibold text-white">{createdAppointment.patient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Doctor:</span>
                    <span className="text-white">{createdAppointment.doctor?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date & Time:</span>
                    <span className="text-cyan-400">
                      {createdAppointment.appointment_date} at {createdAppointment.appointment_time?.slice(0, 5)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={() => {
                      if (onSuccess) onSuccess(createdAppointment);
                      setCreatedAppointment(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold text-xs transition"
                  >
                    View in Appointments
                  </button>
                  <button
                    onClick={() => {
                      setCreatedAppointment(null);
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs hover:bg-white/10 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">{t.fullName} *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">{t.phone} *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">{t.selectDoctor} *</label>
                  <div className="relative">
                    <Stethoscope className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      required
                      value={doctor}
                      onChange={(e) => setDoctor(e.target.value)}
                      disabled={loadingDoctors}
                      className="w-full pl-10 pr-4 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                    >
                      {loadingDoctors ? (
                        <option>Loading specialists...</option>
                      ) : (
                        doctorsList.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} — {d.department} (₹{d.consultation_fee})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">{t.date} *</label>
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">{t.time} *</label>
                    <select
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                      <option value="18:00">06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">{t.symptoms} *</label>
                  <textarea
                    required
                    rows={3}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe symptoms, duration, or reason for appointment..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs hover:bg-white/10 transition"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    {loading ? t.bookingLoading : t.booking}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookAppointmentModal;
