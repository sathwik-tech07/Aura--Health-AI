import { useState, useEffect } from 'react';
import { ParticlesBackground } from './components/ParticlesBackground';
import { Header, type PageKey } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { VoiceDemo } from './components/VoiceDemo';
import { Stats } from './components/Stats';
import { Testimonials } from './components/Testimonials';
import { CTA } from './components/CTA';
import { ChatWidget } from './components/ChatWidget';
import { VoiceWidget } from './components/VoiceWidget';
import { PatientDashboard } from './components/PatientDashboard';
import BookAppointmentModal from './components/BookAppointmentModal';
import AppointmentHistory from './pages/AppointmentHistory';
import ConversationHistory from './pages/ConversationHistory';
import DoctorDirectory from './pages/DoctorDirectory';
import SessionBadge from './components/SessionBadge';
import LanguageSelector from './components/LanguageSelector';
import LoginModal from './components/LoginModal';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);

  const [page, setPage] = useState<PageKey>('none');
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [recentAppointment, setRecentAppointment] = useState<any | null>(null);

  // User authentication token state
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('aura_token');
  });

  const [loginOpen, setLoginOpen] = useState(false);

  // Persistent session ID
  const [sessionId] = useState<string>(() => {
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

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [page]);

  const handleLogout = () => {
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    setToken(null);
    setPage('none');
  };

  const isLanding = page === 'none';

  return (
    <div className="relative min-h-screen bg-dark-950 text-gray-100 overflow-x-hidden">
      <ParticlesBackground />

      {/* Top Header Navigation */}
      <Header
        currentPage={page}
        token={token}
        onLogin={() => setLoginOpen(true)}
        onLogout={handleLogout}
        onNavigate={(p) => setPage(p)}
        onStartChat={() => setIsChatOpen(true)}
        onStartVoice={() => setIsVoiceOpen(true)}
      />

      {/* Landing Page View */}
      {isLanding && (
        <main>
          <Hero
            onStartChat={() => setIsChatOpen(true)}
            onStartVoice={() => setIsVoiceOpen(true)}
          />

          <Features />

          <VoiceDemo />

          <Stats />

          <Testimonials />

          <CTA onStartChat={() => setIsChatOpen(true)} />
        </main>
      )}

      {/* Patient Dashboard View */}
      {page === 'dashboard' && (
        <main>
          <PatientDashboard
            onStartChat={() => setIsChatOpen(true)}
            onStartVoice={() => setIsVoiceOpen(true)}
            onOpenBookModal={(doctorId) => {
              setSelectedDoctor(doctorId || null);
              setIsBookOpen(true);
            }}
            onNavigate={(p) => setPage(p)}
            sessionId={sessionId}
          />
        </main>
      )}

      {/* Appointment History Page */}
      {page === 'appointments' && (
        <main>
          <AppointmentHistory
            onBack={() => {
              setPage('none');
              setRecentAppointment(null);
            }}
            newAppointment={recentAppointment}
            onBookMore={() => {
              setSelectedDoctor(null);
              setIsBookOpen(true);
            }}
          />
        </main>
      )}

      {/* Conversation History Page */}
      {page === 'conversations' && (
        <main>
          <ConversationHistory
            onBack={() => setPage('none')}
            sessionId={sessionId}
            onStartNewChat={() => setIsChatOpen(true)}
          />
        </main>
      )}

      {/* Doctor Directory Page */}
      {page === 'doctors' && (
        <main>
          <DoctorDirectory
            onBack={() => setPage('none')}
            onBook={(doctorId: string) => {
              setSelectedDoctor(doctorId || null);
              setIsBookOpen(true);
            }}
          />
        </main>
      )}

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        defaultDoctor={selectedDoctor || undefined}
        sessionId={sessionId}
        onSuccess={(appt) => {
          setIsBookOpen(false);
          setRecentAppointment(appt || null);
          setPage('appointments');
        }}
      />

      {/* Chat Widget Modal */}
      <ChatWidget
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        sessionId={sessionId}
        onOpenBookModal={(doc) => {
          setIsChatOpen(false);
          setSelectedDoctor(doc || null);
          setIsBookOpen(true);
        }}
      />

      {/* Voice AI Widget Modal */}
      <VoiceWidget
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        sessionId={sessionId}
      />

      {/* Floating Session Badge */}
      <SessionBadge sessionId={sessionId} />

      {/* Floating Language Selector */}
      <LanguageSelector variant="floating" />

      {/* Login & Register Modal */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={(t) => {
          setToken(t);
          setLoginOpen(false);
        }}
      />
    </div>
  );
}

export default App;