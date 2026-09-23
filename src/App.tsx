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
import { InstallPromptBanner } from './components/pwa/InstallPromptBanner';
import { FallingFlowers } from './components/effects/FallingFlowers';
import { Toaster } from 'react-hot-toast';
import { getRegisteredCounselees } from './data/counseleesData';
import type { CounseleeProfile } from './types/sadhana';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DAILY_REPORT' | 'DIGITAL_CARD' | 'COUNSELOR_DESK'>('DAILY_REPORT');
  const { settings, paletteConfig } = useTheme();

  // Active Devotee state
  const counselees = getRegisteredCounselees();
  const [activeDevotee, setActiveDevotee] = useState<CounseleeProfile>(() => {
    const savedId = localStorage.getItem('voice_active_devotee_id');
    const found = counselees.find(c => c.id === savedId);
    const initial = found || counselees[0];
    const savedCounselor = localStorage.getItem(`voice_counselor_${initial.id}`) || localStorage.getItem('voice_selected_counselor');
    if (savedCounselor && initial.counselorName !== savedCounselor) {
      return {
        ...initial,
        counselorName: savedCounselor
      };
    }
    return initial;
  });

  // Modal states: Login window appears first upon opening the app
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => {
    const isLoggedIn = localStorage.getItem('voice_logged_in_user_id');
    const dismissedThisSession = sessionStorage.getItem('voice_login_dismissed_session');
    return !isLoggedIn || !dismissedThisSession;
  });

  useEffect(() => {
    const handleOpenAuth = () => setIsAuthModalOpen(true);
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
    window.addEventListener('voice_counselor_changed', handleCounselorUpdate);
    window.addEventListener('voice_devotees_updated', handleDevoteesUpdated);

    return () => {
      window.removeEventListener('open_voice_auth_modal', handleOpenAuth);
      window.removeEventListener('voice_counselor_changed', handleCounselorUpdate);
      window.removeEventListener('voice_devotees_updated', handleDevoteesUpdated);
    };
  }, []);

  const handleSelectDevotee = (devotee: CounseleeProfile) => {
    const savedCounselor = localStorage.getItem(`voice_counselor_${devotee.id}`) || devotee.counselorName;
    const effectiveDevotee = savedCounselor ? { ...devotee, counselorName: savedCounselor } : devotee;
    setActiveDevotee(effectiveDevotee);
    localStorage.setItem('voice_active_devotee_id', devotee.id);
    if (effectiveDevotee.counselorName) {
      localStorage.setItem('voice_selected_counselor', effectiveDevotee.counselorName);
      localStorage.setItem(`voice_counselor_${devotee.id}`, effectiveDevotee.counselorName);
    }
  };

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

      {/* Devotee Login / Sign Up / Log Out Modal (triggered by 3-bar button) */}
      <DevoteeAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        activeDevotee={activeDevotee}
        onSelectDevotee={handleSelectDevotee}
      />

      {/* PWA Install Prompt Banner */}
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
