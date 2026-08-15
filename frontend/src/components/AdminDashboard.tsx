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
} from 'lucide-react';
import { apiClient } from '../api/config';

interface AdminDashboardProps {
  onNavigate: (page: 'none' | 'dashboard' | 'appointments' | 'conversations' | 'doctors') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'appointments' | 'patients'>('appointments');

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, apptsRes, patientsRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/appointments'),
        apiClient.get('/admin/patients'),
      ]);

      setStats(statsRes.data);
      setAppointments(apptsRes.data || []);
      setPatients(patientsRes.data || []);
    } catch (err: any) {
      console.error('Admin fetch error:', err);
      setError(err?.message || 'Access denied. Administrator privileges required.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await apiClient.patch(`/appointments/${id}`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      // Refresh stats
      const statsRes = await apiClient.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err: any) {
      alert('Failed to update appointment: ' + err.message);
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this appointment?')) return;
    try {
      await apiClient.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      const statsRes = await apiClient.get('/admin/stats');
      setStats(statsRes.data);
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

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-8">
      {/* 1. Admin Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="absolute -right-12 -top-12 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-purple-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            Clinic Executive Administration Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Hospital Operations &amp; Clinical Management
          </h1>
          <p className="text-sm text-gray-300 max-w-xl">
            Real-time multi-agent triage monitoring, doctor schedules, patient records, and operational analytics.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition text-xs font-bold disabled:opacity-50 z-10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
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
              <span className="text-[11px] text-cyan-400 font-medium">{stats.active_appointments} Active</span>
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

      {/* 3. Management Tabs & Filter */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'appointments'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              All Clinic Appointments ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'patients'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Patient Directory ({patients.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* Tab 1: All Appointments */}
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
                        <div className="font-medium text-purple-300">{appt.doctor?.name || 'General Doctor'}</div>
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

        {/* Tab 2: Patient Directory */}
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
                      <td className="py-3.5 px-3 font-mono text-purple-400">#{p.id}</td>
                      <td className="py-3.5 px-3 font-semibold text-white">{p.name}</td>
                      <td className="py-3.5 px-3 text-gray-300 font-mono">{p.email}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
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
      </div>
    </div>
  );
};
