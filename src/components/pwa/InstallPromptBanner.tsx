import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Share2, PlusSquare, CheckCircle2, ChevronLeft, Laptop, Smartphone } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '../../context/LanguageContext';

export const InstallPromptBanner: React.FC = () => {
  const isNative = Capacitor.isNativePlatform();
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Platform detection
  const isIos = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );

  useEffect(() => {
    // 0. Do not show inside native Android / iOS Capacitor apps
    if (isNative) return;

    // 1. Check if already installed & running in standalone mode
    const standaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // 2. Clear legacy persistent block so users previously locked out can see the prompt
    localStorage.removeItem('voice_pwa_installed_or_dismissed');

    // 3. Listen for browser's native beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const isDismissed = sessionStorage.getItem('sadhana_pwa_dismissed_session');
      if (!isDismissed) {
        setShowModal(true);
      }
    };

    // 4. Custom event for manual trigger from navbar or menu
    const handleManualOpen = () => {
      setShowInstructions(false);
      setShowModal(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('open_pwa_install_modal', handleManualOpen);

    // 5. Automatic pop-up fallback on page visit (500ms delay for smooth appearance)
    const timer = setTimeout(() => {
      const isDismissed = sessionStorage.getItem('sadhana_pwa_dismissed_session');
      if (!standaloneMode && !isDismissed) {
        setShowModal(true);
      }
    }, 500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open_pwa_install_modal', handleManualOpen);
      clearTimeout(timer);
    };
  }, [isNative]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          sessionStorage.setItem('sadhana_pwa_dismissed_session', 'true');
          setShowModal(false);
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
      setDeferredPrompt(null);
    } else {
      // If browser does not support automatic one-click prompt (e.g. Safari or Desktop Chrome), show visual guide
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
    setShowInstructions(false);
    sessionStorage.setItem('sadhana_pwa_dismissed_session', 'true');
  };

  if (isNative || !showModal || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-[28px] p-6 bg-white dark:bg-slate-900 border border-amber-500/30 shadow-2xl text-center space-y-4 overflow-hidden">
        
        {/* Soft Ambient Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-32 bg-gradient-to-b from-amber-400/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10"
          title="Dismiss"
        >
          <X size={18} />
        </button>

        {/* Normal View */}
        {!showInstructions ? (
          <>
            {/* Icon & Golden Aura */}
            <div className="mx-auto relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 p-[2px] shadow-lg shadow-emerald-500/20 flex items-center justify-center overflow-hidden ring-2 sm:ring-4 ring-emerald-500/20">
              <img 
                src="/logo.png" 
                alt="Sadhana" 
                className="w-full h-full object-cover rounded-full" 
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
              />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-black">
                <Sparkles size={13} />
                <span>{language === 'bn' ? 'অফিসিয়াল পিডব্লিউএ • Sadhana' : 'Official PWA • Sadhana'}</span>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === 'bn' ? 'সাধনা অ্যাপ ইনস্টল করুন' : 'Install Sadhana App'}
              </h3>
              
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed px-1">
                {language === 'bn'
                  ? 'আপনার মোবাইল বা কম্পিউটারে "সাধনা" অ্যাপটি যুক্ত করুন। ১-ট্যাপে দ্রুত ও সহজে অফলাইনেও সাধনা রিপোর্ট জমা দিন।'
                  : 'Add "Sadhana" to your home screen or desktop for fast, 1-tap offline access to your daily spiritual records.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-lg shadow-amber-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={17} className="animate-bounce" />
                <span>{language === 'bn' ? 'সাধনা অ্যাপ ইনস্টল করুন' : 'Install Sadhana App Now'}</span>
              </button>

              <button
                onClick={handleDismiss}
                className="w-full py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'পরে করব (ব্রাউজারে চালিয়ে যান)' : 'Not now (Continue in browser)'}
              </button>
            </div>
          </>
        ) : (
          /* Step-by-Step Device Guide */
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInstructions(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                {isIos ? <Smartphone size={16} className="text-amber-500" /> : <Laptop size={16} className="text-amber-500" />}
                <span>
                  {isIos 
                    ? (language === 'bn' ? 'আইফোন / সাফারিতে ইনস্টল করার নিয়ম' : 'How to install on iOS Safari')
                    : (language === 'bn' ? 'ব্রাউজারে ইনস্টল করার নিয়ম' : 'How to install in browser')}
                </span>
              </h4>
            </div>

            {isIos ? (
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    <Share2 size={15} />
                  </div>
                  <p>
                    {language === 'bn'
                      ? '১. সাফারির নিচে থাকা শেয়ার (Share) আইকনে ট্যাপ করুন।'
                      : '1. Tap the Share icon at the bottom of Safari.'}
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <PlusSquare size={15} />
                  </div>
                  <p>
                    {language === 'bn'
                      ? '২. মেনুটি স্ক্রল করে "Add to Home Screen"-এ ট্যাপ করুন।'
                      : '2. Scroll down and tap "Add to Home Screen".'}
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <p>
                    {language === 'bn'
                      ? '৩. উপরে ডানে "Add" চাপুন। সাধনা অ্যাপ আপনার ফোনে যুক্ত হবে।'
                      : '3. Tap "Add" in the top right. Sadhana is now installed!'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    <Download size={15} />
                  </div>
                  <p>
                    {language === 'bn'
                      ? '১. অ্যাড্রেস বারের ডানপাশে থাকা "Install" আইকনটিতে ক্লিক করুন।'
                      : '1. Click the "Install" icon in your browser address bar.'}
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <p>
                    {language === 'bn'
                      ? '২. অথবা ব্রাউজার মেনু (⋮) থেকে "Install Sadhana" বেছে নিন।'
                      : '2. Or choose "Install Sadhana" from the browser menu (⋮).'}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleDismiss}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'বুঝেছি (বন্ধ করুন)' : 'Got it (Close)'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
