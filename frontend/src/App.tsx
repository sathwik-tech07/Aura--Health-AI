import { useState, useEffect } from 'react';
import { ParticlesBackground } from './components/ParticlesBackground';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { VoiceDemo } from './components/VoiceDemo';
import { Stats } from './components/Stats';
import { Testimonials } from './components/Testimonials';
import { CTA } from './components/CTA';
import { ChatWidget } from './components/ChatWidget';
import { VoiceWidget } from './components/VoiceWidget';
import BookAppointmentModal from './components/BookAppointmentModal';
import axios from 'axios';
import AppointmentHistory from './pages/AppointmentHistory';
import ConversationHistory from './pages/ConversationHistory';
import DoctorDirectory from './pages/DoctorDirectory';
import SessionBadge from './components/SessionBadge';
import LanguageSelector from './components/LanguageSelector';
import LoginModal from './components/LoginModal';

type PageKey = 'none' | 'appointments' | 'conversations' | 'doctors';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);

  const [page, setPage] = useState<PageKey>('none');
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [recentAppointment, setRecentAppointment] = useState<any | null>(null);

  // Logged-in user token
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('aura_token');
  });

  // Login modal opens automatically if not logged in
  const [loginOpen, setLoginOpen] = useState(!token);

  const [sessionId] = useState<string | null>(() => {
    try {
      const existing = localStorage.getItem('aura_session_id');

      if (existing) return existing; 

      const id =
        (crypto as any)?.randomUUID?.() ??
        `s-${Math.random().toString(36).slice(2, 10)}`;

      localStorage.setItem('aura_session_id', id);

      return id;
    } catch {
      return `s-${Math.random().toString(36).slice(2, 10)}`;
    }
  });

  useEffect(() => {
    if (page !== 'none') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [page]);

  const isLanding = page === 'none';

  const handleLogout = () => {
    localStorage.removeItem('aura_token');

    setToken(null);

    setLoginOpen(true);

    try {
      delete axios.defaults.headers.common['Authorization'];
    } catch {}
  };

  const btnClass = (key: PageKey | 'book') => {
    const active =
      (key === 'book' && isBookOpen) ||
      (key !== 'book' && page === key);

    return active
      ? 'bg-cyan-500 text-dark-950 px-3 py-2 rounded-lg'
      : 'bg-white/5 text-gray-200 px-3 py-2 rounded-lg';
  };

  return (
    <div className="relative min-h-screen bg-dark-950 text-gray-100 overflow-x-hidden">
      <ParticlesBackground />

      {isLanding && (
        <>
          <Hero
            onStartChat={() => setIsChatOpen(true)}
            onStartVoice={() => setIsVoiceOpen(true)}
          />

          <Features />

          <VoiceDemo />

          <Stats />

          <Testimonials />

          <CTA onStartChat={() => setIsChatOpen(true)} />
        </>
      )}
            {/* Conditional Pages */}
      {page === 'appointments' && (
        <AppointmentHistory
          onBack={() => {
            setPage('none');
            setRecentAppointment(null);
          }}
          newAppointment={recentAppointment}
        />
      )}

      {page === 'conversations' && (
        <ConversationHistory
          onBack={() => setPage('none')}
          sessionId={sessionId || undefined}
        />
      )}

      {page === 'doctors' && (
        <DoctorDirectory
          onBack={() => setPage('none')}
          onBook={(doctorId: string) => {
            setSelectedDoctor(doctorId || null);
            setIsBookOpen(true);
          }}
        />
      )}

      {/* Floating Quick Actions */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-3">
        <button
          onClick={() => {
            setSelectedDoctor(null);
            setIsBookOpen(true);
          }}
          className={btnClass('book')}
        >
          Book
        </button>

        <button
          onClick={() =>
            setPage(page === 'appointments' ? 'none' : 'appointments')
          }
          className={btnClass('appointments')}
        >
          Appointments
        </button>

        <button
          onClick={() =>
            setPage(page === 'conversations' ? 'none' : 'conversations')
          }
          className={btnClass('conversations')}
        >
          Conversations
        </button>

        <button
          onClick={() =>
            setPage(page === 'doctors' ? 'none' : 'doctors')
          }
          className={btnClass('doctors')}
        >
          Doctors
        </button>
      </div>

      {/* Logout Button (shown only after login) */}
      {token && (
        <div className="fixed right-6 top-6 z-50">
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
          >
            Logout
          </button>
        </div>
      )}

      {/* Book Appointment */}
      <BookAppointmentModal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        defaultDoctor={selectedDoctor || undefined}
        sessionId={sessionId || undefined}
        onSuccess={(appt) => {
          setIsBookOpen(false);
          setRecentAppointment(appt || null);
          setPage('appointments');
        }}
      />

      {/* Chat Widget */}
      <ChatWidget
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        sessionId={sessionId || undefined}
      />

      {/* Voice Widget */}
      <VoiceWidget
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        sessionId={sessionId || undefined}
      />
            {/* Session Badge */}
      <SessionBadge sessionId={sessionId} />

      {/* Language Selector */}
      <LanguageSelector />

      {/* Login Modal */}
      <LoginModal
       
  open={loginOpen}
  onClose={() => setLoginOpen(false)}
  onLogin={(t) => {
    localStorage.setItem("aura_token", t);
    setToken(t);
    setLoginOpen(false);
  }}
/>
      
    </div>
  );
}

export default App; 