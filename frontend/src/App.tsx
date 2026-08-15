import { useState, useEffect } from 'react';
import { ParticlesBackground } from './components/ParticlesBackground';
import { Header, type PageKey } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { VoiceDemo } from './components/VoiceDemo';
import { HowItWorks } from './components/HowItWorks';
import { Stats } from './components/Stats';
import { Testimonials } from './components/Testimonials';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { ChatWidget } from './components/ChatWidget';
import { VoiceWidget } from './components/VoiceWidget';
import { PatientDashboard } from './components/PatientDashboard';
import { EmployerDashboard } from './components/EmployerDashboard';
import { AccessDenied } from './components/AccessDenied';
import BookAppointmentModal from './components/BookAppointmentModal';
import AppointmentHistory from './pages/AppointmentHistory';
import ConversationHistory from './pages/ConversationHistory';
import DoctorDirectory from './pages/DoctorDirectory';
import SessionBadge from './components/SessionBadge';
import LanguageSelector from './components/LanguageSelector';
import LoginModal from './components/LoginModal';
import EmployerLoginModal from './components/EmployerLoginModal';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);

  // Authentication token and user role state
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('aura_token');
  });

  const [user, setUser] = useState<any | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('aura_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Default page route based on stored role
  const [page, setPage] = useState<PageKey>(() => {
    if (typeof window === 'undefined') return 'none';
    const storedToken = localStorage.getItem('aura_token');
    const storedUserStr = localStorage.getItem('aura_user');
    if (storedToken && storedUserStr) {
      try {
        const parsed = JSON.parse(storedUserStr);
        if (parsed.role === 'employer' || parsed.role === 'admin' || parsed.role === 'staff') {
          return 'employer';
        }
        return 'dashboard';
      } catch {
        return 'none';
      }
    }
    return 'none';
  });

  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [recentAppointment, setRecentAppointment] = useState<any | null>(null);

  // Separate Patient and Employer login modal states
  const [patientLoginOpen, setPatientLoginOpen] = useState(false);
  const [employerLoginOpen, setEmployerLoginOpen] = useState(false);

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

  // Scroll to top on navigation change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [page]);

  const handleNavigate = (targetPage: PageKey) => {
    // 1. Guard for Patient Dashboard
    if (targetPage === 'dashboard' && !token) {
      setPatientLoginOpen(true);
      return;
    }

    // 2. Guard for Employer Dashboard
    if (targetPage === 'employer' && !token) {
      setEmployerLoginOpen(true);
      return;
    }

    setPage(targetPage);
  };

  const handlePatientLoginSuccess = (newToken: string, newUser?: any) => {
    setToken(newToken);
    if (newUser) {
      setUser(newUser);
      if (newUser.role === 'employer' || newUser.role === 'admin') {
        setPage('employer');
      } else {
        setPage('dashboard');
      }
    } else {
      setPage('dashboard');
    }
  };

  const handleEmployerLoginSuccess = (newToken: string, newUser?: any) => {
    setToken(newToken);
    if (newUser) {
      setUser(newUser);
    }
    setPage('employer');
  };

  const handleLogout = () => {
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    setToken(null);
    setUser(null);
    setPage('none');
  };

  const isAuthenticated = Boolean(token);
  const isEmployerRole = user?.role === 'employer' || user?.role === 'admin' || user?.role === 'staff';
  const isLanding = !isAuthenticated || page === 'none';

  return (
    <div className="relative min-h-screen bg-dark-950 text-gray-100 overflow-x-hidden">
      <ParticlesBackground />

      {/* Top Header Navigation (Role Aware) */}
      <Header
        currentPage={page}
        token={token}
        user={user}
        onPatientLogin={() => setPatientLoginOpen(true)}
        onEmployerLogin={() => setEmployerLoginOpen(true)}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onStartChat={() => {
          if (!isAuthenticated) setPatientLoginOpen(true);
          else setIsChatOpen(true);
        }}
        onStartVoice={() => {
          if (!isAuthenticated) setPatientLoginOpen(true);
          else setIsVoiceOpen(true);
        }}
      />

      {/* 1. PUBLIC MARKETING LANDING PAGE VIEW (Logged Out or Landing) */}
      {isLanding && (
        <main>
          <Hero
            onGetStarted={() => setPatientLoginOpen(true)}
            onExploreFeatures={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <Features />

          <VoiceDemo />

          <HowItWorks />

          <Stats />

          <Testimonials />

          <CTA onGetStarted={() => setPatientLoginOpen(true)} />

          <Footer onLoginClick={() => setPatientLoginOpen(true)} />
        </main>
      )}

      {/* 2. AUTHENTICATED PATIENT PORTAL DASHBOARD */}
      {isAuthenticated && page === 'dashboard' && (
        <main className="min-h-screen">
          {isEmployerRole ? (
            <AccessDenied
              role="employer"
              attemptedPage="patient"
              onGoHome={() => setPage('none')}
              onGoPatientDashboard={() => setPage('dashboard')}
              onGoEmployerDashboard={() => setPage('employer')}
            />
          ) : (
            <PatientDashboard
              onStartChat={() => setIsChatOpen(true)}
              onStartVoice={() => setIsVoiceOpen(true)}
              onOpenBookModal={(doctorId) => {
                setSelectedDoctor(doctorId || null);
                setIsBookOpen(true);
              }}
              onNavigate={(p) => handleNavigate(p)}
              sessionId={sessionId}
            />
          )}
        </main>
      )}

      {/* 3. AUTHENTICATED EMPLOYER & CLINIC ADMINISTRATION PORTAL */}
      {isAuthenticated && page === 'employer' && (
        <main className="min-h-screen">
          {isEmployerRole ? (
            <EmployerDashboard onNavigate={(p) => handleNavigate(p)} />
          ) : (
            <AccessDenied
              role="patient"
              attemptedPage="employer"
              onGoHome={() => setPage('none')}
              onGoPatientDashboard={() => setPage('dashboard')}
            />
          )}
        </main>
      )}

      {/* 4. PATIENT APPOINTMENTS VIEW */}
      {isAuthenticated && page === 'appointments' && (
        <main className="min-h-screen">
          <AppointmentHistory
            onBack={() => {
              setPage(isEmployerRole ? 'employer' : 'dashboard');
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

      {/* 5. PATIENT CONVERSATION & TRIAGE HISTORY */}
      {isAuthenticated && page === 'conversations' && (
        <main className="min-h-screen">
          <ConversationHistory
            onBack={() => setPage(isEmployerRole ? 'employer' : 'dashboard')}
            sessionId={sessionId}
            onStartNewChat={() => setIsChatOpen(true)}
          />
        </main>
      )}

      {/* 6. SPECIALIST DOCTORS DIRECTORY */}
      {isAuthenticated && page === 'doctors' && (
        <main className="min-h-screen">
          <DoctorDirectory
            onBack={() => setPage(isEmployerRole ? 'employer' : 'dashboard')}
            onBook={(doctorId: string) => {
              setSelectedDoctor(doctorId || null);
              setIsBookOpen(true);
            }}
          />
        </main>
      )}

      {/* Book Appointment Modal (Accessible in Portal) */}
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

      {/* Floating Session Badge (Only in Authenticated Portal) */}
      {isAuthenticated && <SessionBadge sessionId={sessionId} />}

      {/* Floating Language Selector */}
      <LanguageSelector variant="floating" />

      {/* 1. Dedicated Patient Login & Registration Modal */}
      <LoginModal
        open={patientLoginOpen}
        onClose={() => setPatientLoginOpen(false)}
        onLogin={handlePatientLoginSuccess}
      />

      {/* 2. Dedicated Employer & Staff Login Modal */}
      <EmployerLoginModal
        open={employerLoginOpen}
        onClose={() => setEmployerLoginOpen(false)}
        onLoginSuccess={handleEmployerLoginSuccess}
      />
    </div>
  );
}

export default App;