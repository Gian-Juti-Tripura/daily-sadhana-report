import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CounselorNavbar } from './components/layout/CounselorNavbar';
import { CounselorFooter } from './components/layout/CounselorFooter';
import { DailySadhanaReportPage } from './pages/daily-report/DailySadhanaReportPage';
import { DigitalSadhanaCardPage } from './pages/sadhana-card/DigitalSadhanaCardPage';
import { CounselorDeskPage } from './pages/counselor/CounselorDeskPage';
import { DevoteeProfileModal } from './components/profile/DevoteeProfileModal';
import { ThemeCustomizerModal } from './components/theme/ThemeCustomizerModal';
import { DevoteeAuthModal } from './components/auth/DevoteeAuthModal';
import { DevoteeLoginScreen } from './components/auth/DevoteeLoginScreen';
import { InstallPromptBanner } from './components/pwa/InstallPromptBanner';
import { FallingFlowers } from './components/effects/FallingFlowers';
import { Toaster } from 'react-hot-toast';
import { 
  getRegisteredCounselees, 
  addRegisteredCounselee, 
  DEFAULT_GUEST_DEVOTEE,
  PRIMARY_COUNSELOR 
} from './data/counseleesData';
import { supabase } from './supabase/supabaseClient';
import type { CounseleeProfile } from './types/sadhana';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DAILY_REPORT' | 'DIGITAL_CARD' | 'COUNSELOR_DESK'>('DAILY_REPORT');
  const { settings, paletteConfig } = useTheme();

  // Authentication state: if no saved logged in user ID, show DevoteeLoginScreen
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('voice_logged_in_user_id');
  });

  // Active Devotee state: defaults to saved devotee if logged in, or DEFAULT_GUEST_DEVOTEE
  const counselees = getRegisteredCounselees();
  const [activeDevotee, setActiveDevotee] = useState<CounseleeProfile>(() => {
    const savedId = localStorage.getItem('voice_active_devotee_id') || localStorage.getItem('voice_logged_in_user_id');
    const found = counselees.find(c => c.id === savedId);
    const initial = found || (localStorage.getItem('voice_logged_in_user_id') ? counselees[0] : DEFAULT_GUEST_DEVOTEE);
    const savedCounselor = localStorage.getItem(`voice_counselor_${initial.id}`) || localStorage.getItem('voice_selected_counselor');
    if (savedCounselor && initial.counselorName !== savedCounselor) {
      return {
        ...initial,
        counselorName: savedCounselor
      };
    }
    return initial;
  });

  // Modal states: Modals only triggered by explicit user action
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync Supabase Auth session on mount and changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const userEmail = session.user.email?.toLowerCase();
        const list = getRegisteredCounselees();
        let devotee = userEmail ? list.find(d => d.email && d.email.toLowerCase() === userEmail) : null;
        if (!devotee && session.user.id) {
          devotee = list.find(d => d.id === session.user.id);
        }
        if (!devotee && userEmail) {
          devotee = addRegisteredCounselee({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || userEmail.split('@')[0],
            email: userEmail,
            counselorName: session.user.user_metadata?.counselor || PRIMARY_COUNSELOR.name,
            scaleId: 2,
            spiritualTitle: 'Bhakti Aspirant'
          });
        }
        if (devotee) {
          handleSelectDevotee(devotee);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const userEmail = session.user.email?.toLowerCase();
        const list = getRegisteredCounselees();
        let devotee = userEmail ? list.find(d => d.email && d.email.toLowerCase() === userEmail) : null;
        if (!devotee && userEmail) {
          devotee = addRegisteredCounselee({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || userEmail.split('@')[0],
            email: userEmail,
            counselorName: session.user.user_metadata?.counselor || PRIMARY_COUNSELOR.name,
            scaleId: 2,
            spiritualTitle: 'Bhakti Aspirant'
          });
        }
        if (devotee) {
          handleSelectDevotee(devotee);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setActiveDevotee(DEFAULT_GUEST_DEVOTEE);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleOpenAuth = () => setIsAuthModalOpen(true);
    const handleOpenProfile = () => setIsProfileModalOpen(true);
    const handleLogoutEvent = () => {
      setIsAuthenticated(false);
      setIsAuthModalOpen(false);
      setActiveDevotee(DEFAULT_GUEST_DEVOTEE);
    };

    const handleCounselorUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setActiveDevotee((prev) => ({
          ...prev,
          counselorName: customEvent.detail
        }));
      }
    };

    const handleDevoteesUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<CounseleeProfile>;
      const updated = customEvent.detail;
      if (updated) {
        setActiveDevotee((prev) => (updated.id === prev.id ? updated : prev));
      } else {
        const list = getRegisteredCounselees();
        setActiveDevotee((prev) => list.find(c => c.id === prev.id) || prev);
      }
    };

    window.addEventListener('open_voice_auth_modal', handleOpenAuth);
    window.addEventListener('open_devotee_profile_modal', handleOpenProfile);
    window.addEventListener('voice_devotee_logged_out', handleLogoutEvent);
    window.addEventListener('voice_counselor_changed', handleCounselorUpdate);
    window.addEventListener('voice_devotees_updated', handleDevoteesUpdated);

    return () => {
      window.removeEventListener('open_voice_auth_modal', handleOpenAuth);
      window.removeEventListener('open_devotee_profile_modal', handleOpenProfile);
      window.removeEventListener('voice_devotee_logged_out', handleLogoutEvent);
      window.removeEventListener('voice_counselor_changed', handleCounselorUpdate);
      window.removeEventListener('voice_devotees_updated', handleDevoteesUpdated);
    };
  }, []);

  const handleSelectDevotee = (devotee: CounseleeProfile) => {
    const savedCounselor = localStorage.getItem(`voice_counselor_${devotee.id}`) || devotee.counselorName;
    const effectiveDevotee = savedCounselor ? { ...devotee, counselorName: savedCounselor } : devotee;
    setActiveDevotee(effectiveDevotee);
    localStorage.setItem('voice_active_devotee_id', devotee.id);
    localStorage.setItem('voice_logged_in_user_id', devotee.id);
    if (effectiveDevotee.counselorName) {
      localStorage.setItem('voice_selected_counselor', effectiveDevotee.counselorName);
      localStorage.setItem(`voice_counselor_${devotee.id}`, effectiveDevotee.counselorName);
    }
  };

  // If user is not authenticated, show the clean, professional, dedicated login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors relative">
        <Toaster 
          position="top-right" 
          toastOptions={{
            className: 'dark:bg-slate-800 dark:text-white text-xs font-semibold rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700',
            duration: 3000
          }}
        />
        <DevoteeLoginScreen
          onLoginSuccess={(devotee) => {
            handleSelectDevotee(devotee);
            setIsAuthenticated(true);
          }}
        />
        <InstallPromptBanner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors relative">
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'dark:bg-slate-800 dark:text-white text-xs font-semibold rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700',
          duration: 3000
        }}
      />

      {/* Floating Floral Shower (User-controlled via Theme modal) */}
      {settings.flowerShower && <FallingFlowers />}

      {/* Ambient Divine Lighting & Sunrays (Aura glow matching active theme palette) */}
      {settings.lightingEffects && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full blur-[110px] opacity-30 dark:opacity-20 z-0 transition-all duration-700"
          style={{ background: paletteConfig.cardGlow || paletteConfig.primaryHex }}
        />
      )}

      {/* Sri Krishna Spiritual Sky (Devotional background pattern) */}
      {settings.backgroundAtmosphere && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.045] bg-[radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:24px_24px] transition-opacity"
        />
      )}

      {/* Top Navbar */}
      <CounselorNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        activeDevotee={activeDevotee}
        currentDevoteeName={activeDevotee.name}
      />

      {/* Main Dynamic View Area */}
      <main className="flex-1 relative z-10">
        {activeTab === 'DAILY_REPORT' && (
          <DailySadhanaReportPage
            activeDevotee={activeDevotee}
            onDevoteeChange={handleSelectDevotee}
          />
        )}

        {activeTab === 'DIGITAL_CARD' && (
          <DigitalSadhanaCardPage
            activeDevotee={activeDevotee}
            onDevoteeChange={handleSelectDevotee}
          />
        )}

        {activeTab === 'COUNSELOR_DESK' && (
          <CounselorDeskPage
            activeDevotee={activeDevotee}
            onSelectDevotee={handleSelectDevotee}
            onSwitchToCard={() => setActiveTab('DIGITAL_CARD')}
          />
        )}
      </main>

      {/* Bottom Footer with Devotee & Counselor name */}
      <CounselorFooter
        currentDevoteeName={activeDevotee.name}
        counselorName={activeDevotee.counselorName}
      />

      {/* Modals */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <DevoteeProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        selectedDevotee={activeDevotee}
        onSelectDevotee={handleSelectDevotee}
      />

      {/* Devotee Account & Logout Modal */}
      <DevoteeAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        activeDevotee={activeDevotee}
        onSelectDevotee={handleSelectDevotee}
      />

      {/* PWA Install Modal (Triggered on demand) */}
      <InstallPromptBanner />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}
