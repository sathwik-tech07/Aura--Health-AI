import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  MessageSquare,
  Stethoscope,
  Mic,
  ShieldAlert,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '../api/config';

interface PatientDashboardProps {
  onStartChat: () => void;
  onStartVoice: () => void;
  onOpenBookModal: (doctorId?: string) => void;
  onNavigate: (page: 'none' | 'dashboard' | 'appointments' | 'conversations' | 'doctors') => void;
  sessionId?: string;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onStartChat,
  onStartVoice,
  onOpenBookModal,
  onNavigate,
  sessionId,
}) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [recentConversations, setRecentConversations] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [apptsRes, docsRes] = await Promise.allSettled([
          apiClient.get('/appointments'),
          apiClient.get('/doctors'),
        ]);

        if (apptsRes.status === 'fulfilled') {
          setAppointments(apptsRes.value.data || []);
        }
        if (docsRes.status === 'fulfilled') {
          setDoctors(docsRes.value.data || []);
        }

        if (sessionId) {
          try {
            const convRes = await apiClient.get(`/history/${encodeURIComponent(sessionId)}`);
            setRecentConversations(convRes.data || []);
          } catch {}
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      }
    };

    loadDashboardData();
  }, [sessionId]);

  const upcomingAppointment = appointments.find((a) => a.status !== 'cancelled') || null;

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-8">
      {/* 1. Welcome Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/20 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="absolute -right-12 -top-12 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-400 font-bold">
            <Sparkles className="w-4 h-4" />
            AuraHealth Patient Portal V2
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome to Your Intelligent Health Dashboard
          </h1>
          <p className="text-sm text-gray-300 max-w-xl">
            24/7 AI Triage, Voice Assistant, instant doctor appointments, and personalized clinical history in one secure environment.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 z-10">
          <button
            onClick={onStartChat}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg hover:scale-105 transition"
          >
            <Stethoscope className="w-4 h-4" />
            Start AI Check
          </button>
          <button
            onClick={onStartVoice}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 transition"
          >
            <Mic className="w-4 h-4" />
            Voice AI Call
          </button>
        </div>
      </motion.div>

      {/* 2. Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -3 }}
          onClick={onStartChat}
          className="glass-card p-5 rounded-2xl cursor-pointer border border-white/10 hover:border-cyan-500/40 transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Live 24/7
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Symptom Checker</h3>
            <p className="text-xs text-gray-400 mt-1">Multi-agent clinical triage with instant risk assessment.</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          onClick={onStartVoice}
          className="glass-card p-5 rounded-2xl cursor-pointer border border-white/10 hover:border-blue-500/40 transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Mic className="w-6 h-6" />
            </div>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded-full">
              Voice V2
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Voice Consultation</h3>
            <p className="text-xs text-gray-400 mt-1">Natural conversational voice triage powered by ElevenLabs & Gemini.</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => onOpenBookModal()}
          className="glass-card p-5 rounded-2xl cursor-pointer border border-white/10 hover:border-teal-500/40 transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded-full">
              10 Specialists
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Book Appointment</h3>
            <p className="text-xs text-gray-400 mt-1">Select from verified hospital specialists & reserve your slot.</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('doctors')}
          className="glass-card p-5 rounded-2xl cursor-pointer border border-white/10 hover:border-purple-500/40 transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <User className="w-6 h-6" />
            </div>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded-full">
              Directory
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Doctor Directory</h3>
            <p className="text-xs text-gray-400 mt-1">Search physicians by department, experience, and fee.</p>
          </div>
        </motion.div>
      </div>

      {/* 3. Upcoming Appointment & Recent Conversations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Appointment Card */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 font-bold text-white text-base">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Upcoming Appointment
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="py-6">
            {upcomingAppointment ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirmed Booking
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    ID #{upcomingAppointment.id}
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white">
                    {upcomingAppointment.doctor?.name || 'Assigned Specialist'}
                  </h4>
                  <p className="text-xs text-cyan-300">
                    {upcomingAppointment.doctor?.department || 'Clinical Department'}
                  </p>
                </div>

                <div className="bg-white/5 p-3.5 rounded-2xl space-y-1.5 text-xs text-gray-300 border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Patient:</span>
                    <span className="font-semibold text-white">{upcomingAppointment.patient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date & Time:</span>
                    <span className="font-semibold text-cyan-400">
                      {upcomingAppointment.appointment_date} at {upcomingAppointment.appointment_time?.slice(0, 5)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reason:</span>
                    <span className="truncate max-w-[200px] text-gray-200">{upcomingAppointment.symptoms}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-gray-400">No upcoming appointments scheduled.</p>
                <button
                  onClick={() => onOpenBookModal()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-dark-950 font-bold text-xs hover:bg-cyan-400 transition"
                >
                  Book Doctor Consultation
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Free cancellation up to 2h before slot
            </span>
          </div>
        </div>

        {/* Right: Recent AI Conversations & Triage Logs */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 font-bold text-white text-base">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Recent AI Triage Interactions
            </div>
            <button
              onClick={() => onNavigate('conversations')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              Full History <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="py-4 space-y-3 flex-grow overflow-y-auto max-h-[220px]">
            {recentConversations.length > 0 ? (
              recentConversations.slice(-3).map((conv, idx) => (
                <div key={idx} className="bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase">
                    <span className="text-cyan-400">Patient Inquiry</span>
                    <span>{conv.timestamp?.slice(0, 16).replace('T', ' ')}</span>
                  </div>
                  <p className="text-xs text-gray-200 font-medium truncate">{conv.user_message}</p>
                  <p className="text-xs text-gray-400 truncate">{conv.ai_response}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 space-y-2">
                <p className="text-sm text-gray-400">No recent AI triage session recorded.</p>
                <button
                  onClick={onStartChat}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Start a new consultation now &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Emergency Safety Alert */}
          <div className="mt-4 p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div className="text-xs text-rose-200">
                <span className="font-bold block">Medical Emergency Hotline</span>
                <span>For chest pain, trauma, or severe distress, call 911 / 112 directly.</span>
              </div>
            </div>
            <a
              href="tel:911"
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call
            </a>
          </div>
        </div>
      </div>

      {/* 4. Featured Hospital Specialists */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Verified Clinic Specialists</h2>
            <p className="text-xs text-gray-400">Top-rated physicians available for booking</p>
          </div>
          <button
            onClick={() => onNavigate('doctors')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
          >
            Explore All 10 Doctors <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {doctors.slice(0, 4).map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ y: -3 }}
              className="glass-card p-4.5 rounded-2xl border border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                    {doc.name?.replace('Dr. ', '')?.slice(0, 2)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{doc.name}</h3>
                    <span className="text-[11px] text-cyan-400">{doc.department}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <span className="text-gray-200 font-medium">{doc.experience} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee:</span>
                    <span className="text-emerald-400 font-medium">₹{doc.consultation_fee}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onOpenBookModal(String(doc.id))}
                className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold text-xs transition"
              >
                Book Appointment
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
