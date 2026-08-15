import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Stethoscope,
  Award,
  CreditCard,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { apiClient } from '../api/config';
import { I18N, getLang } from '../i18n';

interface Doctor {
  id: number;
  name: string;
  department: string;
  experience: number;
  consultation_fee: number;
  available: boolean;
}

interface Props {
  onBack?: () => void;
  onBook?: (doctorId: string, doctorName?: string) => void;
}

const DoctorDirectory: React.FC<Props> = ({ onBack, onBook }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [lang, setLang] = useState(() => getLang());

  const t = I18N[lang] || I18N.en;

  useEffect(() => {
    const handleLang = () => setLang(getLang());
    window.addEventListener('auraLangChange', handleLang);
    return () => window.removeEventListener('auraLangChange', handleLang);
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/doctors');
      setDoctors(res.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Unable to load doctor directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const departments = ['All', ...Array.from(new Set(doctors.map((d) => d.department)))];

  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'All' || d.department === selectedDepartment;
    const matchesAvail = !onlyAvailable || d.available;
    return matchesSearch && matchesDept && matchesAvail;
  });

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Stethoscope className="w-7 h-7 text-cyan-400" />
            Verified Medical Specialists
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Consult with certified department heads and specialist clinicians at AuraHealth.
          </p>
        </div>

        <button
          onClick={fetchDoctors}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 mb-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchDoctorPlaceholder}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition"
          />
        </div>

        {/* Department Dropdown */}
        <div className="md:col-span-4 relative">
          <Filter className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? t.allDepartments : dept}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Toggle */}
        <div className="md:col-span-2 flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded bg-white/5 border-white/10 text-cyan-500 focus:ring-0 focus:ring-offset-0"
            />
            <span>Available Only</span>
          </label>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="text-center py-16 text-gray-400 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{t.loading}</span>
        </div>
      )}

      {error && (
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 text-rose-300 text-center mb-8">
          <p>{error}</p>
          <button onClick={fetchDoctors} className="mt-2 text-xs text-cyan-400 underline font-semibold">
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredDoctors.length === 0 && (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center text-gray-400">
          <Stethoscope className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No doctors match your filter.</h3>
          <p className="text-xs text-gray-400">Try clearing your search query or selecting another department.</p>
        </div>
      )}

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((d) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-lg"
          >
            <div>
              {/* Doctor Avatar and Badge */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold text-base shadow-inner">
                    {d.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{d.name}</h3>
                    <span className="text-xs text-cyan-400 font-medium">{d.department}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                    d.available
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {d.available ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Available
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" /> Unavailable
                    </>
                  )}
                </span>
              </div>

              {/* Stats & Meta */}
              <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-white/5 rounded-2xl border border-white/5 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-[10px] text-gray-400 block">Experience</span>
                    <span className="font-semibold text-white">{d.experience} Years</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-gray-400 block">Consultation Fee</span>
                    <span className="font-semibold text-emerald-400">₹{d.consultation_fee}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                onClick={() => onBook && onBook(String(d.id), d.name)}
                disabled={!d.available}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                  d.available
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-dark-950 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {d.available ? 'Book Appointment' : 'Unavailable for Booking'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default DoctorDirectory;
