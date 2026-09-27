import React, { useState, useEffect } from 'react';
import { 
  Download, X, Sparkles, Share2, PlusSquare, CheckCircle2, 
  ChevronLeft, Laptop, Smartphone, Check, ArrowDownToLine, 
  Info, AlertCircle 
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-hot-toast';

export const InstallPromptBanner: React.FC = () => {
  const isNative = Capacitor.isNativePlatform();
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installStatusMsg, setInstallStatusMsg] = useState<string | null>(null);

  // Platform detection
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
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

    // 2. Check if early beforeinstallprompt was already captured on window
    if ((window as any).deferredInstallPrompt) {
      setDeferredPrompt((window as any).deferredInstallPrompt);
    }

    // 3. Listen for browser's native beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredInstallPrompt = e;
      setDeferredPrompt(e);
      setInstallStatusMsg(null);
    };

    const handlePromptReady = () => {
      if ((window as any).deferredInstallPrompt) {
        setDeferredPrompt((window as any).deferredInstallPrompt);
        setInstallStatusMsg(null);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as any).deferredInstallPrompt = null;
      sessionStorage.setItem('sadhana_pwa_installed', 'true');
      toast.success(language === 'bn' ? 'সাধনা অ্যাপ সফলভাবে ইনস্টল হয়েছে!' : 'Sadhana app installed successfully!');
      setTimeout(() => setShowModal(false), 2500);
    };

    // 4. Custom event for manual trigger from navbar or menu
    const handleManualOpen = () => {
      setShowInstructions(false);
      setInstallStatusMsg(null);
      // Re-check deferredPrompt from window
      if ((window as any).deferredInstallPrompt) {
        setDeferredPrompt((window as any).deferredInstallPrompt);
      }
      setShowModal(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa_prompt_ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa_installed_success', handleAppInstalled);
    window.addEventListener('open_pwa_install_modal', handleManualOpen);

    // 5. Automatic pop-up fallback on first visit (800ms delay)
    const isDismissed = sessionStorage.getItem('sadhana_pwa_dismissed_session');
    const hasInstalled = sessionStorage.getItem('sadhana_pwa_installed');
    if (!standaloneMode && !isDismissed && !hasInstalled) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 800);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('pwa_prompt_ready', handlePromptReady);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('pwa_installed_success', handleAppInstalled);
        window.removeEventListener('open_pwa_install_modal', handleManualOpen);
        clearTimeout(timer);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa_prompt_ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa_installed_success', handleAppInstalled);
      window.removeEventListener('open_pwa_install_modal', handleManualOpen);
    };
  }, [isNative, language]);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || (window as any).deferredInstallPrompt;

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          sessionStorage.setItem('sadhana_pwa_installed', 'true');
          toast.success(language === 'bn' ? 'ইনস্টল প্রক্রিয়া শুরু হয়েছে!' : 'Installation started!');
          setTimeout(() => setShowModal(false), 2000);
        } else {
          setInstallStatusMsg(
            language === 'bn' 
              ? 'ইনস্টল বাতিল করা হয়েছে। আপনি চাইলে নিচের নির্দেশিকা দেখে ব্রাউজার মেনু থেকে ইনস্টল করতে পারেন।' 
              : 'Installation was cancelled. You can still install via the browser menu below.'
          );
        }
      } catch (err) {
        console.error('Install prompt error:', err);
        setShowInstructions(true);
      }
      setDeferredPrompt(null);
      (window as any).deferredInstallPrompt = null;
    } else {
      // Browser didn't expose native 1-click prompt (e.g. Safari, Firefox, or localhost without prompt)
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
    setShowInstructions(false);
    setInstallStatusMsg(null);
    sessionStorage.setItem('sadhana_pwa_dismissed_session', 'true');
  };

  if (isNative || !showModal || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-[28px] p-5 sm:p-6 bg-white dark:bg-slate-900 border border-amber-500/30 shadow-2xl text-center space-y-4 overflow-hidden">
        
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

        {/* Success View */}
        {isInstalled ? (
          <div className="py-6 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <Check size={28} className="stroke-[3]" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {language === 'bn' ? 'সাধনা অ্যাপ সফলভাবে ইনস্টল হয়েছে!' : 'Sadhana Installed!'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn' 
                ? 'অ্যাপটি এখন আপনার হোমস্ক্রিন বা অ্যাপ তালিকায় যুক্ত হয়েছে।' 
                : 'The app is now added to your home screen / app launcher.'}
            </p>
            <button
              onClick={handleDismiss}
              className="mt-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {language === 'bn' ? 'সম্পন্ন' : 'Done'}
            </button>
          </div>
        ) : !showInstructions ? (
          /* Normal View */
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
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] font-black">
                <Sparkles size={12} />
                <span>{language === 'bn' ? 'অফিসিয়াল অ্যাপ • Sadhana' : 'Official App • Sadhana'}</span>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === 'bn' ? 'সাধনা অ্যাপ ইনস্টল করুন' : 'Install Sadhana App'}
              </h3>
              
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed px-1">
                {language === 'bn'
                  ? 'আপনার মোবাইল বা কম্পিউটারে ১-ট্যাপে ইনস্টল করে দ্রুত ও নিরাপদে অফলাইনেও সাধনা রিপোর্ট পরিচালনা করুন।'
                  : 'Install on your phone or desktop for instant, 1-tap offline access to your daily sadhana records.'}
              </p>
            </div>

            {/* Status or warning alert if any */}
            {installStatusMsg && (
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5 text-left">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>{installStatusMsg}</span>
              </div>
            )}

            {/* Main Action Buttons */}
            <div className="pt-2 space-y-2.5">
              {/* Option A: Browser Native 1-Click PWA Install (if browser supports it) */}
              {(deferredPrompt || (window as any).deferredInstallPrompt) ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-lg shadow-amber-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={18} className="animate-bounce" />
                  <span>{language === 'bn' ? '১-ক্লিকে অ্যাপ ইনস্টল করুন' : '1-Click Install App Now'}</span>
                </button>
              ) : (
                /* If 1-click prompt is not supported by browser, show clear options */
                <button
                  type="button"
                  onClick={() => setShowInstructions(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusSquare size={17} />
                  <span>{language === 'bn' ? 'হোমস্ক্রিনে যুক্ত করার নিয়ম দেখুন' : 'How to Add to Home Screen'}</span>
                </button>
              )}

              {/* Option B: Direct Android APK Download Button (For Android & General Mobile Users) */}
              <a
                href="/Sadhana_app.apk"
                download="Sadhana_app.apk"
                onClick={() => {
                  toast.success(language === 'bn' ? 'অ্যান্ড্রয়েড এপিকে ডাউনলোড হচ্ছে...' : 'Downloading Android APK...');
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowDownToLine size={15} />
                <span>{language === 'bn' ? 'অ্যান্ড্রয়েড APK সরাসরি ডাউনলোড (18 MB)' : 'Download Android APK Directly (18 MB)'}</span>
              </a>

              {/* Secondary Close / Browser Continue Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'পরে করব (ব্রাউজারে চালিয়ে যান)' : 'Not now (Continue in browser)'}
              </button>
            </div>
          </>
        ) : (
          /* Step-by-Step Device Guide */
          <div className="space-y-3.5 text-left">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInstructions(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                {isIos ? <Smartphone size={16} className="text-amber-500" /> : isAndroid ? <Smartphone size={16} className="text-emerald-500" /> : <Laptop size={16} className="text-amber-500" />}
                <span>
                  {isIos 
                    ? (language === 'bn' ? 'আইফোন / সাফারিতে ইনস্টল করার নিয়ম' : 'How to install on iOS Safari')
                    : isAndroid
                    ? (language === 'bn' ? 'অ্যান্ড্রয়েডে ইনস্টল বা APK ডাউনলোড' : 'Install on Android / Download APK')
                    : (language === 'bn' ? 'ব্রাউজারে ইনস্টল করার নিয়ম' : 'How to install in browser')}
                </span>
              </h4>
            </div>

            {/* Clarification banner why native prompt didn't pop up */}
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
              <span>
                {language === 'bn'
                  ? 'আপনার বর্তমান ব্রাউজার স্বয়ংক্রিয় ১-ক্লিক পপআপ সমর্থন করে না। নিচের সহজ নিয়মে ম্যানুয়ালি যুক্ত করুন অথবা সরাসরি APK ডাউনলোড করুন:'
                  : 'Your browser requires manual confirmation. Follow the steps below or download the APK directly:'}
              </span>
            </div>

            {isIos ? (
              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
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
            ) : isAndroid ? (
              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ArrowDownToLine size={15} />
                  </div>
                  <p>
                    {language === 'bn'
                      ? '১. সবচেয়ে সহজ: নিচে থাকা "সরাসরি Android APK ডাউনলোড" চাপুন ও ফাইলটি ওপেন করে ইনস্টল করুন।'
                      : '1. Easiest: Tap "Download Android APK" below and open the file to install.'}
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    <Download size={15} />
                  </div>
                  <p>
                    {language === 'bn'
                      ? '২. অথবা ক্রোম ব্রাউজারের থ্রি-ডট মেনু (⋮) চেপে "Install app" বা "Add to Home screen" চাপুন।'
                      : '2. Or tap Chrome menu (⋮) and select "Install app" or "Add to Home screen".'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    <Download size={15} />
                  </div>
                  <p>
                    {language === 'bn'
                      ? '১. অ্যাড্রেস বারের ডানপাশে থাকা [⊕ Install] আইকনটিতে ক্লিক করুন।'
                      : '1. Click the [⊕ Install] icon in your browser address bar.'}
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <p>
                    {language === 'bn'
                      ? '২. অথবা ব্রাউজার মেনু (⋮) থেকে "Install Sadhana" বা "Add to Home screen" চাপুন।'
                      : '2. Or choose "Install Sadhana" or "Add to Home screen" from the browser menu (⋮).'}
                  </p>
                </div>
              </div>
            )}

            {/* Direct APK Download fallback link inside instructions */}
            <a
              href="/Sadhana_app.apk"
              download="Sadhana_app.apk"
              onClick={() => {
                toast.success(language === 'bn' ? 'অ্যান্ড্রয়েড এপিকে ডাউনলোড হচ্ছে...' : 'Downloading Android APK...');
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowDownToLine size={15} />
              <span>{language === 'bn' ? 'অথবা সরাসরি Android APK ডাউনলোড করুন' : 'Or Download Android APK Directly'}</span>
            </a>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'বুঝেছি (বন্ধ করুন)' : 'Got it (Close)'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
