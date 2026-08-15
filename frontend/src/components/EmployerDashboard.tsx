import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  DollarSign,
  Stethoscope,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Building2,
  Phone,
  Mail,
  Clock,
  MapPin,
} from 'lucide-react';
import { apiClient } from '../api/config';

interface EmployerDashboardProps {
  onNavigate: (page: 'none' | 'dashboard' | 'employer' | 'appointments' | 'conversations' | 'doctors') => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = () => {
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'patients' | 'doctors' | 'clinic'>('overview');

  const fetchEmployerData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, apptsRes, patientsRes, docsRes] = await Promise.allSettled([
        apiClient.get('/employer/stats'),
        apiClient.get('/appointments'),
        apiClient.get('/employer/patients'),
        apiClient.get('/doctors'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (apptsRes.status === 'fulfilled') setAppointments(apptsRes.value.data || []);
      if (patientsRes.status === 'fulfilled') setPatients(patientsRes.value.data || []);
      if (docsRes.status === 'fulfilled') setDoctors(docsRes.value.data || []);

      if (statsRes.status === 'rejected' && apptsRes.status === 'rejected') {
        setError('Access restricted. Verified Employer credentials required.');
      }
    } catch (err: any) {
      console.error('Employer fetch error:', err);
      setError(err?.message || 'Access denied. Employer privileges required.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerData();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await apiClient.patch(`/appointments/${id}`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      // Refresh stats
      try {
        const statsRes = await apiClient.get('/employer/stats');
        setStats(statsRes.data);
      } catch {}
    } catch (err: any) {
      alert('Failed to update appointment: ' + err.message);
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this clinic appointment?')) return;
    try {
      await apiClient.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      try {
        const statsRes = await apiClient.get('/employer/stats');
        setStats(statsRes.data);
      } catch {}
    } catch (err: any) {
      alert('Failed to delete appointment: ' + err.message);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const q = filterQuery.toLowerCase();
    return (
      a.patient_name?.toLowerCase().includes(q) ||
      a.doctor?.name?.toLowerCase().includes(q) ||
      a.doctor?.department?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q)
    );
  });

  const filteredPatients = patients.filter((p) => {
    const q = filterQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.role?.toLowerCase().includes(q)
    );
  });

  const filteredDoctors = doctors.filter((d) => {
    const q = filterQuery.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-8">
      {/* 1. Employer Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/25 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="absolute -right-12 -top-12 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-indigo-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Employer &amp; Clinic Administration Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Hospital Management &amp; Operational Analytics
          </h1>
          <p className="text-sm text-gray-300 max-w-xl">
            Real-time appointment scheduling, doctor rosters, patient records, and clinic administrative insights.
          </p>
        </div>

        <button
          onClick={fetchEmployerData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 transition text-xs font-bold disabled:opacity-50 z-10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Dashboard
        </button>
      </motion.div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* 2. Key Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -2 }}
            className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-gray-400 font-medium">Total Bookings</span>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.total_appointments}</h3>
              <span className="text-[11px] text-cyan-400 font-medium">{stats.active_appointments} Active Bookings</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-400">
              <Calendar className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-gray-400 font-medium">Registered Patients</span>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.total_patients}</h3>
              <span className="text-[11px] text-emerald-400 font-medium">Verified Profiles</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-gray-400 font-medium">Verified Specialists</span>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.total_doctors}</h3>
              <span className="text-[11px] text-purple-400 font-medium">Across 10 Departments</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400">
              <Stethoscope className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-gray-400 font-medium">Est. Clinic Revenue</span>
              <h3 className="text-2xl font-bold text-white mt-1">₹{stats.estimated_revenue?.toLocaleString()}</h3>
              <span className="text-[11px] text-yellow-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Consultation Fees
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-yellow-500/10 text-yellow-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </motion.div>
        </div>
      )}

      {/* 3. Navigation Tabs & Search Controls */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'appointments'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              All Appointments ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'patients'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Patients ({patients.length})
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'doctors'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Doctors ({doctors.length})
            </button>
            <button
              onClick={() => setActiveTab('clinic')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'clinic'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Clinic Info
            </button>
          </div>

          {activeTab !== 'clinic' && activeTab !== 'overview' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter records..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Overview Summary */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Recent Appointment Activity
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {appointments.slice(0, 5).map((a) => (
                  <div key={a.id} className="p-3 bg-white/5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{a.patient_name}</span>
                      <p className="text-[11px] text-gray-400">{a.doctor?.name} ({a.doctor?.department})</p>
                    </div>
                    <span className="font-mono text-cyan-400">{a.appointment_date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                Quick Clinic Summary
              </h3>
              <div className="space-y-2.5 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Operating Hours:</span>
                  <span className="font-semibold text-white">Mon - Sat: 9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Emergency Care:</span>
                  <span className="font-semibold text-rose-400">24/7 AI Triage &amp; Hotline</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Specialist Coverage:</span>
                  <span className="font-semibold text-white">Cardiology, Ortho, Neuro, Pediatrics +6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Insurance Accepted:</span>
                  <span className="font-semibold text-emerald-400">All Major Health Plans</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: All Appointments */}
        {activeTab === 'appointments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 border-b border-white/10 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Doctor &amp; Department</th>
                  <th className="py-3 px-3">Date &amp; Time</th>
                  <th className="py-3 px-3">Symptoms</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 px-3 font-mono text-cyan-400">#{appt.id}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-white">{appt.patient_name}</div>
                        <div className="text-[11px] text-gray-400">{appt.phone}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-indigo-300">{appt.doctor?.name || 'General Doctor'}</div>
                        <div className="text-[10px] text-gray-400">{appt.doctor?.department || 'OPD'}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div>{appt.appointment_date}</div>
                        <div className="text-gray-400 text-[11px]">{appt.appointment_time?.slice(0, 5)}</div>
                      </td>
                      <td className="py-3.5 px-3 max-w-xs truncate text-gray-300">
                        {appt.symptoms}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            appt.status === 'confirmed'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : appt.status === 'cancelled'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {appt.status !== 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(appt.id, 'confirmed')}
                              title="Confirm"
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {appt.status !== 'cancelled' && (
                            <button
                              onClick={() => handleStatusChange(appt.id, 'cancelled')}
                              title="Cancel"
                              className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAppointment(appt.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No matching appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Patient Directory */}
        {activeTab === 'patients' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 border-b border-white/10 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">User ID</th>
                  <th className="py-3 px-3">Full Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 px-3 font-mono text-indigo-400">#{p.id}</td>
                      <td className="py-3.5 px-3 font-semibold text-white">{p.name}</td>
                      <td className="py-3.5 px-3 text-gray-300 font-mono">{p.email}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.role === 'employer' || p.role === 'admin'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {p.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No matching patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Doctor Roster */}
        {activeTab === 'doctors' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredDoctors.map((doc) => (
              <div key={doc.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{doc.name}</h4>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    Available
                  </span>
                </div>
                <p className="text-xs text-indigo-300 font-medium">{doc.department}</p>
                <div className="text-xs text-gray-400 flex justify-between pt-1">
                  <span>Experience: {doc.experience} Yrs</span>
                  <span className="text-emerald-400 font-semibold">₹{doc.consultation_fee}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Clinic Info Management */}
        {activeTab === 'clinic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-300">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                Clinic Facilities &amp; Hours
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="font-semibold text-white block">Operating Hours</span>
                    <span>Monday – Saturday, 9:00 AM – 6:00 PM</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="font-semibold text-white block">Main Campus</span>
                    <span>Plot 42, Healthtech Corridor, Cyber City, Hyderabad, 500081</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400" />
                Communication Channels
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="font-semibold text-white block">Clinical Support Line</span>
                    <span>+91-9876543210</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="font-semibold text-white block">Support Email</span>
                    <span>support@aurahealthai.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
