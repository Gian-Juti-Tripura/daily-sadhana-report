import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '../../context/LanguageContext';

export const InstallPromptBanner: React.FC = () => {
  const isNative = Capacitor.isNativePlatform();
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 0. Do not show PWA installation prompt inside native Android / iOS apps
    if (isNative) return;

    // 1. Check if already installed & running in standalone mode
    const standaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // 2. Check if user already dismissed or installed before
    const isDismissed = localStorage.getItem('voice_pwa_installed_or_dismissed');
    if (isDismissed) return;

    // 3. Listen for browser native install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowModal(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Fallback: Show on first visit after 1.5s if not standalone
    const timer = setTimeout(() => {
      if (!standaloneMode && !localStorage.getItem('voice_pwa_installed_or_dismissed')) {
        setShowModal(true);
      }
    }, 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('voice_pwa_installed_or_dismissed', 'true');
        setShowModal(false);
      }
      setDeferredPrompt(null);
    } else {
      // If browser doesn't support automatic prompt (e.g. desktop/iOS), guide the user
      alert(
        language === 'bn'
          ? 'ব্রাউজারের অ্যাড্রেস বারে "Install" আইকন (বা মেনু থেকে "Add to Home screen / Install App") ক্লিক করুন।'
          : 'Please click the "Install" icon in your browser address bar (or choose "Install App" from browser menu).'
      );
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
    localStorage.setItem('voice_pwa_installed_or_dismissed', 'true');
  };

  if (isNative || !showModal || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-slate-900 border border-amber-500/30 shadow-2xl text-center space-y-4">
        
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X size={18} />
        </button>

        {/* Icon & Glow */}
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center overflow-hidden ring-2 ring-emerald-400/30">
          <img src="/logo.png" alt="App Logo" className="w-full h-full object-cover rounded-full" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-black">
            <Sparkles size={13} />
            <span>{language === 'bn' ? 'অফিসিয়াল অ্যাপ' : 'Official Web App'}</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {language === 'bn' ? 'সাধনা পোর্টাল অ্যাপ ইনস্টল করুন' : 'Install Sadhana Portal App'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === 'bn'
              ? 'আপনার হোমস্ক্রিনে অ্যাপ হিসেবে যুক্ত করুন। অফলাইনে দ্রুত ও সহজে প্রতিদিন সাধনা রিপোর্ট জমা দিন।'
              : 'Add to your home screen for quick, 1-tap offline access to your daily sadhana records.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleInstallClick}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-md shadow-amber-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={16} />
            <span>{language === 'bn' ? 'অ্যাপ ইনস্টল করুন' : 'Install App Now'}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            {language === 'bn' ? 'পরে করব (ওয়েব ব্রাউজার চালিয়ে যান)' : 'Not now (Continue in browser)'}
          </button>
        </div>

      </div>
    </div>
  );
};
